package visa

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/url"
	"path"
	"time"

	"github.com/go-resty/resty/v2"
	"github.com/gofrs/uuid"

	"a.yandex-team.ru/library/go/core/log"
	"a.yandex-team.ru/library/go/core/log/ctxlog"

	"a.yandex-team.ru/pay/duckgo/shared/interactionerror"
	"a.yandex-team.ru/pay/duckgo/shared/middlewares"
)

const (
	xRequestIDHeader     = "X-Request-Id"
	xCorrelationIDHeader = "X-Correlation-Id"
	xResponseHeader      = "X-Response-Id"
)

type Config struct {
	Logger log.Logger

	APIHostURL    string
	ClientAppID   string
	SigningKey    *SharedKey
	VerifyingKeys []*SharedKey
	EncryptionKey *SharedKey
	EnrollTimeout time.Duration
	IsDebug       bool
}

func (c *Config) Validate() error {
	if c.Logger == nil {
		return errors.New("visa: Logger is required")
	}
	if len(c.APIHostURL) == 0 {
		return errors.New("visa: APIHostURL required")
	}
	if len(c.ClientAppID) == 0 {
		return errors.New("visa: ClientAppID required")
	}
	if err := c.SigningKey.Validate(); err != nil {
		return errors.New("visa: " + err.Error())
	}
	if err := c.EncryptionKey.Validate(); err != nil {
		return errors.New("visa: " + err.Error())
	}
	if len(c.VerifyingKeys) == 0 {
		return errors.New("visa: empty verifying keys list")
	}
	for _, key := range c.VerifyingKeys {
		if err := key.Validate(); err != nil {
			return errors.New("visa: " + err.Error())
		}
	}
	return nil
}

type Error struct {
	status           string
	statusCode       int
	message          json.RawMessage
	vtsRequestID     string
	vtsCorrelationID string
	vtsResponseID    string
}

var _ interactionerror.InteractionError = &Error{}

func (e *Error) Error() string {
	return fmt.Sprintf("visa api: [%d] %s {req: %s, resp: %s, correlation: %s}",
		e.statusCode, e.status, e.vtsRequestID, e.vtsResponseID, e.vtsCorrelationID)
}

func (e *Error) LogFields() []log.Field {
	return []log.Field{
		log.Error(e),
		log.String("vts_correlation_id", e.vtsCorrelationID),
		log.String("vts_request_id", e.vtsRequestID),
		log.String("vts_response_id", e.vtsResponseID),
	}
}

func (e *Error) CorrelationHeaders() map[string]string {
	return map[string]string{
		"VTS-Request-ID":     e.vtsRequestID,
		"VTS-Response-ID":    e.vtsResponseID,
		"VTS-Correlation-ID": e.vtsCorrelationID,
	}
}

func (e *Error) GetStatusCode() int {
	return e.statusCode
}

func (e *Error) GetRawMessage() json.RawMessage {
	return e.message
}

func newError(requestID string, resp *resty.Response) *Error {
	return &Error{
		status:           resp.Status(),
		statusCode:       resp.StatusCode(),
		message:          resp.Body(),
		vtsRequestID:     requestID,
		vtsCorrelationID: resp.Header().Get(xCorrelationIDHeader),
		vtsResponseID:    resp.Header().Get(xResponseHeader),
	}
}

type Client struct {
	logger log.Logger

	clientAppID   string
	rc            *resty.Client
	signer        *Signer
	verifier      *Verifier
	jwe           *JWEEncrypter
	enrollTimeout time.Duration
}

func NewClient(config *Config) *Client {
	if err := config.Validate(); err != nil {
		panic(err)
	}

	logger := config.Logger
	rc := resty.New()
	rc.SetDebug(config.IsDebug)
	rc.SetHostURL(config.APIHostURL)
	rc.OnAfterResponse(middlewares.NewResponseLogger("visa outgoing HTTP request complete", logger))
	rc.Header.Set("User-Agent", "Yandex.Pay")

	signer := NewSigner(WithSignerAPIKey(config.SigningKey.KeyID), WithSignerSecret(config.SigningKey.Secret))

	verifierOptions := make([]VerifierOption, 0, len(config.VerifyingKeys))
	for _, key := range config.VerifyingKeys {
		verifierOptions = append(verifierOptions, WithNamedSecret(key.KeyID, key.Secret))
	}
	verifier := NewVerifier(verifierOptions...)

	rc.GetClient().Transport = NewAuthInterceptor(signer, nil)

	jwe := &JWEEncrypter{Key: config.EncryptionKey}

	return &Client{
		logger: config.Logger,

		rc:            rc,
		signer:        signer,
		verifier:      verifier,
		jwe:           jwe,
		clientAppID:   config.ClientAppID,
		enrollTimeout: config.EnrollTimeout,
	}
}

func (c *Client) HealthCheck(context.Context) error {
	return nil
}

func (c *Client) Close() {
}

func (c *Client) Sign(req *http.Request) error {
	return c.signer.Sign(req)
}

func (c *Client) VerifyRequest(url *url.URL, body []byte, signature string) error {
	return c.verifier.VerifyRequest(url, body, signature)
}

func (c *Client) Decrypt(encrypted string) ([]byte, error) {
	return c.jwe.Decrypt(encrypted)
}

func (c *Client) DecryptAndUnmarshall(encrypted string, v interface{}) error {
	return c.jwe.DecryptAndUnmarshal(encrypted, v)
}

func (c *Client) DecryptToken(encryptedToken string) (*Token, error) {
	token := Token{}
	err := c.DecryptAndUnmarshall(encryptedToken, &token)
	if err != nil {
		return nil, err
	}
	return &token, nil
}

type EnrollCardRequest struct {
	EncRiskDataInfo                     string            `json:"encRiskDataInfo,omitempty"`
	EncPaymentInstrument                string            `json:"encPaymentInstrument"`
	PresentationType                    []TransactionType `json:"presentationType"`
	ClientAppID                         string            `json:"clientAppID"`
	ClientWalletAccountID               string            `json:"clientWalletAccountID"`
	ClientWalletAccountEmailAddressHash string            `json:"clientWalletAccountEmailAddressHash"`
	Locale                              string            `json:"locale"`
	ProtectionType                      ProtectionType    `json:"protectionType"`
	PANSource                           PANSource         `json:"panSource"`
	ConsumerEntryMode                   ConsumerEntryMode `json:"consumerEntryMode,omitempty"`
	AccountType                         AccountType       `json:"accountType,omitempty"`
}

type EnrollCardResponse struct {
	ProvisionedTokenID string            `json:"vProvisionedTokenID"`
	PanEnrollmentID    string            `json:"vPanEnrollmentID"`
	PaymentInstrument  PaymentInstrument `json:"paymentInstrument"`
	TokenInfo          TokenInfo         `json:"tokenInfo"`
	VTSRequestID       string            `json:"vtsRequestID"`
	VTSCorrelationID   string            `json:"vtsCorrelationID"`
	VTSResponseID      string            `json:"vtsResponseID"`
}

func (c *Client) CreateEnrollRequest(accountID, emailHash, locale string, panSource PANSource, card *Card) (*EnrollCardRequest, error) {
	paymentInstrument := ReqPaymentInstrument{
		AccountNumber: card.PrimaryAccountNumber,
		ExpirationDate: ExpirationDate{
			Year:  card.PanExpirationYear,
			Month: card.PanExpirationMonth,
		},
	}

	paymentInstrumentJWE, err := c.jwe.MarshalAndEncrypt(paymentInstrument)
	if err != nil {
		return nil, err
	}

	req := &EnrollCardRequest{
		EncPaymentInstrument:                paymentInstrumentJWE,
		PresentationType:                    []TransactionType{TransactionTypeECOM},
		ClientAppID:                         c.clientAppID,
		ClientWalletAccountID:               accountID,
		ClientWalletAccountEmailAddressHash: emailHash,
		Locale:                              locale,
		ProtectionType:                      ProtectionTypeSoftware,
		PANSource:                           panSource,
		ConsumerEntryMode:                   ConsumerEntryModeKeyEntered,
	}

	switch panSource {
	case PANSourceManuallyEntered:
		if card.CVV2 == "" {
			return nil, errors.New("visa: cvv2 not provided")
		}

		riskData := []RiskData{
			{
				Name:  "cvv2",
				Value: card.CVV2,
			},
		}

		ecnRiskData, err := c.jwe.MarshalAndEncrypt(riskData)
		if err != nil {
			return nil, err
		}

		req.EncRiskDataInfo = ecnRiskData
	case PANSourceOnfile:
		if card.CVV2 != "" {
			return nil, errors.New("visa: cvv2 field is not expected for onfile")
		}
	default:
		return nil, fmt.Errorf("visa: unexpected pan source value %v", panSource)
	}

	return req, nil
}

func (c *Client) EnrollCard(ctx context.Context, relationshipID string, req *EnrollCardRequest) (*EnrollCardResponse, error) {
	ctx, cancel := context.WithTimeout(ctx, c.enrollTimeout)
	defer cancel()

	requestID := genUUID()

	if relationshipID == "" {
		return nil, errors.New("visa: relationship_id is required")
	}

	resp, err := c.rc.R().
		SetContext(ctx).
		SetHeader(xRequestIDHeader, requestID).
		SetBody(req).
		SetResult(EnrollCardResponse{}).
		SetQueryParam("relationshipID", relationshipID).
		Post("/vts/provisionedTokens")
	if err != nil {
		return nil, err
	}

	c.logRequest(ctx, "Enroll visa card request", requestID, resp)

	if resp.IsError() {
		return nil, newError(requestID, resp)
	}

	result := resp.Result().(*EnrollCardResponse)

	result.VTSRequestID = requestID
	result.VTSCorrelationID = resp.Header().Get(xCorrelationIDHeader)
	result.VTSResponseID = resp.Header().Get(xResponseHeader)

	return result, nil
}

type PaymentDataRequest struct {
	ClientPaymentDataID string         `json:"clientPaymentDataID"`
	PaymentRequest      PaymentRequest `json:"paymentRequest"`
	CryptogramType      CryptogramType `json:"cryptogramType,omitempty"`
}

type paymentDataRequest struct {
	PaymentDataRequest
	ClientAppID string `json:"clientAppID"`
}

type PaymentDataResponse struct {
	PaymentDataID      string            `json:"vPaymentDataID"`
	EncryptionMetaData string            `json:"encryptionMetaData,omitempty"`
	PaymentInstrument  PaymentInstrument `json:"paymentInstrument,omitempty"`
	TokenInfo          TokenInfo         `json:"tokenInfo"`
	CryptogramInfo     CryptogramInfo    `json:"cryptogramInfo"`
	VTSRequestID       string            `json:"vtsRequestID"`
	VTSCorrelationID   string            `json:"vtsCorrelationID"`
	VTSResponseID      string            `json:"vtsResponseID"`
}

func (c *Client) GetPaymentData(
	ctx context.Context,
	relationshipID,
	provisionedTokenID string,
	request *PaymentDataRequest,
) (
	*PaymentDataResponse, error,
) {
	requestID := genUUID()

	if len(provisionedTokenID) == 0 {
		return nil, errors.New("missing provisionedTokenID")
	}

	var req paymentDataRequest
	req.PaymentDataRequest = *request
	req.ClientAppID = c.clientAppID

	resp, err := c.rc.R().
		SetContext(ctx).
		SetHeader(xRequestIDHeader, requestID).
		SetBody(&req).
		SetResult(&PaymentDataResponse{}).
		SetQueryParam("relationshipID", relationshipID).
		Post(path.Join("vts/v2/provisionedTokens/", provisionedTokenID, "/paymentData"))
	if err != nil {
		return nil, err
	}

	c.logRequest(ctx, "Checkout visa card request", requestID, resp)

	if resp.IsError() {
		return nil, newError(requestID, resp)
	}

	result := resp.Result().(*PaymentDataResponse)

	result.VTSRequestID = requestID
	result.VTSCorrelationID = resp.Header().Get(xCorrelationIDHeader)
	result.VTSResponseID = resp.Header().Get(xResponseHeader)

	return result, nil
}

func genUUID() string {
	id, _ := uuid.NewV4()
	return id.String()
}

func (c *Client) logRequest(ctx context.Context, msg string, requestID string, resp *resty.Response) {
	ctxlog.Info(ctx, c.logger, msg,
		log.String("vts_request_id", requestID),
		log.String("vts_correlation_id", resp.Header().Get(xCorrelationIDHeader)),
		log.String("vts_response_id", resp.Header().Get(xResponseHeader)),
		log.Int("status_code", resp.StatusCode()),
		log.String("status", resp.Status()),
		log.Duration("latency", resp.Time()),
	)
}
