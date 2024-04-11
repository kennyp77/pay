package mastercard

import (
	"context"
	"crypto/rsa"
	"encoding/json"
	"errors"
	"fmt"
	"net/url"
	"strings"
	"time"

	"a.yandex-team.ru/library/go/core/log/ctxlog"
	"github.com/go-resty/resty/v2"
	"github.com/gofrs/uuid"
	oauth "github.com/mastercard/oauth1-signer-go"
	"gopkg.in/square/go-jose.v2"

	"a.yandex-team.ru/library/go/core/log"

	"a.yandex-team.ru/pay/duckgo/shared/interactionerror"
	"a.yandex-team.ru/pay/duckgo/shared/middlewares"
)

type Client struct {
	logger    log.Logger
	serviceID string
	clientID  string

	rc         *resty.Client
	publicKeys *PublicKeysManager
	signer     *oauth.Signer

	encryptionKey *rsa.PrivateKey
}

type Config struct {
	Logger log.Logger

	// APIHostURL is Mastercard URL for API.
	// For example, "https://sandbox.api.mastercard.com".
	APIHostURL string

	// PublicKeysURL is url Mastercard public keys:
	//  - https://sandbox.src.mastercard.com/keys for sandbox
	//  - https://src.mastercard.com/keys for production.
	PublicKeysURL           string
	KeysUpdatePeriod        time.Duration
	KeysInitDownloadTimeout time.Duration
	KeysCachePath           string

	ConsumerKey string
	ServiceID   string
	ClientID    string

	SigningKey    *rsa.PrivateKey
	EncryptionKey *rsa.PrivateKey
}

func NewClient(config *Config) *Client {
	if err := config.Validate(); err != nil {
		panic(err)
	}

	logger := config.Logger
	rc := resty.New()
	rc.SetBaseURL(config.APIHostURL)
	rc.OnAfterResponse(middlewares.NewResponseLogger("mastercard outgoing HTTP request complete", logger))
	rc.Header.Set("User-Agent", "Yandex.Pay")

	signer := newSigner(config.ConsumerKey, config.SigningKey)
	rc.GetClient().Transport = NewOAuthInterceptor(signer, nil)

	var opts []PublicKeysManagerOption
	if config.KeysUpdatePeriod != 0 {
		opts = append(opts, WithKeysUpdatePeriod(config.KeysUpdatePeriod))
	}
	if config.KeysInitDownloadTimeout != 0 {
		opts = append(opts, WithInitialTimeout(config.KeysInitDownloadTimeout))
	}
	if config.KeysCachePath != "" {
		opts = append(opts, WithCachePath(config.KeysCachePath))
	}
	publicKeys := NewPublicKeysManager(logger.WithName("keys_manager"), config.PublicKeysURL, opts...)

	return &Client{
		logger:    config.Logger,
		serviceID: config.ServiceID,
		clientID:  config.ClientID,

		rc:         rc,
		publicKeys: publicKeys,
		signer:     signer,

		encryptionKey: config.EncryptionKey,
	}
}

func (c *Config) Validate() error {
	if c.Logger == nil {
		return errors.New("mastercard: Logger is required")
	}
	if len(c.ConsumerKey) == 0 {
		return errors.New("mastercard: ConsumerKey required")
	}
	if len(c.ServiceID) == 0 {
		return errors.New("mastercard: ServiceID required")
	}
	if len(c.ClientID) == 0 {
		return errors.New("mastercard: ClientID required")
	}
	if len(c.APIHostURL) == 0 {
		return errors.New("mastercard: APIHostURL required")
	}
	if len(c.PublicKeysURL) == 0 {
		return errors.New("mastercard: PublicKeysURL required")
	}
	if c.SigningKey == nil {
		return errors.New("mastercard: SigningKey required")
	}
	if c.EncryptionKey == nil {
		return errors.New("mastercard: EncryptionKey required")
	}
	return nil
}

func (c *Client) Close() {
	c.publicKeys.Close()
}

func newSigner(consumerKey string, signingKey *rsa.PrivateKey) *oauth.Signer {
	return &oauth.Signer{
		ConsumerKey: consumerKey,
		SigningKey:  signingKey,
	}
}

type Error struct {
	status           string
	statusCode       int
	message          json.RawMessage
	srcCorrelationID string
	mcCorrelationID  string
	vcapRequestID    string
	hdrCorrelationID string
}

var _ interactionerror.InteractionError = &Error{}

func (e *Error) Error() string {
	return fmt.Sprintf("mastercard api: [%d] %s {src: %s, mc: %s, hdr: %s, vcap: %s}",
		e.statusCode, e.status, e.srcCorrelationID, e.mcCorrelationID, e.hdrCorrelationID, e.vcapRequestID)
}

func (e *Error) CorrelationHeaders() map[string]string {
	return map[string]string{
		"X-SRC-Correlation-ID": e.srcCorrelationID,
		"X-MC-Correlation-ID":  e.mcCorrelationID,
		"X-VCAP-Request-ID":    e.vcapRequestID,
		"X-HDR-Correlation-ID": e.hdrCorrelationID,
	}
}

func (e *Error) LogFields() []log.Field {
	return []log.Field{
		log.Error(e),
		log.String("src_correlation_id", e.srcCorrelationID),
		log.String("mc_correlation_id", e.mcCorrelationID),
		log.String("hdr_correlation_id", e.hdrCorrelationID),
		log.String("vcap_request_id", e.vcapRequestID),
	}
}

func (e *Error) GetStatusCode() int {
	return e.statusCode
}

func (e *Error) GetRawMessage() json.RawMessage {
	return e.message
}

const (
	xHdrCorrelationIDHeader = "correlation-id"
	xMCCorrelationHeader    = "X-MC-Correlation-ID"
	xVCAPRequestIDHeader    = "X-Vcap-Request-Id"
	xFlowIDHeader           = "X-Src-Cx-Flow-Id"
)

func newError(srcCorrelationID string, resp *resty.Response) *Error {
	var msg json.RawMessage
	if resty.IsJSONType(resp.Header().Get("Content-Type")) {
		msg = resp.Body()
	}

	return &Error{
		status:           resp.Status(),
		statusCode:       resp.StatusCode(),
		message:          msg,
		srcCorrelationID: srcCorrelationID,
		mcCorrelationID:  resp.Header().Get(xMCCorrelationHeader),
		hdrCorrelationID: resp.Header().Get(xHdrCorrelationIDHeader),
		vcapRequestID:    resp.Header().Get(xVCAPRequestIDHeader),
	}
}

type EnrollCardRequest struct {
	SRCClientID      string     `json:"srcClientId"`
	SRCCorrelationID string     `json:"srcCorrelationId"`
	ServiceID        string     `json:"serviceId"`
	Consumer         Consumer   `json:"consumer"`
	EncryptedCard    string     `json:"encryptedCard"`
	CardSource       CardSource `json:"cardSource"`
}

type EnrollCardResponse struct {
	SRCCorrelationID string          `json:"srcCorrelationId"`
	MaskedCard       MaskedCard      `json:"maskedCard"`
	MaskedConsumer   json.RawMessage `json:"maskedConsumer,omitempty"`
}

// EnrollCard sends POST/cards enroll request.
func (c *Client) EnrollCard(ctx context.Context, req *EnrollCardRequest) (*EnrollCardResponse, error) {
	req.ServiceID = c.serviceID
	req.SRCClientID = c.clientID
	req.SRCCorrelationID = genCorrelationID()

	resp, err := c.rc.R().
		SetContext(ctx).
		SetBody(req).
		SetResult(EnrollCardResponse{}).
		Post("/src/api/digital/payments/cards")
	if err != nil {
		return nil, err
	}

	c.logRequest(ctx, "Enroll mastercard card request", req.SRCCorrelationID, resp)

	if resp.IsError() {
		return nil, newError(req.SRCCorrelationID, resp)
	}

	return resp.Result().(*EnrollCardResponse), nil
}

func (c *Client) EncryptCard(card *Card) (string, error) {
	fpanKey, err := c.getFPANEncryptionKey()
	if err != nil {
		return "", err
	}

	enc, err := jose.NewEncrypter(
		jose.A128GCM,
		jose.Recipient{
			Algorithm: jose.RSA_OAEP_256,
			Key:       fpanKey,
		},
		nil,
	)
	if err != nil {
		return "", err
	}

	plaintext, err := json.Marshal(card)
	if err != nil {
		return "", nil
	}

	obj, err := enc.Encrypt(plaintext)
	if err != nil {
		return "", nil
	}

	return obj.CompactSerialize()
}

// MakeAuthorizationHeader computes Authorization header value.
func (c *Client) MakeAuthorizationHeader(u *url.URL, method string, payload []byte) (authHeader string, err error) {
	return oauth.GetAuthorizationHeader(u, method, payload, c.signer.ConsumerKey, c.signer.SigningKey)
}

type CheckoutRequest struct {
	SRCClientID           string                `json:"srcClientId"`
	SRCCorrelationID      string                `json:"srcCorrelationId"`
	ServiceID             string                `json:"serviceId"`
	SRCDigitalCardID      string                `json:"srcDigitalCardId"`
	DPATransactionOptions DPATransactionOptions `json:"dpaTransactionOptions"`
}

type CheckoutResponse struct {
	SRCCorrelationID string          `json:"srcCorrelationId"`
	MaskedCard       MaskedCard      `json:"maskedCard"`
	MaskedConsumer   json.RawMessage `json:"maskedConsumer"`

	Token      Token      `json:"token"`
	Cryptogram Cryptogram `json:"cryptogram"`
}

type RawCheckoutResponse struct {
	CheckoutResponseJWS string `json:"checkoutResponseJWS"`
}

type RawCheckoutVerifiedPayload struct {
	SRCCorrelationID string          `json:"srcCorrelationId"`
	EncryptedPayload string          `json:"encryptedPayload"`
	MaskedCard       MaskedCard      `json:"maskedCard"`
	MaskedConsumer   json.RawMessage `json:"maskedConsumer"`
	AssuranceData    json.RawMessage `json:"assuranceData"`
}

type RawCheckoutEncryptedPayload struct {
	Token               Token           `json:"token"`
	Cryptogram          Cryptogram      `json:"dynamicData"`
	SRCTokenResultsData json.RawMessage `json:"srcTokenResultsData"`
}

// Checkout sends POST/transaction/credentials, verifies and decrypts response.
//
// TODO: split CheckoutRequest to public CheckoutRequest and raw RawCheckoutRequest.
// TODO: parse error responses:
//  - https://developer.mastercard.com/secure-card-on-file/documentation/code-and-formats/
//  - https://developer.mastercard.com/platform/documentation/security-and-authentication/gateway-error-codes/
func (c *Client) Checkout(ctx context.Context, req *CheckoutRequest) (*CheckoutResponse, error) {
	req.ServiceID = c.serviceID
	req.SRCClientID = c.clientID
	// TODO: add support of external correlation id and flow id.
	req.SRCCorrelationID = genCorrelationID()

	resp, err := c.rc.R().
		SetContext(ctx).
		SetBody(req).
		SetResult(RawCheckoutResponse{}).
		Post("/src/api/digital/payments/transaction/credentials")
	if err != nil {
		return nil, err
	}

	c.logRequest(ctx, "Checkout mastercard card request", req.SRCCorrelationID, resp)

	if resp.IsError() {
		return nil, newError(req.SRCCorrelationID, resp)
	}

	checkoutResp := resp.Result().(*RawCheckoutResponse)
	verifiedBytes, err := c.verifyJWS(ctx, checkoutResp.CheckoutResponseJWS)
	if err != nil {
		return nil, err
	}

	verified := &RawCheckoutVerifiedPayload{}
	err = json.Unmarshal(verifiedBytes, verified)
	if err != nil {
		return nil, err
	}

	payloadBytes, err := c.decryptJWE(ctx, verified.EncryptedPayload)
	if err != nil {
		return nil, err
	}

	payload := &RawCheckoutEncryptedPayload{}
	err = json.Unmarshal(payloadBytes, payload)
	if err != nil {
		return nil, err
	}

	return &CheckoutResponse{
		SRCCorrelationID: verified.SRCCorrelationID,
		MaskedCard:       verified.MaskedCard,
		MaskedConsumer:   verified.MaskedConsumer,
		Token:            payload.Token,
		Cryptogram:       payload.Cryptogram,
	}, nil
}

func (c *Client) getFPANEncryptionKey() (*jose.JSONWebKey, error) {
	keys := c.publicKeys.Get()
	for i := range keys.Keys {
		kid := keys.Keys[i].KeyID
		pt := strings.SplitN(kid, "-", 2)
		if len(pt) != 2 {
			continue
		}
		if pt[1] == "src-fpan-encryption" {
			return &keys.Keys[i], nil
		}
	}

	return nil, errors.New("mastercard: fpan encryption key not found")
}

func (c *Client) getSRCPayloadVerificationKey(ctx context.Context, kid string) (*jose.JSONWebKey, error) {
	keys := c.publicKeys.Get()
	var availableKIDs = make([]string, len(keys.Keys))
	for i := range keys.Keys {
		if kid == keys.Keys[i].KeyID {
			return &keys.Keys[i], nil
		}
		availableKIDs[i] = keys.Keys[i].KeyID
	}

	ctxlog.Error(ctx, c.logger, "SRC payload verification key not found",
		log.String("kid", kid),
		log.Strings("available_kids", availableKIDs),
	)

	return nil, errors.New("mastercard: src payload verification key not found")
}

func (c *Client) verifyJWS(ctx context.Context, signature string) (payload []byte, err error) {
	jws, err := jose.ParseSigned(signature)
	if err != nil {
		return nil, err
	}

	if len(jws.Signatures) == 0 {
		return nil, errors.New("verify jws: expected signed JWS token")
	}

	sig := jws.Signatures[0]
	ctxlog.Debug(ctx, c.logger, "Start CheckoutResponseJWS verification",
		log.String("kid", sig.Protected.KeyID),
		log.Reflect("headers", sig.Protected.ExtraHeaders),
	)

	key, err := c.getSRCPayloadVerificationKey(ctx, sig.Protected.KeyID)
	if err != nil {
		return nil, err
	}

	return jws.Verify(key)
}

func (c *Client) decryptJWE(ctx context.Context, serializedJWE string) (payload []byte, err error) {
	jwe, err := jose.ParseEncrypted(serializedJWE)
	if err != nil {
		return nil, err
	}

	ctxlog.Debug(ctx, c.logger, "Start Checkout JWE decryption",
		log.String("kid", jwe.Header.KeyID),
		log.Reflect("headers", jwe.Header.ExtraHeaders),
	)

	return jwe.Decrypt(c.encryptionKey)
}

func (c *Client) HealthCheck(context.Context) error {
	_ = c.publicKeys.Get()
	return nil
}

func genCorrelationID() string {
	id, _ := uuid.NewV4()
	return id.String()
}

func (c *Client) logRequest(ctx context.Context, msg string, correlationID string, resp *resty.Response) {
	ctxlog.Info(ctx, c.logger, msg,
		log.String("src_correlation_id", correlationID),
		log.String("mc_correlation_id", resp.Header().Get(xMCCorrelationHeader)),
		log.String("hdr_correlation_id", resp.Header().Get(xHdrCorrelationIDHeader)),
		log.String("vcap_request_id", resp.Header().Get(xVCAPRequestIDHeader)),
		log.String("src_flow_id", resp.Header().Get(xFlowIDHeader)),
		log.Int("status_code", resp.StatusCode()),
		log.String("status", resp.Status()),
		log.Duration("latency", resp.Time()),
	)
}
