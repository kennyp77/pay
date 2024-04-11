package server

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/url"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"

	"a.yandex-team.ru/library/go/core/log"
	"a.yandex-team.ru/library/go/core/log/ctxlog"
	"a.yandex-team.ru/library/go/yandex/tvm"

	"a.yandex-team.ru/pay/duckgo/mastercard"
	"a.yandex-team.ru/pay/duckgo/paymenttoken"
	"a.yandex-team.ru/pay/duckgo/server/api"
	"a.yandex-team.ru/pay/duckgo/visa"
)

type ExternalHandler struct {
	logger log.Logger
	config *ConfigExternalAPI
	srv    *Server

	mux              *chi.Mux
	mastercardClient *mastercard.Client
	visaClient       *visa.Client
	tokenSender      *paymenttoken.Sender
	keyVerifier      *paymenttoken.RecipientKeyVerifier
}

var _ http.Handler = &ExternalHandler{}

func NewExternalHandler(
	logger log.Logger,
	config *ConfigExternalAPI,
	srv *Server,
	mcClient *mastercard.Client,
	visaClient *visa.Client,
	tokenSender *paymenttoken.Sender,
	keyVerifier *paymenttoken.RecipientKeyVerifier,
) (
	*ExternalHandler, error,
) {
	h := &ExternalHandler{
		logger: logger,
		config: config,
		srv:    srv,

		mux:              chi.NewRouter(),
		mastercardClient: mcClient,
		visaClient:       visaClient,
		tokenSender:      tokenSender,
		keyVerifier:      keyVerifier,
	}

	h.mux.Use(middleware.RequestID)
	h.mux.Use(LogRequestID)
	h.mux.Use(middleware.RequestLogger(newHTTPLogFormatter(logger)))
	h.mux.Use(middleware.Recoverer)
	h.mux.Use(middleware.AllowContentType("application/json"))

	auth, err := h.createAuthMiddleware()
	if err != nil {
		return nil, err
	}
	h.mux.Route("/v1", func(r chi.Router) {
		r.Get("/ping", h.Ping)

		r.Group(func(r chi.Router) {
			r.Use(auth)
			r.Route("/mastercard", func(r chi.Router) {
				r.Post("/sign_request", h.MastercardSignRequest)
				r.Post("/checkout", h.MastercardCheckout)
			})
			r.Route("/payment_token", func(r chi.Router) {
				r.Post("/verify_recipient_key", h.PaymentTokenVerifyRecipientKey)
			})
			if visaClient != nil {
				r.Route("/visa", func(r chi.Router) {
					r.Post("/sign_request", h.VisaSignRequest)
					r.Post("/verify_request", h.VisaVerifyRequest)
					r.Post("/checkout", h.VisaCheckout)
				})
			}
		})
	})

	return h, nil
}

func (h *ExternalHandler) createAuthMiddleware() (func(http.Handler) http.Handler, error) {
	switch h.config.Auth {
	case ConfigAuthSharedKey:
		return MiddlewareSharedKeyAuth(h.config.SharedKey.SharedKey), nil
	case ConfigAuthTVM:
		tvmClient, err := newTVMClient(&h.config.TVM)
		if err != nil {
			return nil, err
		}
		h.srv.AddHealthCheck("tvm", func(ctx context.Context) error {
			status, err := tvmClient.GetStatus(ctx)
			if err != nil {
				return err
			}
			if status.Status == tvm.ClientError {
				return fmt.Errorf("tvm: client status %s", status)
			}

			return nil
		})
		return MiddlewareTVMAuth(h.logger.WithName("tvm_auth"), tvmClient, h.config.TVM.Allowed), nil
	default:
		return nil, fmt.Errorf("server: unsupported auth type: %v", h.config.Auth)
	}
}

func (h *ExternalHandler) ServeHTTP(rw http.ResponseWriter, req *http.Request) {
	h.mux.ServeHTTP(rw, req)
}

type SignRequest struct {
	URL    string `json:"url"`
	Method string `json:"method"`
	// Body is base64-encoded body of request
	Body string `json:"body"`
}

type VisaSignResponse struct {
	Headers map[string][]string `json:"headers"`
	URL     string              `json:"url"`
}

func (h *ExternalHandler) VisaSignRequest(rw http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	dec := json.NewDecoder(req.Body)
	signReq := &SignRequest{}
	if err := dec.Decode(signReq); err != nil {
		h.sendError(ctx, rw, http.StatusBadRequest,
			api.CodeInvalidRequest, "can't parse payload: "+err.Error())
		return
	}

	body, err := base64.StdEncoding.DecodeString(signReq.Body)
	if err != nil {
		h.sendError(ctx, rw, http.StatusBadRequest,
			api.CodeInvalidBody, "can't base64-decode: "+err.Error())
		return
	}

	u, err := url.Parse(signReq.URL)
	if err != nil {
		h.sendError(ctx, rw, http.StatusBadRequest,
			api.CodeInvalidURL, "can't parse: "+err.Error())
		return
	}

	actualReq, err := http.NewRequest(signReq.Method, u.String(), bytes.NewBuffer(body))
	if err != nil {
		h.sendError(ctx, rw, http.StatusInternalServerError,
			api.CodeInternal, "can't create request "+err.Error())
	}

	err = h.visaClient.Sign(actualReq)
	if err != nil {
		h.sendError(ctx, rw, http.StatusInternalServerError,
			api.CodeInternal, "can't sign request "+err.Error())
	}

	resp := VisaSignResponse{
		Headers: make(map[string][]string),
		URL:     actualReq.URL.String(),
	}

	resp.Headers[visa.AuthorizationHeaderName] = actualReq.Header.Values(visa.AuthorizationHeaderName)

	h.sendResponse(ctx, rw, http.StatusOK, resp)
}

type VisaVerifyRequest struct {
	Signature string `json:"signature"`
	URL       string `json:"url"`
	// Body is base64-encoded
	Body string `json:"body"`
}

type VisaVerifyResponse struct{}

func (h *ExternalHandler) VisaVerifyRequest(rw http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	dec := json.NewDecoder(req.Body)
	verifyRequest := &VisaVerifyRequest{}
	if err := dec.Decode(verifyRequest); err != nil {
		h.sendError(ctx, rw, http.StatusBadRequest,
			api.CodeInvalidRequest, "can't parse payload: "+err.Error())
		return
	}

	body, err := base64.StdEncoding.DecodeString(verifyRequest.Body)
	if err != nil {
		h.sendError(ctx, rw, http.StatusBadRequest,
			api.CodeInvalidBody, "can't base64-decode body: "+err.Error())
		return
	}

	u, err := url.Parse(verifyRequest.URL)
	if err != nil {
		h.sendError(ctx, rw, http.StatusBadRequest,
			api.CodeInvalidURL, "can't parse url: "+err.Error())
		return
	}

	if err = h.visaClient.VerifyRequest(u, body, verifyRequest.Signature); err != nil {
		h.sendError(
			ctx,
			rw,
			http.StatusUnauthorized,
			api.CodeInvalidSignature,
			err.Error())
		return
	}

	h.sendResponse(ctx, rw, http.StatusOK, VisaVerifyResponse{})
}

type MastercardSignResponse struct {
	Headers map[string][]string `json:"headers"`
}

func (h *ExternalHandler) MastercardSignRequest(rw http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	dec := json.NewDecoder(req.Body)
	signReq := &SignRequest{}
	if err := dec.Decode(signReq); err != nil {
		h.sendError(ctx, rw, http.StatusBadRequest,
			api.CodeInvalidRequest, "can't parse payload: "+err.Error())
		return
	}

	body, err := base64.StdEncoding.DecodeString(signReq.Body)
	if err != nil {
		h.sendError(ctx, rw, http.StatusBadRequest,
			api.CodeInvalidBody, "can't base64-decode: "+err.Error())
		return
	}

	u, err := url.Parse(signReq.URL)
	if err != nil {
		h.sendError(ctx, rw, http.StatusBadRequest,
			api.CodeInvalidURL, "can't parse: "+err.Error())
		return
	}

	authHeader, err := h.mastercardClient.MakeAuthorizationHeader(u, signReq.Method, body)
	if err != nil {
		h.sendError(ctx, rw, http.StatusInternalServerError,
			api.CodeInternal, "can't build auth header: "+err.Error())
		return
	}

	resp := MastercardSignResponse{
		Headers: make(map[string][]string),
	}
	resp.Headers["Authorization"] = []string{authHeader}

	h.sendResponse(ctx, rw, http.StatusOK, resp)
}

type MITInfo struct {
	// Indicates that payment token is allowed to be used in recurring transactions
	// e.g. subscription
	Recurring bool `json:"recurring"`

	// Indicates that payment token is allowed to be used in deferred transactions
	// so when final cost is not known, e.g. taxi ride, grocery delivery
	Deferred bool `json:"deferred"`
}

func (mi *MITInfo) IsEmpty() bool {
	return mi == nil || (!mi.Recurring && !mi.Deferred)
}

type TransactionInfo struct {
	// Currency is ISO 4217 alpha code. RUB for Russian Ruble.
	// https://en.wikipedia.org/wiki/ISO_4217#Active_codes
	Currency string `json:"currency,omitempty"`

	// Units of currency
	Amount int `json:"amount,omitempty"`
}

func (ti *TransactionInfo) Validate() error {
	if len(ti.Currency) == 0 {
		return errors.New("server: transaction_info: currency is required")
	}
	if ti.Amount < 0 {
		return errors.New("server: transaction_info: amount should not be negative")
	}

	return nil
}

type CheckoutRequestBase struct {
	// RecipientID — gatewayID or merchantID (for DIRECT merchants)
	RecipientID string `json:"recipient_id"`

	// GatewayMerchantID is merchant's account id in PSP system.
	// Not required for DIRECT merchants.
	GatewayMerchantID string `json:"gateway_merchant_id"`

	// RecipientPublicKey — public key in DER form:
	//   openssl ec -in key.pem -pubout -text
	RecipientPublicKey          string `json:"recipient_pub_key"`
	RecipientPublicKeySignature string `json:"recipient_pub_key_signature"`

	TransactionInfo TransactionInfo `json:"transaction_info"`
	MITInfo         *MITInfo        `json:"mit_info"`

	MessageExpiration int64  `json:"message_expiration"`
	MessageID         string `json:"message_id"`
}

type checkoutRequestValidationError struct {
	code        api.Code
	description string
}

func (err *checkoutRequestValidationError) Error() string {
	return fmt.Sprintf("%s: %s", err.code, err.description)
}

func (checkoutReq *CheckoutRequestBase) validate() *checkoutRequestValidationError {
	if err := checkoutReq.TransactionInfo.Validate(); err != nil {
		return &checkoutRequestValidationError{
			code:        api.CodeInvalidRequest,
			description: err.Error(),
		}
	}

	if len(checkoutReq.RecipientID) == 0 {
		return &checkoutRequestValidationError{
			code:        api.CodeInvalidRecipientID,
			description: "recipient_id is required",
		}
	}

	if checkoutReq.MessageExpiration <= 0 {
		return &checkoutRequestValidationError{
			code:        api.CodeInvalidMessageExpiration,
			description: "message_expiration is invalid",
		}
	}
	if len(checkoutReq.MessageID) == 0 {
		return &checkoutRequestValidationError{
			code:        api.CodeInvalidMessageID,
			description: "message_id is invalid",
		}
	}

	if len(checkoutReq.GatewayMerchantID) == 0 {
		return &checkoutRequestValidationError{
			code:        api.CodeInvalidGatewayMerchantID,
			description: "gateway_merchant_id is invalid",
		}
	}
	if checkoutReq.MITInfo.IsEmpty() && checkoutReq.TransactionInfo.Amount == 0 {
		return &checkoutRequestValidationError{
			code:        api.CodeInvalidGatewayMerchantID,
			description: "MIT is not allowed but transaction_details.amount is \"0\"",
		}
	}

	return nil
}

type MastercardCheckoutRequest struct {
	CheckoutRequestBase
	// CardID — SRC Digital Card ID, enrolled card ID.
	CardID string `json:"card_id"`
}

type MastercardCheckoutResponse struct {
	PaymentToken   string                `json:"payment_token"`
	MaskedConsumer json.RawMessage       `json:"masked_consumer"`
	MaskedCard     mastercard.MaskedCard `json:"masked_card"`
}

func (h *ExternalHandler) MastercardCheckout(rw http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	checkoutReq := &MastercardCheckoutRequest{}
	dec := json.NewDecoder(req.Body)
	if err := dec.Decode(checkoutReq); err != nil {
		h.sendError(ctx, rw, http.StatusBadRequest,
			api.CodeInvalidRequest, "can't parse payload: "+err.Error())
		return
	}

	if err := checkoutReq.validate(); err != nil {
		h.sendError(ctx, rw, http.StatusBadRequest,
			err.code, err.description)
		return
	}

	pubKey, err := h.keyVerifier.Verify(checkoutReq.RecipientPublicKey, checkoutReq.RecipientPublicKeySignature)
	if err != nil {
		h.sendError(ctx, rw, http.StatusBadRequest,
			api.CodeInvalidPublicKey, err.Error())
		return
	}

	mcReq := &mastercard.CheckoutRequest{
		SRCDigitalCardID: checkoutReq.CardID,
		DPATransactionOptions: mastercard.DPATransactionOptions{
			ThreeDSPreference: mastercard.ThreeDSPreferenceNone,
		},
	}

	mcResp, err := h.mastercardClient.Checkout(ctx, mcReq)
	if err != nil {
		handleJSONError(ctx, h.logger, "Mastercard checkout card error", rw, err)
		return
	}

	ctxlog.Info(ctx, h.logger, "Checkout mastercard card",
		log.String("src_correlation_id", mcResp.SRCCorrelationID),
		log.String("card_last4", mcResp.MaskedCard.PANLastFour),
		log.String("src_card_id", mcResp.MaskedCard.SRCDigitalCardID),
	)

	expMonth, expYear, err := convertDates(mcResp.Token.TokenExpirationMonth, mcResp.Token.TokenExpirationYear)
	if err != nil {
		h.sendError(ctx, rw, http.StatusInternalServerError,
			api.CodeInternal, "mastercard: can't parse TokenExpirationDate: "+err.Error())
		return
	}

	msg := paymenttoken.EncryptedMessage{
		PaymentMethod: paymenttoken.PaymentMethodCard,
		PaymentMethodDetails: paymenttoken.PaymentMethodDetails{
			AuthMethod:      paymenttoken.AuthMethodCloudToken,
			PAN:             mcResp.Token.PaymentToken,
			ExpirationMonth: expMonth,
			ExpirationYear:  expYear,
			Cryptogram:      mcResp.Cryptogram.DynamicDataValue,
		},
		PaymentAccountReference: mcResp.Token.PaymentAccountReference,
		MessageID:               checkoutReq.MessageID,
		MessageExpiration:       strconv.FormatInt(checkoutReq.MessageExpiration, 10),
		GatewayMerchantID:       checkoutReq.GatewayMerchantID,
		TransactionDetails: paymenttoken.TransactionDetails{
			Amount:   checkoutReq.TransactionInfo.Amount,
			Currency: checkoutReq.TransactionInfo.Currency,
		},
	}

	if !checkoutReq.MITInfo.IsEmpty() {
		msg.MITDetails = &paymenttoken.MITDetails{
			Recurring: checkoutReq.MITInfo.Recurring,
			Deferred:  checkoutReq.MITInfo.Deferred,
		}
	}

	token, err := h.tokenSender.SealJSONMessage(checkoutReq.RecipientID, msg, pubKey)
	if err != nil {
		h.sendError(ctx, rw, http.StatusInternalServerError,
			api.CodeInternal, err.Error())
		return
	}

	checkoutResp := MastercardCheckoutResponse{
		PaymentToken:   token,
		MaskedConsumer: mcResp.MaskedConsumer,
		MaskedCard:     mcResp.MaskedCard,
	}

	rw.Header().Set("X-SRC-Correlation-ID", mcResp.SRCCorrelationID)
	h.sendResponse(ctx, rw, http.StatusOK, &checkoutResp)
}

type VisaCheckoutRequest struct {
	CheckoutRequestBase
	ProvisionedTokenID  string `json:"provisioned_token_id"`
	ClientPaymentDataID string `json:"client_payment_data_id"`
	RelationshipID      string `json:"relationship_id"`
}

type VisaCheckoutResponse struct {
	PaymentToken string `json:"payment_token"`
}

func (h *ExternalHandler) VisaCheckout(rw http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	checkoutReq := &VisaCheckoutRequest{}
	dec := json.NewDecoder(req.Body)
	if err := dec.Decode(checkoutReq); err != nil {
		h.sendError(ctx, rw, http.StatusBadRequest,
			api.CodeInvalidRequest, "can't parse payload: "+err.Error())
		return
	}

	if err := checkoutReq.validate(); err != nil {
		h.sendError(ctx, rw, http.StatusBadRequest,
			err.code, err.description)
		return
	}

	if len(checkoutReq.ClientPaymentDataID) == 0 {
		h.sendError(ctx, rw, http.StatusBadRequest,
			api.CodeInvalidRequest, "missing required field client_payment_data_id")
		return
	}

	pubKey, err := h.keyVerifier.Verify(checkoutReq.RecipientPublicKey, checkoutReq.RecipientPublicKeySignature)
	if err != nil {
		h.sendError(ctx, rw, http.StatusBadRequest,
			api.CodeInvalidPublicKey, err.Error())
		return
	}

	pdRed := &visa.PaymentDataRequest{
		ClientPaymentDataID: checkoutReq.ClientPaymentDataID,
		PaymentRequest: visa.PaymentRequest{
			TransactionType: visa.TransactionTypeECOM,
		},
	}

	viResp, err := h.visaClient.GetPaymentData(ctx, checkoutReq.RelationshipID, checkoutReq.ProvisionedTokenID, pdRed)
	if err != nil {
		handleJSONError(ctx, h.logger, "Visa checkout card error", rw, err)
		return
	}

	ctxlog.Info(ctx, h.logger, "Checkout visa card",
		log.String("vts_request_id", viResp.VTSRequestID),
		log.String("vts_correlation_id", viResp.VTSCorrelationID),
		log.String("vts_response_id", viResp.VTSResponseID),
		log.String("card_last4", viResp.PaymentInstrument.Last4),
		log.String("relationship_id", checkoutReq.RelationshipID),
	)

	expMonth, expYear, err := convertDates(viResp.TokenInfo.ExpirationDate.Month, viResp.TokenInfo.ExpirationDate.Year)
	if err != nil {
		h.sendError(ctx, rw, http.StatusInternalServerError,
			api.CodeInternal, "visa: can't parse TokenExpirationDate: "+err.Error())
		return
	}

	visaToken, err := h.visaClient.DecryptToken(viResp.TokenInfo.EncTokenInfo)
	if err != nil {
		h.sendError(ctx, rw, http.StatusInternalServerError,
			api.CodeInternal, "visa: can't decrypt token: "+err.Error())
		return
	}

	msg := paymenttoken.EncryptedMessage{
		PaymentMethod: paymenttoken.PaymentMethodCard,
		PaymentMethodDetails: paymenttoken.PaymentMethodDetails{
			AuthMethod:      paymenttoken.AuthMethodCloudToken,
			PAN:             visaToken.Value,
			ExpirationMonth: expMonth,
			ExpirationYear:  expYear,
			Cryptogram:      viResp.CryptogramInfo.Cryptogram,
			ECI:             viResp.CryptogramInfo.ECI,
		},
		PaymentAccountReference: viResp.PaymentInstrument.PaymentAccountReference,
		MessageID:               checkoutReq.MessageID,
		MessageExpiration:       strconv.FormatInt(checkoutReq.MessageExpiration, 10),
		GatewayMerchantID:       checkoutReq.GatewayMerchantID,
		TransactionDetails: paymenttoken.TransactionDetails{
			Amount:   checkoutReq.TransactionInfo.Amount,
			Currency: checkoutReq.TransactionInfo.Currency,
		},
	}

	if !checkoutReq.MITInfo.IsEmpty() {
		msg.MITDetails = &paymenttoken.MITDetails{
			Recurring: checkoutReq.MITInfo.Recurring,
			Deferred:  checkoutReq.MITInfo.Deferred,
		}
	}

	token, err := h.tokenSender.SealJSONMessage(checkoutReq.RecipientID, msg, pubKey)
	if err != nil {
		h.sendError(ctx, rw, http.StatusInternalServerError,
			api.CodeInternal, err.Error())
		return
	}

	checkoutResp := VisaCheckoutResponse{
		PaymentToken: token,
	}

	rw.Header().Set("X-VTS-Request-ID", viResp.VTSRequestID)
	rw.Header().Set("X-VTS-Correlation-ID", viResp.VTSCorrelationID)
	rw.Header().Set("X-VTS-Response-ID", viResp.VTSResponseID)
	h.sendResponse(ctx, rw, http.StatusOK, &checkoutResp)
}

func (h *ExternalHandler) sendResponse(ctx context.Context, rw http.ResponseWriter, statusCode int, data interface{}) {
	sendAPIResponse(ctx, h.logger, rw, statusCode, data)
}

func (h *ExternalHandler) sendError(ctx context.Context, rw http.ResponseWriter, statusCode int, messageCode api.Code, description string) {
	sendAPIError(ctx, h.logger, rw, statusCode, messageCode, description)
}

func sendAPIResponse(ctx context.Context, logger log.Logger, rw http.ResponseWriter, statusCode int, data interface{}) {
	resp := api.Response{
		Status: api.StatusSuccess,
		Code:   statusCode,
		Data:   data,
	}

	rw.Header().Set("Content-Type", "application/json; charset=utf-8")
	rw.WriteHeader(statusCode)
	enc := json.NewEncoder(rw)
	if err := enc.Encode(resp); err != nil {
		ctxlog.Error(ctx, logger, "can't write response", log.Error(err))
	}
}

func sendAPIError(
	ctx context.Context,
	logger log.Logger,
	rw http.ResponseWriter,
	statusCode int,
	messageCode api.Code,
	description string,
) {
	rw.Header().Set("Content-Type", "application/json; charset=utf-8")
	rw.WriteHeader(statusCode)

	ctxlog.Error(ctx, logger, "Send API error response",
		log.Int("status_code", statusCode),
		log.String("api_message", string(messageCode)),
		log.String("api_description", description),
	)

	err := api.WriteGenericError(rw, statusCode, messageCode, description)
	if err != nil {
		ctxlog.Error(ctx, logger, "can't write response", log.Error(err))
	}
}

func (h *ExternalHandler) Ping(rw http.ResponseWriter, req *http.Request) {
	err := h.srv.HealthCheck(req.Context())
	if err != nil {
		http.Error(rw, err.Error(), http.StatusServiceUnavailable)
		return
	}
	rw.WriteHeader(http.StatusOK)
}

type PaymentTokenVerifyRecipientKeyRequest struct {
	// Recipient public key and signature to verify.
	// See CheckoutRequestBase for more details.
	RecipientPublicKey          string `json:"recipient_pub_key"`
	RecipientPublicKeySignature string `json:"recipient_pub_key_signature"`
}

type PaymentTokenVerifyRecipientKeyResponse struct {
}

func (h *ExternalHandler) PaymentTokenVerifyRecipientKey(rw http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	verifyReq := &PaymentTokenVerifyRecipientKeyRequest{}
	dec := json.NewDecoder(req.Body)
	if err := dec.Decode(verifyReq); err != nil {
		h.sendError(ctx, rw, http.StatusBadRequest,
			api.CodeInvalidRequest, "can't parse payload: "+err.Error())
		return
	}

	_, err := h.keyVerifier.Verify(verifyReq.RecipientPublicKey, verifyReq.RecipientPublicKeySignature)
	if err != nil {
		h.sendError(ctx, rw, http.StatusBadRequest, api.CodeInvalidPublicKey, err.Error())
		return
	}

	verifyResp := PaymentTokenVerifyRecipientKeyResponse{}
	h.sendResponse(ctx, rw, http.StatusOK, &verifyResp)
}

func convertDates(expMonthStr, expYearStr string) (expMonth, expYear int, err error) {
	expMonth, err = strconv.Atoi(expMonthStr)
	if err != nil {
		return
	}

	expYear, err = strconv.Atoi(expYearStr)
	if err != nil {
		return
	}

	// Normalize expiration year from undocumented YY to YYYY format.
	if expYear >= 0 && expYear < 100 {
		expYear = 2000 + expYear
	}

	return
}
