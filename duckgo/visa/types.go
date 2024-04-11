package visa

import (
	"errors"
)

type ExpirationDate struct {
	Year  string `json:"year"`
	Month string `json:"month"`
}

type ReqPaymentInstrument struct {
	AccountNumber  string         `json:"accountNumber"`
	ExpirationDate ExpirationDate `json:"expirationDate"`
}

type EnabledServices struct {
	MerchantPresentedQR YesNo `json:"merchantPresentedQR"`
}

type VerificationResults struct {
	Cvv2VerificationCode    CVV2VerificationCode    `json:"cvv2VerificationCode"`
	AddressVerificationCode AddressVerificationCode `json:"addressVerificationCode"`
}

type PaymentInstrument struct {
	Last4                   string              `json:"last4"`
	ExpirationDate          ExpirationDate      `json:"expirationDate"`
	AccountStatus           YesNo               `json:"accountStatus,omitempty"`
	IsTokenizable           YesNo               `json:"isTokenizable,omitempty"`
	ExpDatePrintedInd       YesNo               `json:"expDatePrintedInd"`
	CVV2PrintedInd          YesNo               `json:"cvv2PrintedInd"`
	PaymentAccountReference string              `json:"paymentAccountReference"`
	EnabledServices         EnabledServices     `json:"enabledServices,omitempty"`
	VerificationResults     VerificationResults `json:"verificationResults,omitempty"`
}

type ParamsStatus struct {
	Status ParamsStatusValue  `json:"status"`
	Reason ParamsStatusReason `json:"reason"`
}

type DynParams struct {
	API          string       `json:"api"`
	ParamsStatus ParamsStatus `json:"paramsStatus"`
}

type HCEData struct {
	DynParams DynParams `json:"dynParams"`
}

type TokenInfo struct {
	TokenStatus      TokenStatus    `json:"tokenStatus"`
	TokenRequestorID string         `json:"tokenRequestorID"`
	TokenReferenceID string         `json:"tokenReferenceID"`
	Last4            string         `json:"last4"`
	ExpirationDate   ExpirationDate `json:"expirationDate"`
	AppPrgrmID       string         `json:"appPrgrmID"`
	EncTokenInfo     string         `json:"encTokenInfo"`
	HCEData          HCEData        `json:"hceData"`
}

type PaymentRequest struct {
	TransactionType TransactionType `json:"transactionType"`
}

type CryptogramInfo struct {
	Cryptogram string `json:"cryptogram"`
	ECI        string `json:"eci"`
	ATC        string `json:"atc"`
}

type Token struct {
	Value string `json:"token"`
}

type Card struct {
	PrimaryAccountNumber string `json:"primaryAccountNumber"`
	PanExpirationMonth   string `json:"panExpirationMonth"`
	PanExpirationYear    string `json:"panExpirationYear"`
	CVV2                 string `json:"cvv2,omitempty"`
}

func (c *Card) Validate() error {
	if c.PrimaryAccountNumber == "" {
		return errors.New("visa: primaryAccountNumber is required")
	}
	if c.PanExpirationMonth == "" {
		return errors.New("visa: PanExpirationMonth is required")
	}
	if c.PanExpirationYear == "" {
		return errors.New("visa: PanExpirationYear is required")
	}
	return nil
}

type RiskData struct {
	Name  string `json:"name"`
	Value string `json:"value"`
}
