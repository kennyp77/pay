package main

import (
	"context"
	"crypto/sha256"
	"encoding/base64"
	"os"
	"strings"
	"time"

	"github.com/gofrs/uuid"

	"a.yandex-team.ru/library/go/core/log"
	"a.yandex-team.ru/library/go/core/log/zap"

	"a.yandex-team.ru/pay/duckgo/visa"
)

var (
	card = visa.Card{
		PrimaryAccountNumber: "4123620072000036",
		PanExpirationMonth:   "12",
		PanExpirationYear:    "2022",
	}
	invalidCard = visa.Card{
		PrimaryAccountNumber: "4123620072001244",
		PanExpirationMonth:   "12",
		PanExpirationYear:    "1022",
	}
	cvvCard = visa.Card{
		PrimaryAccountNumber: "4051069300000507",
		PanExpirationMonth:   "12",
		PanExpirationYear:    "2022",
		CVV2:                 "401",
	}
)

func checkout(client *visa.Client, relationshipID string, provisionedTokenID string) (*visa.PaymentDataResponse, error) {
	checkoutResp, err := client.GetPaymentData(context.Background(), relationshipID,
		provisionedTokenID,
		&visa.PaymentDataRequest{
			ClientPaymentDataID: genUUID(),
			PaymentRequest: visa.PaymentRequest{
				TransactionType: visa.TransactionTypeECOM,
			},
		})
	if err != nil {
		return nil, err
	}

	return checkoutResp, nil
}

func enrollCard(client *visa.Client, relationshipID string, card *visa.Card) (*visa.EnrollCardResponse, error) {
	panSource := visa.PANSourceOnfile
	if card.CVV2 != "" {
		panSource = visa.PANSourceManuallyEntered
	}

	enrollReq, err := client.CreateEnrollRequest(
		"test",
		hashEmail("test@yandex-team.ru"),
		"ru_RU",
		panSource,
		card,
	)

	if err != nil {
		return nil, err
	}

	enrollResp, err := client.EnrollCard(context.Background(), relationshipID, enrollReq)
	if err != nil {
		return nil, err
	}

	decoded, err := client.Decrypt(enrollResp.TokenInfo.EncTokenInfo)
	if err != nil {
		return nil, err
	}
	println("decoded enc token: " + string(decoded))

	return enrollResp, nil
}

func noerr(err error) {
	if err != nil {
		panic(err)
	}
}

func main() {
	signingKeyID := os.Getenv("VISA_SIGNING_KEY_ID")
	signingKeySecret := os.Getenv("VISA_SIGNING_KEY_SECRET")
	encryptionKeyID := os.Getenv("VISA_ENCRYPTION_KEY_ID")
	encryptionKeySecret := os.Getenv("VISA_ENCRYPTION_KEY_SECRET")
	outboundKeyID := os.Getenv("VISA_OUTBOUND_KEY_ID")
	outboundKeySecret := os.Getenv("VISA_OUTBOUND_KEY_SECRET")
	relationshipID := os.Getenv("VISA_RELATIONSHIP_ID")

	logger, err := zap.New(zap.CLIConfig(log.DebugLevel))
	noerr(err)

	client := visa.NewClient(&visa.Config{
		Logger:      logger,
		APIHostURL:  "https://cert.api.visa.com",
		ClientAppID: "YandexPay",
		SigningKey: &visa.SharedKey{
			KeyID:  signingKeyID,
			Secret: signingKeySecret,
		},
		EncryptionKey: &visa.SharedKey{
			KeyID:  encryptionKeyID,
			Secret: encryptionKeySecret,
		},
		VerifyingKeys: []*visa.SharedKey{
			{
				KeyID:  outboundKeyID,
				Secret: outboundKeySecret,
			},
		},
		EnrollTimeout: 16 * time.Second,
		IsDebug:       true,
	})

	enrollResp, err := enrollCard(client, relationshipID, &card)
	noerr(err)

	_, err = enrollCard(client, relationshipID, &cvvCard)
	noerr(err)

	_, err = enrollCard(client, relationshipID, &invalidCard)
	noerr(err)

	checkoutResp, err := checkout(client, relationshipID, enrollResp.ProvisionedTokenID)
	noerr(err)
	println("token: " + checkoutResp.TokenInfo.EncTokenInfo)

	_, err = checkout(client, relationshipID, enrollResp.ProvisionedTokenID)
	noerr(err)
}

func genUUID() string {
	id, err := uuid.NewV4()
	if err != nil {
		panic(err)
	}

	return id.String()
}

func hashEmail(email string) string {
	email = strings.ToLower(email)
	first := sha256.Sum256([]byte(email))

	var second = first
	for i := 0; i < 999; i++ {
		second = sha256.Sum256(second[:])
	}

	final := sha256.Sum256([]byte(string(first[:]) + string(second[:])))
	return base64.RawURLEncoding.EncodeToString(final[:])

}
