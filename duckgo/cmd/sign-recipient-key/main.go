package main

import (
	"crypto/ecdsa"
	"crypto/x509"
	"encoding/pem"
	"flag"
	"fmt"
	"os"

	"a.yandex-team.ru/pay/duckgo/paymenttoken"
)

func readPublicKeyFromFile(path string) (*ecdsa.PublicKey, error) {
	block, err := paymenttoken.ReadPEMBlockFromFile(path)
	if err != nil {
		return nil, err
	}

	return paymenttoken.ParseECPublicKeyFromPEM(block)
}

func readSigningKeyFromFile(path string) (*ecdsa.PrivateKey, error) {
	block, err := paymenttoken.ReadPEMBlockFromFile(path)
	if err != nil {
		return nil, err
	}

	return decodePrivateKey(block)
}

func decodePrivateKey(block *pem.Block) (*ecdsa.PrivateKey, error) {
	const pemBlockType = "EC PRIVATE KEY"
	if block.Type != pemBlockType {
		return nil, fmt.Errorf("sign-recipient-key: unexpected PEM block type: %s", block.Type)
	}

	return x509.ParseECPrivateKey(block.Bytes)
}

func main() {
	var (
		recipientPublicKeyPath string
		signingKeyPath         string
	)

	flag.StringVar(&recipientPublicKeyPath, "recipient-public-key", "", "Path to recipient public key in PKIX, ASN.1 DER form")
	flag.StringVar(&signingKeyPath, "signing-key", "", "Path to recipient signing/verification key private key in PKCS #8, ASN.1 DER form")
	flag.Parse()

	checkNotEmpty(recipientPublicKeyPath, "-recipient-public-key is required")
	checkNotEmpty(signingKeyPath, "-signing-key is required")

	pubKey, err := readPublicKeyFromFile(recipientPublicKeyPath)
	if err != nil {
		runtimeErrorf("invalid recipient public key: %v", err)
	}

	signingKey, err := readSigningKeyFromFile(signingKeyPath)
	if err != nil {
		runtimeErrorf("invalid signing key: %v", err)
	}

	signer := paymenttoken.NewRecipientKeySigner(signingKey)
	signature := signer.Sign(pubKey)

	fmt.Println(signature)
}

func usageError(msg string) {
	fmt.Println(msg)
	flag.Usage()
	os.Exit(1)
}

func checkNotEmpty(value, err string) {
	if value == "" {
		usageError(err)
	}
}

func runtimeErrorf(format string, a ...interface{}) {
	fmt.Printf(format+"\n", a...)
	os.Exit(2)
}
