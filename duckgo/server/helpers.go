package server

import (
	"crypto/ecdsa"
	"crypto/rsa"
	"crypto/x509"
	"encoding/base64"
	"encoding/pem"
	"errors"
	"fmt"
	"io/ioutil"
	"log/syslog"
	"reflect"
	"time"

	zaplog "go.uber.org/zap"
	"go.uber.org/zap/zapcore"

	"a.yandex-team.ru/library/go/core/log"
	"a.yandex-team.ru/library/go/core/log/zap"
	"a.yandex-team.ru/library/go/yandex/tvm"
	"a.yandex-team.ru/library/go/yandex/tvm/tvmtool"

	"a.yandex-team.ru/pay/duckgo/mastercard"
	"a.yandex-team.ru/pay/duckgo/paymenttoken"
	"a.yandex-team.ru/pay/duckgo/pkcs7"
	"a.yandex-team.ru/pay/duckgo/visa"
	"a.yandex-team.ru/pay/duckgo/zapsyslog"
)

func newVisaClient(logger log.Logger, config *ConfigVisa) (*visa.Client, error) {
	enrollTimeout, err := time.ParseDuration(config.EnrollTimeout)
	if err != nil {
		return nil, fmt.Errorf("server: can't parse visa client enroll timeout: %v", err)
	}

	signingKey := &visa.SharedKey{
		KeyID:  config.SigningKey.KeyID,
		Secret: config.SigningKey.Secret,
	}

	verifyingKeys := make([]*visa.SharedKey, 0, len(config.VerifyingKeys))
	for _, key := range config.VerifyingKeys {
		verifyingKeys = append(verifyingKeys, &visa.SharedKey{
			KeyID:  key.KeyID,
			Secret: key.Secret,
		})
	}

	encryptionKey := &visa.SharedKey{
		KeyID:  config.EncryptionKey.KeyID,
		Secret: config.EncryptionKey.Secret,
	}

	return visa.NewClient(&visa.Config{
		Logger:        logger,
		APIHostURL:    config.APIHostURL,
		ClientAppID:   config.ClientAppID,
		SigningKey:    signingKey,
		VerifyingKeys: verifyingKeys,
		EncryptionKey: encryptionKey,
		EnrollTimeout: enrollTimeout,
	}), nil
}

func newMastercardClient(logger log.Logger, config *ConfigMastercard) (*mastercard.Client, error) {
	signingKey, err := loadRSAPrivateKey(config.SigningKeyPath)
	if err != nil {
		return nil, fmt.Errorf("server: can't load mastercard signing key: %v", err)
	}

	encryptionKey, err := loadRSAPrivateKey(config.EncryptionKeyPath)
	if err != nil {
		return nil, fmt.Errorf("server: can't load mastercard encryption key: %v", err)
	}

	keysUpdatePeriod, err := time.ParseDuration(config.KeysUpdatePeriod)
	if err != nil {
		return nil, fmt.Errorf("server: can't parse mastercard keys update period: %v", err)
	}

	keysInitDownloadTimeout, err := time.ParseDuration(config.KeysInitDownloadTimeout)
	if err != nil {
		return nil, fmt.Errorf("server: can't parse mastercard keys init download timeout: %v", err)
	}

	return mastercard.NewClient(&mastercard.Config{
		Logger:                  logger,
		APIHostURL:              config.APIHostURL,
		PublicKeysURL:           config.PublicKeysURL,
		KeysUpdatePeriod:        keysUpdatePeriod,
		KeysInitDownloadTimeout: keysInitDownloadTimeout,
		KeysCachePath:           config.KeysCachePath,
		ConsumerKey:             config.ConsumerKey,
		ServiceID:               config.ServiceID,
		ClientID:                config.ClientID,
		SigningKey:              signingKey,
		EncryptionKey:           encryptionKey,
	}), nil
}

func newTokenSender(config *ConfigPaymentToken) (*paymenttoken.Sender, error) {
	signingKey, err := LoadECDSAPrivateKey(config.SigningKeyPath)
	if err != nil {
		return nil, fmt.Errorf("server: can't load paymenttoken signing key: %v", err)
	}

	signingCert, err := loadIntermediateCert(config.IntermediateCertPath)
	if err != nil {
		return nil, fmt.Errorf("server: can't load paymenttoken signing cert: %v", err)
	}

	return paymenttoken.NewSender(signingKey, signingCert)
}

func newRecipientKeyVerifier(config *ConfigPaymentToken) (*paymenttoken.RecipientKeyVerifier, error) {
	keys := make([]*ecdsa.PublicKey, len(config.RecipientVerificationPublicKeys))
	for i := range config.RecipientVerificationPublicKeys {
		block, err := paymenttoken.ReadPEMBlockFromFile(config.RecipientVerificationPublicKeys[i])
		if err != nil {
			return nil, err
		}

		keys[i], err = paymenttoken.ParseECPublicKeyFromPEM(block)
		if err != nil {
			return nil, err
		}
	}

	if len(keys) == 0 {
		return nil, errors.New("server: expected at least one recipient's verification public key")
	}

	return paymenttoken.NewRecipientKeyVerifier(keys), nil
}

func newLogger(config *ConfigLogger) (log.Logger, error) {
	var level zapcore.Level
	if err := level.UnmarshalText([]byte(config.Level)); err != nil {
		return nil, err
	}

	encoderConfig := zaplog.NewProductionEncoderConfig()
	encoderConfig.EncodeDuration = zapcore.MillisDurationEncoder
	encoderConfig.EncodeTime = zapcore.ISO8601TimeEncoder

	if config.Sink == "syslog" {
		writer, err := syslog.Dial(config.Syslog.Network, config.Syslog.RemoteAddr, syslog.LOG_USER, "")
		if err != nil {
			return nil, err
		}
		encoder := zapcore.NewJSONEncoder(encoderConfig)
		core := zapsyslog.New(level, encoder, writer)
		return zap.NewWithCore(core), nil
	}
	if config.Sink == "stdout" {
		config := zaplog.NewProductionConfig()
		config.EncoderConfig = encoderConfig
		config.DisableStacktrace = true
		config.Level = zaplog.NewAtomicLevelAt(level)
		return zap.New(config)
	}
	if config.Sink == "development" {
		return zap.New(zaplog.NewDevelopmentConfig())
	}

	return nil, fmt.Errorf("server: config: unknown logger sink: %q", config.Sink)
}

// loadRSAPrivateKey loads a RSA private key from PEM container.
func loadRSAPrivateKey(filePath string) (*rsa.PrivateKey, error) {
	privateKey, err := loadPrivateKey(filePath)
	if err != nil {
		return nil, err
	}

	rsaKey, ok := privateKey.(*rsa.PrivateKey)
	if !ok {
		return nil, fmt.Errorf("pem: unexpected key type: %s", reflect.TypeOf(privateKey))
	}

	return rsaKey, nil
}

// LoadECDSAPrivateKey loads a ECDSA private key from PEM container.
func LoadECDSAPrivateKey(filePath string) (*ecdsa.PrivateKey, error) {
	privateKey, err := loadPrivateKey(filePath)
	if err != nil {
		return nil, err
	}

	ecdsaKey, ok := privateKey.(*ecdsa.PrivateKey)
	if !ok {
		return nil, fmt.Errorf("pem: unexpected key type: %s", reflect.TypeOf(privateKey))
	}

	return ecdsaKey, nil
}

// loadPrivateKey loads a private key from PEM container.
func loadPrivateKey(filePath string) (interface{}, error) {
	privateKeyData, err := ioutil.ReadFile(filePath)
	if err != nil {
		return nil, err
	}

	block, _ := pem.Decode(privateKeyData)
	if block == nil {
		return nil, fmt.Errorf("pem: can't load PEM file %s", filePath)
	}

	privateKey, err := x509.ParsePKCS8PrivateKey(block.Bytes)
	if err != nil {
		return nil, fmt.Errorf("pem: error parsing PKCS#8 private key: %w", err)
	}

	return privateKey, nil
}

func loadIntermediateCert(filePath string) (*paymenttoken.IntermediateSigningCert, error) {
	data, err := ioutil.ReadFile(filePath)
	if err != nil {
		return nil, err
	}

	return paymenttoken.ParseIntermediateSigningCert(data)
}

func newTVMClient(config *ConfigTVM) (tvm.Client, error) {
	return tvmtool.NewClient(
		config.TVMToolURL,
		tvmtool.WithAuthToken(config.AuthToken),
		tvmtool.WithSrc(config.Self),
	)
}

func loadCertificate(path string) (*x509.Certificate, error) {
	raw, err := ioutil.ReadFile(path)
	if err != nil {
		return nil, err
	}

	block, _ := pem.Decode(raw)
	if block == nil {
		return nil, errors.New("failed to parse PEM block containing the public key")
	}

	cert, err := x509.ParseCertificate(block.Bytes)
	if err != nil {
		return nil, fmt.Errorf("failed to parse DER encoded public key: %s", err.Error())
	}

	return cert, nil
}

func EncryptCMS(data []byte, cert *x509.Certificate) (string, error) {
	encrypted, err := pkcs7.Encrypt(data, []*x509.Certificate{cert})
	if err != nil {
		return "", fmt.Errorf("failed to encrypt message: %s", err.Error())
	}

	return base64.StdEncoding.EncodeToString(encrypted), nil
}
