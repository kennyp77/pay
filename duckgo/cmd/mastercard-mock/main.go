package main

import (
	"crypto/x509"
	"encoding/pem"
	"errors"
	"flag"
	"fmt"
	"io/ioutil"
	xlog "log"
	"net"
	"os"
	"os/signal"
	"syscall"

	"gopkg.in/square/go-jose.v2"

	"a.yandex-team.ru/library/go/core/log"
	"a.yandex-team.ru/library/go/core/log/zap"

	"a.yandex-team.ru/pay/duckgo/mastercard"
	"a.yandex-team.ru/pay/duckgo/mastercard/mcmock"
)

func main() {
	var (
		listenAddr string
		serviceID  string
		keyPath    string
	)
	flag.StringVar(&listenAddr, "listen", "", "Listen address. For example, localhost:2021")
	flag.StringVar(&serviceID, "service-id", "", "SRC Service ID")
	flag.StringVar(&keyPath, "encryption-pub-key", "", "Path to public part of encryption key in pem format")
	flag.Parse()

	if listenAddr == "" || keyPath == "" {
		flag.Usage()
		return
	}

	if serviceID == "" {
		if envName, ok := os.LookupEnv("MASTERCARD_SERVICE_ID"); ok {
			serviceID = envName
		} else {
			serviceID = "yandex-pay-sandbox"
		}
	}

	logger, err := zap.NewDeployLogger(log.DebugLevel)
	if err != nil {
		xlog.Fatalf("Can't create zap logger: %v", err)
	}

	l, err := net.Listen("tcp", listenAddr)
	if err != nil {
		logger.Fatal("Can't listen address",
			log.String("listen_addr", listenAddr),
			log.Error(err),
		)
	}

	pubKey, err := readPublicKey(keyPath)
	if err != nil {
		logger.Fatal("Can't read public key",
			log.String("path", keyPath),
			log.Error(err),
		)
	}

	mock := mcmock.NewSRCServer(logger, mcmock.WithListener(l))
	mock.RegisterService(serviceID, &mcmock.Service{EncryptionKey: *pubKey})

	mock.EnrollCardWithFixedCardID(
		serviceID,
		"cb4bf81e-ffc0-4109-82d4-562805eb1a54",
		&mastercard.Card{
			PrimaryAccountNumber: "5555555555554444",
			PanExpirationMonth:   "12",
			PanExpirationYear:    "2099",
			CardholderFullName:   "REDLOH DRAC",
			CardSecurityCode:     "322",
		}, &mastercard.Consumer{
			ConsumerIdentity: mastercard.ConsumerIdentity{
				IdentityType:  mastercard.IdentityTypeExternalAccountID,
				IdentityValue: "IdentityValue?",
			},
		})

	mock.EnrollCardWithFixedCardID(
		serviceID,
		"94609684-1580-413e-bbe8-4b7259256d8c",
		&mastercard.Card{
			PrimaryAccountNumber: "4242424242424242",
			PanExpirationMonth:   "12",
			PanExpirationYear:    "2099",
			CardholderFullName:   "REDLOH DRAC",
			CardSecurityCode:     "322",
		}, &mastercard.Consumer{
			ConsumerIdentity: mastercard.ConsumerIdentity{
				IdentityType:  mastercard.IdentityTypeExternalAccountID,
				IdentityValue: "IdentityValue?",
			},
		})

	logger.Info("Serving mocked Mastercard SRC API",
		log.String("base_url", mock.GetBaseURL()),
		log.String("keys_url", mock.GetKeysURL()),
	)

	terminate := make(chan os.Signal, 1)
	signal.Notify(terminate, os.Interrupt, syscall.SIGTERM)
	sig := <-terminate
	xlog.Printf("Received terminate signal: signal=%s", sig.String())

	mock.Close()
}

func readPublicKey(path string) (*jose.JSONWebKey, error) {
	buf, err := ioutil.ReadFile(path)
	if err != nil {
		return nil, err
	}

	block, _ := pem.Decode(buf)
	if block == nil {
		return nil, errors.New("readPublicKey: can't parse PEM block")
	}

	const blockType = "PUBLIC KEY"
	if block.Type != blockType {
		return nil, fmt.Errorf("readPublicKey: expected %s block (SubjectPublicKeyInfo structure), got: %s",
			blockType, block.Type)
	}

	key, err := x509.ParsePKIXPublicKey(block.Bytes)
	if err != nil {
		return nil, err
	}

	return &jose.JSONWebKey{
		Key:       key,
		KeyID:     "service-kid",
		Algorithm: "RSA-OAEP-256",
		Use:       "enc",
	}, nil
}
