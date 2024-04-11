package mastercard

import (
	"encoding/json"
	"errors"
)

type Card struct {
	PrimaryAccountNumber string `json:"primaryAccountNumber"`
	PanExpirationMonth   string `json:"panExpirationMonth"`
	PanExpirationYear    string `json:"panExpirationYear"`
	CardholderFullName   string `json:"cardholderFullName,omitempty"`
	CardSecurityCode     string `json:"cardSecurityCode,omitempty"`
}

func (c *Card) Validate() error {
	if c.PrimaryAccountNumber == "" {
		return errors.New("mastercard: primaryAccountNumber is required")
	}
	if c.PanExpirationMonth == "" {
		return errors.New("mastercard: PanExpirationMonth is required")
	}
	if c.PanExpirationYear == "" {
		return errors.New("mastercard: PanExpirationYear is required")
	}
	return nil
}

type CardSource string

func (s CardSource) String() string {
	return string(s)
}

const (
	CardSourceCardholder CardSource = "CARDHOLDER"
	CardSourceMerchant   CardSource = "MERCHANT"
	CardSourceIssuer     CardSource = "ISSUER"
)

type Consumer struct {
	ConsumerIdentity ConsumerIdentity `json:"consumerIdentity"`
}

type IdentityType string

func (t IdentityType) String() string {
	return string(t)
}

const (
	IdentityTypeExternalAccountID IdentityType = "EXTERNAL_ACCOUNT_ID"
)

type ConsumerIdentity struct {
	IdentityType  IdentityType `json:"identityType"`
	IdentityValue string       `json:"identityValue"`
}

type DigitalCardData struct {
	Status           string          `json:"status"`
	PresentationName string          `json:"presentationName,omitempty"`
	DescriptorName   string          `json:"descriptorName"`
	ArtURI           string          `json:"artUri"`
	PendingEvents    json.RawMessage `json:"pendingEvents,omitempty"`
}

type MaskedCard struct {
	SRCDigitalCardID              string          `json:"srcDigitalCardId"`
	PANBin                        string          `json:"panBin"`
	PANLastFour                   string          `json:"panLastFour"`
	TokenLastFour                 string          `json:"tokenLastFour,omitempty"`
	PANExpirationMonth            string          `json:"panExpirationMonth,omitempty"`
	PANExpirationYear             string          `json:"panExpirationYear,omitempty"`
	PaymentCardDescriptor         string          `json:"paymentCardDescriptor,omitempty"`
	PaymentCardType               string          `json:"paymentCardType,omitempty"`
	ServiceID                     string          `json:"serviceId,omitempty"`
	PaymentAccountReference       string          `json:"paymentAccountReference,omitempty"`
	DateOfCardCreated             string          `json:"dateOfCardCreated"`
	DateOfCardLastUsed            string          `json:"dateOfCardLastUsed,omitempty"`
	CustomerServiceURI            string          `json:"CustomerServiceUri,omitempty"`
	CustomerServiceEmailAddress   string          `json:"CustomerServiceEmailAddress,omitempty"`
	DigitalCardData               DigitalCardData `json:"digitalCardData"`
	MaskedBillingAddress          json.RawMessage `json:"maskedBillingAddress,omitempty"`
	DelegatedAuthenticationModels json.RawMessage `json:"delegatedAuthenticationModels,omitempty"`
}

type ThreeDSPreference string

const (
	ThreeDSPreferenceNone = ThreeDSPreference("NONE")
)

type DPATransactionOptions struct {
	ThreeDSPreference ThreeDSPreference `json:"threeDsPreference"` // OneOf([ThreeDSPreferenceNone, "SELF", "BEHALF"])
}

type Token struct {
	PaymentToken            string `json:"paymentToken"`
	TokenExpirationMonth    string `json:"tokenExpirationMonth"`
	TokenExpirationYear     string `json:"tokenExpirationYear"`
	PaymentAccountReference string `json:"paymentAccountReference"`
}

type Cryptogram struct {
	DynamicDataValue string `json:"dynamicDataValue"`
	DynamicDataType  string `json:"dynamicDataType"`
}
