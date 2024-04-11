package paymenttoken

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"strconv"
	"time"
)

type ProtocolVersion string

const (
	// ProtocolVersionECv2 - actual version
	ProtocolVersionECv2 = ProtocolVersion("ECv2")

	// Yandex - default senderID
	Yandex = "Yandex"
)

const (
	pointFormatUncompressed = "UNCOMPRESSED"
	hashAlgoSHA256          = "SHA256"
	encodingDER             = "DER"
)

// Token - format of encrypted token.
type Token struct {
	Type                    string                   `json:"type"` // sender_id
	SignedMessage           string                   `json:"signedMessage"`
	ProtocolVersion         ProtocolVersion          `json:"protocolVersion"`
	Signature               string                   `json:"signature"`
	IntermediateSigningCert *IntermediateSigningCert `json:"intermediateSigningKey,omitempty"`
}

func ParseToken(serialized string) (*Token, error) {
	b, err := base64.StdEncoding.DecodeString(serialized)
	if err != nil {
		return nil, err
	}

	token := &Token{}
	err = json.Unmarshal(b, token)
	return token, err
}

func (t *Token) Serialize() (string, error) {
	b, err := json.Marshal(t)
	if err != nil {
		return "", err
	}

	return base64.StdEncoding.EncodeToString(b), nil
}

func (t *Token) validate() error {
	if len(t.SignedMessage) == 0 {
		return fmt.Errorf("paymenttoken: signed message is required")
	}
	if len(t.ProtocolVersion) == 0 {
		return fmt.Errorf("paymenttoken: protocol version is required")
	}
	if len(t.Signature) == 0 {
		return fmt.Errorf("paymenttoken: signature is required")
	}

	return nil
}

// SignedMessage - encrypted message structure
type SignedMessage struct {
	EncryptedMessage   string `json:"encryptedMessage"`
	Tag                string `json:"tag"`
	EphemeralPublicKey string `json:"ephemeralPublicKey"`
}

// IntermediateSigningCert - serialized SignedKey signed key and signatures set
type IntermediateSigningCert struct {
	SignedKey  string   `json:"signedKey"`
	Signatures []string `json:"signatures"`
}

func ParseIntermediateSigningCert(data []byte) (*IntermediateSigningCert, error) {
	v := &IntermediateSigningCert{}
	err := json.Unmarshal(data, v)
	return v, err
}

func (cert *IntermediateSigningCert) validate() error {
	if len(cert.SignedKey) == 0 {
		return fmt.Errorf("paymenttoken: signed keys are required")
	}
	if len(cert.Signatures) == 0 {
		return fmt.Errorf("paymenttoken: signatures are required")
	}
	return nil
}

// SignedKey - EC key with expiration time in milliseconds since Unix epoch.
type SignedKey struct {
	KeyValue      string `json:"keyValue"`
	KeyExpiration string `json:"keyExpiration"`
}

func (sk *SignedKey) validate() error {
	if len(sk.KeyValue) == 0 {
		return fmt.Errorf("paymenttoken: key value is required")
	}
	if len(sk.KeyExpiration) == 0 {
		return fmt.Errorf("paymenttoken: key expiration is required")
	}

	now := time.Now().UnixNano() / int64(time.Millisecond)
	expiration, err := strconv.ParseInt(sk.KeyExpiration, 10, 64)
	if err != nil {
		return err
	}

	if now >= expiration {
		return fmt.Errorf("paymenttoken: expired intermediateSigningCert")
	}
	return nil
}

type PaymentMethod string

const (
	PaymentMethodCard PaymentMethod = "CARD"
)

// EncryptedMessage - format of PaymentToken
// https://wiki.yandex-team.ru/yandexpay/public-api/#paymenttoken
type EncryptedMessage struct {
	PaymentMethod           PaymentMethod        `json:"paymentMethod"`
	PaymentMethodDetails    PaymentMethodDetails `json:"paymentMethodDetails"`
	PaymentAccountReference string               `json:"paymentAccountReference,omitempty"`
	TransactionDetails      TransactionDetails   `json:"transactionDetails,omitempty"`
	MITDetails              *MITDetails          `json:"mitDetails,omitempty"`
	MessageID               string               `json:"messageId"`
	MessageExpiration       string               `json:"messageExpiration"`
	GatewayMerchantID       string               `json:"gatewayMerchantId,omitempty"`
}

type AuthMethod string

const (
	AuthMethodCloudToken AuthMethod = "CLOUD_TOKEN"
	AuthMethodPANOnly    AuthMethod = "PAN_ONLY"
)

type PaymentMethodDetails struct {
	AuthMethod      AuthMethod `json:"authMethod"`
	PAN             string     `json:"pan"`
	ExpirationMonth int        `json:"expirationMonth"`
	ExpirationYear  int        `json:"expirationYear"`
	Cryptogram      string     `json:"cryptogram,omitempty"`
	ECI             string     `json:"eci,omitempty"`
}

type TransactionDetails struct {
	Amount   int    `json:"amount"`
	Currency string `json:"currency"`
}

type MITDetails struct {
	Recurring bool `json:"recurring"`
	Deferred  bool `json:"deferred"`
}
