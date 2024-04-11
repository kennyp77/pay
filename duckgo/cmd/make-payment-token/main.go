package main

import (
	"crypto/ecdsa"
	"flag"
	"fmt"
	"io/ioutil"
	"os"
	"strconv"
	"time"

	"github.com/gofrs/uuid"

	"a.yandex-team.ru/pay/duckgo/paymenttoken"
	"a.yandex-team.ru/pay/duckgo/server"
)

func usageError(msg string) {
	fmt.Println(msg)
	flag.Usage()
	os.Exit(1)
}

func runtimeErrorf(format string, a ...interface{}) {
	fmt.Printf(format+"\n", a...)
	os.Exit(2)
}

func checkNotEmpty(value, err string) {
	if value == "" {
		usageError(err)
	}
}

func readPKIXPublicKey(path string) (*ecdsa.PublicKey, error) {
	b, err := ioutil.ReadFile(path)
	if err != nil {
		return nil, err
	}

	return paymenttoken.ParseB64ECPublicKey(string(b))
}

func readSigningCert(path string) (*paymenttoken.IntermediateSigningCert, error) {
	b, err := ioutil.ReadFile(path)
	if err != nil {
		return nil, err
	}

	return paymenttoken.ParseIntermediateSigningCert(b)
}

func makeTokenExpiration(d time.Duration) string {
	ts := 1000 * time.Now().Add(d).Unix()
	return strconv.FormatInt(ts, 10)
}

func genUUID() string {
	id, err := uuid.NewV4()
	if err != nil {
		panic(err)
	}
	return id.String()
}

func main() {
	var (
		senderID, recipientID  string
		recipientPublicKeyPath string
		senderSigningKeyPath   string
		senderSigningCertPath  string

		authMethodStr                   string
		pan                             string
		expirationMonth, expirationYear int
		cryptogram, eci                 string
		tokenExpiration                 time.Duration
		amount                          int
		gatewayMerchantID               string
	)
	flag.StringVar(&senderID, "sender-id", paymenttoken.Yandex, "Sender ID")
	flag.StringVar(&recipientID, "recipient-id", "", "Gateway or merchant ID")
	flag.StringVar(&recipientPublicKeyPath, "recipient-public-key", "", "Recipient base64 encoded PKIX public key path")
	flag.StringVar(&senderSigningKeyPath, "sender-signing-key", "", "Sender signing key file in PEM format")
	flag.StringVar(&senderSigningCertPath, "sender-signing-cert", "", "Sender signing cert file (root.json)")

	flag.StringVar(&authMethodStr, "token-auth-method", "", "Token auth method: CLOUD_TOKEN or PAN_ONLY")
	flag.StringVar(&pan, "pan", "", "PAN for token: DPAN or FPAN")
	flag.IntVar(&expirationMonth, "expiration-month", 12, "PAN expiration month")
	flag.IntVar(&expirationYear, "expiration-year", 2030, "PAN expiration year")
	flag.StringVar(&cryptogram, "cryptogram", "", "DPAN cryptogram")
	flag.StringVar(&eci, "eci", "", "Electronic Commerce Indicator")
	flag.DurationVar(&tokenExpiration, "token-expiration", time.Hour, "Token expiration")
	flag.IntVar(&amount, "amount", 100, "Token transaction amount")
	flag.StringVar(&gatewayMerchantID, "gateway-merchant-id", "merchant-id", "gatewayMerchantID in payment token")
	flag.Parse()

	checkNotEmpty(recipientID, "recipient-id is required")
	checkNotEmpty(recipientPublicKeyPath, "recipient-public-key is required")
	checkNotEmpty(senderSigningKeyPath, "sender-signing-key")
	checkNotEmpty(senderSigningCertPath, "sender-signing-cert")

	recipientPublicKey, err := readPKIXPublicKey(recipientPublicKeyPath)
	if err != nil {
		runtimeErrorf("invalid recipient public key: %v", err)
	}

	intermSigningKey, err := server.LoadECDSAPrivateKey(senderSigningKeyPath)
	if err != nil {
		runtimeErrorf("invalid sender signing key: %v", err)
	}

	intermSigningCert, err := readSigningCert(senderSigningCertPath)
	if err != nil {
		runtimeErrorf("invalid sender signing cert: %v", err)
	}

	authMethod := parseAuthMethod(authMethodStr)
	checkNotEmpty(pan, "pan is required")
	if authMethod == paymenttoken.AuthMethodCloudToken {
		checkNotEmpty(cryptogram, "cryptogram is required")
		checkNotEmpty(eci, "eci is required")
	}

	encryptedMessage := &paymenttoken.EncryptedMessage{
		PaymentMethod: paymenttoken.PaymentMethodCard,
		PaymentMethodDetails: paymenttoken.PaymentMethodDetails{
			AuthMethod:      authMethod,
			PAN:             pan,
			ExpirationMonth: expirationMonth,
			ExpirationYear:  expirationYear,
			Cryptogram:      cryptogram,
			ECI:             eci,
		},
		PaymentAccountReference: "fake",
		TransactionDetails: paymenttoken.TransactionDetails{
			Amount:   amount,
			Currency: "RUB",
		},
		MessageID:         genUUID(),
		MessageExpiration: makeTokenExpiration(tokenExpiration),
		GatewayMerchantID: gatewayMerchantID,
	}

	sender, err := paymenttoken.NewSender(intermSigningKey, intermSigningCert, paymenttoken.WithSenderID(senderID))
	if err != nil {
		runtimeErrorf("can't create sender: %v", err)
	}

	token, err := sender.SealJSONMessage(recipientID, encryptedMessage, recipientPublicKey)
	if err != nil {
		runtimeErrorf("can't create token: %v", err)
	}

	fmt.Println(token)
}

func parseAuthMethod(authMethodStr string) paymenttoken.AuthMethod {
	authMethod := paymenttoken.AuthMethod(authMethodStr)
	switch authMethod {
	case paymenttoken.AuthMethodCloudToken:
		return paymenttoken.AuthMethodCloudToken
	case paymenttoken.AuthMethodPANOnly:
		return paymenttoken.AuthMethodPANOnly
	default:
		usageError("unknown token-auth-method")
	}

	panic("unreachable")
}
