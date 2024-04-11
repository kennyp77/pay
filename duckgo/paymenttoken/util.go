package paymenttoken

import (
	"crypto/ecdsa"
	"crypto/x509"
	"encoding/base64"
	"encoding/pem"
	"errors"
	"fmt"
	"io/ioutil"
	"reflect"
	"strconv"
	"time"
)

// ParseECPublicKey - parse ECDSA public key in PKIX, ASN.1 DER form.
func ParseECPublicKey(der []byte) (*ecdsa.PublicKey, error) {
	key, err := x509.ParsePKIXPublicKey(der)
	if err != nil {
		return nil, err
	}

	ecdsaPublicKey, ok := key.(*ecdsa.PublicKey)
	if !ok {
		return nil, fmt.Errorf("paymenttoken: unexpected publickey type: %s", reflect.TypeOf(key))
	}

	return ecdsaPublicKey, nil
}

// ParseB64ECPublicKey - parse base64 encoded ECDSA public key in PKIX,
// ASN.1 DER form.
func ParseB64ECPublicKey(base64EncodedKey string) (*ecdsa.PublicKey, error) {
	pkBytes, err := base64.StdEncoding.DecodeString(base64EncodedKey)
	if err != nil {
		return nil, err
	}

	return ParseECPublicKey(pkBytes)
}

func ParseECPublicKeyFromPEM(block *pem.Block) (*ecdsa.PublicKey, error) {
	const pemBlockType = "PUBLIC KEY"
	if block.Type != pemBlockType {
		return nil, fmt.Errorf("paymenttoken: unexpected PEM block type: %s", block.Type)
	}

	return ParseECPublicKey(block.Bytes)
}

// ParsePKCS8PrivateKey - parse base64 encoded PKCS8 private key
func ParsePKCS8PrivateKey(base64EncodedKey string) (*ecdsa.PrivateKey, error) {
	pkBytes, err := base64.StdEncoding.DecodeString(base64EncodedKey)
	if err != nil {
		return nil, err
	}

	key, err := x509.ParsePKCS8PrivateKey(pkBytes)
	if err != nil {
		return nil, err
	}

	ecdsaPrivateKey, ok := key.(*ecdsa.PrivateKey)
	if !ok {
		return nil, fmt.Errorf("paymenttoken: unexpected privatekey type: %s", reflect.TypeOf(key))
	}

	return ecdsaPrivateKey, nil
}

func parseTimestampInMilliseconds(s string) (t time.Time, err error) {
	ts, err := strconv.ParseInt(s, 10, 64)
	if err != nil {
		return t, err
	}
	return time.Unix(0, ts*int64(time.Millisecond)), nil
}

func ReadPEMBlockFromFile(path string) (*pem.Block, error) {
	b, err := ioutil.ReadFile(path)
	if err != nil {
		return nil, err
	}

	block, _ := pem.Decode(b)
	if block == nil {
		return nil, errors.New("paymenttoken: can't decode PEM block")
	}

	return block, nil
}
