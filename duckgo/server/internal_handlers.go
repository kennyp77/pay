package server

import (
	"context"
	"crypto/x509"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"

	"a.yandex-team.ru/library/go/core/log"
	"a.yandex-team.ru/library/go/core/log/ctxlog"
	"a.yandex-team.ru/pay/duckgo/mastercard"
	"a.yandex-team.ru/pay/duckgo/paymenttoken"
	"a.yandex-team.ru/pay/duckgo/server/api"
	"a.yandex-team.ru/pay/duckgo/shared/interactionerror"
	"a.yandex-team.ru/pay/duckgo/visa"
)

type InternalHandler struct {
	logger log.Logger
	config *ConfigInternalAPI

	mux              *chi.Mux
	mastercardClient *mastercard.Client
	visaClient       *visa.Client
	tokenSender      *paymenttoken.Sender
	keyVerifier      *paymenttoken.RecipientKeyVerifier
	thalesCert       *x509.Certificate
}

var _ http.Handler = &InternalHandler{}

func NewInternalHandler(
	logger log.Logger,
	config *ConfigInternalAPI,
	mcClient *mastercard.Client,
	vClient *visa.Client,
	tokenSender *paymenttoken.Sender,
	keyVerifier *paymenttoken.RecipientKeyVerifier,
	thalesCert *x509.Certificate,
) (
	*InternalHandler, error,
) {
	h := &InternalHandler{
		logger: logger,
		config: config,

		mux:              chi.NewRouter(),
		mastercardClient: mcClient,
		visaClient:       vClient,
		tokenSender:      tokenSender,
		keyVerifier:      keyVerifier,
		thalesCert:       thalesCert,
	}

	h.mux.Use(middleware.RequestID)
	h.mux.Use(LogRequestID)
	h.mux.Use(middleware.RequestLogger(newHTTPLogFormatter(logger)))
	h.mux.Use(middleware.Recoverer)
	h.mux.Use(middleware.AllowContentType("application/json"))
	h.mux.Use(MiddlewareSharedKeyAuth(config.SharedKey.SharedKey))

	h.mux.Route("/v1/mastercard", func(r chi.Router) {
		r.Post("/enroll_card", h.MastercardEnrollCard)
	})

	if vClient != nil {
		h.mux.Route("/v1/visa", func(r chi.Router) {
			r.Post("/enroll_card", h.VisaEnrollCard)
		})
	}

	h.mux.Route("/v1/pan", func(r chi.Router) {
		r.Post("/checkout", h.PANCheckout)
	})

	h.mux.Route("/v1/wallet", func(r chi.Router) {
		r.Route("/thales", func(r chi.Router) {
			r.Post("/encrypted_card", h.ThalesEncryptedCard)
		})
	})

	return h, nil
}

func (h *InternalHandler) ServeHTTP(rw http.ResponseWriter, req *http.Request) {
	h.mux.ServeHTTP(rw, req)
}

type MastercardEnrollRequest struct {
	Card       mastercard.Card       `json:"card"`
	CardSource mastercard.CardSource `json:"card_source"`
	AccountID  string                `json:"account_id"`
}

func (h *InternalHandler) MastercardEnrollCard(rw http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	reqDec := json.NewDecoder(req.Body)
	reqData := &MastercardEnrollRequest{}
	if err := reqDec.Decode(reqData); err != nil {
		h.sendError(ctx, rw, http.StatusBadRequest, api.CodeInvalidRequest, err.Error())
		return
	}

	if reqData.CardSource == "" {
		h.sendError(ctx, rw, http.StatusBadRequest, api.CodeInvalidRequest, "card_source is required")
		return
	}
	if reqData.AccountID == "" {
		h.sendError(ctx, rw, http.StatusBadRequest, api.CodeInvalidRequest, "account_id is required")
		return
	}
	if err := reqData.Card.Validate(); err != nil {
		h.sendError(ctx, rw, http.StatusBadRequest, api.CodeInvalidCard, "card validate: "+err.Error())
		return
	}

	encryptedCard, err := h.mastercardClient.EncryptCard(&reqData.Card)
	if err != nil {
		h.sendError(ctx, rw, http.StatusInternalServerError, api.CodeInternal, err.Error())
		return
	}

	enrollReq := &mastercard.EnrollCardRequest{
		Consumer: mastercard.Consumer{
			ConsumerIdentity: mastercard.ConsumerIdentity{
				IdentityType:  mastercard.IdentityTypeExternalAccountID,
				IdentityValue: reqData.AccountID,
			},
		},
		EncryptedCard: encryptedCard,
		CardSource:    reqData.CardSource,
	}

	enrollResp, err := h.mastercardClient.EnrollCard(ctx, enrollReq)
	if err != nil {
		handleJSONError(ctx, h.logger, "Mastercard enroll card error", rw, err)
		return
	}

	ctxlog.Info(ctx, h.logger, "Enrolled mastercard card",
		log.String("src_correlation_id", enrollResp.SRCCorrelationID),
		log.String("card_last4", enrollResp.MaskedCard.PANLastFour),
		log.String("src_card_id", enrollResp.MaskedCard.SRCDigitalCardID),
	)

	rw.Header().Set("Content-Type", "application/json; charset=utf-8")
	rw.Header().Set("X-SRC-Correlation-ID", enrollResp.SRCCorrelationID)
	respEnc := json.NewEncoder(rw)
	_ = respEnc.Encode(enrollResp)
}

type VisaEnrollRequest struct {
	Card           visa.Card      `json:"card"`
	EmailHash      string         `json:"email_hash"`
	Locale         string         `json:"locale"`
	PANSource      visa.PANSource `json:"pan_source"`
	AccountID      string         `json:"account_id"`
	RelationshipID string         `json:"relationship_id"`
}

func (h *InternalHandler) VisaEnrollCard(rw http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	reqDec := json.NewDecoder(req.Body)
	reqData := &VisaEnrollRequest{}

	if err := reqDec.Decode(reqData); err != nil {
		h.sendError(ctx, rw, http.StatusBadRequest, api.CodeInvalidRequest, err.Error())
		return
	}

	if reqData.AccountID == "" {
		h.sendError(ctx, rw, http.StatusBadRequest,
			api.CodeInvalidRequest, "account_id is required")
		return
	}

	if reqData.EmailHash == "" {
		h.sendError(ctx, rw, http.StatusBadRequest,
			api.CodeInvalidRequest, "email_hash is required")
		return
	}

	if reqData.Locale == "" {
		h.sendError(ctx, rw, http.StatusBadRequest,
			api.CodeInvalidRequest, "locale is required")
		return
	}

	if err := reqData.Card.Validate(); err != nil {
		h.sendError(ctx, rw, http.StatusBadRequest,
			api.CodeInvalidCard, "card validate: "+err.Error())
		return
	}

	if !reqData.PANSource.IsValid() {
		h.sendError(ctx, rw, http.StatusBadRequest,
			api.CodeInvalidRequest, "unexpected pan_source value")
		return
	}

	if reqData.PANSource == visa.PANSourceManuallyEntered {
		if reqData.Card.CVV2 == "" {
			h.sendError(ctx, rw, http.StatusBadRequest,
				api.CodeInvalidRequest, "cvv2 is required for MANUALLY_ENTERED cards")
			return
		}
	}

	enrollReq, err := h.visaClient.CreateEnrollRequest(reqData.AccountID, reqData.EmailHash, reqData.Locale, reqData.PANSource, &reqData.Card)
	if err != nil {
		h.sendError(ctx, rw, http.StatusInternalServerError,
			api.CodeInternal, "can't create visa tokenization request: "+err.Error())
		return
	}

	enrollResp, err := h.visaClient.EnrollCard(ctx, reqData.RelationshipID, enrollReq)
	if err != nil {
		handleJSONError(ctx, h.logger, "Visa enroll card error", rw, err)
		return
	}

	ctxlog.Info(ctx, h.logger, "Enrolled visa card",
		log.String("vts_request_id", enrollResp.VTSRequestID),
		log.String("vts_response_id", enrollResp.VTSResponseID),
		log.String("vts_correlation_id", enrollResp.VTSCorrelationID),
		log.String("card_last4", enrollResp.PaymentInstrument.Last4),
		log.String("relationship_id", reqData.RelationshipID),
	)

	rw.Header().Set("Content-Type", "application/json; charset=utf-8")
	rw.Header().Set("X-VTS-Request-ID", enrollResp.VTSRequestID)
	rw.Header().Set("X-VTS-Correlation-ID", enrollResp.VTSCorrelationID)
	rw.Header().Set("X-VTS-Response-ID", enrollResp.VTSResponseID)
	respEnc := json.NewEncoder(rw)
	_ = respEnc.Encode(enrollResp)
}

type PANCheckoutCard struct {
	PrimaryAccountNumber string `json:"primary_account_number"`
	PanExpirationMonth   int    `json:"pan_expiration_month"`
	PanExpirationYear    int    `json:"pan_expiration_year"`
	CVV                  string `json:"cvv,omitempty"`
}

func (c *PANCheckoutCard) Validate() error {
	if len(c.PrimaryAccountNumber) < 10 {
		return errors.New("card.primary_account_number is required")
	}
	if c.PanExpirationMonth <= 0 || c.PanExpirationMonth > 12 {
		return errors.New("card.pan_expiration_month is invalid")
	}
	if c.PanExpirationYear <= 0 {
		return errors.New("card.pan_expiration_year is invalid")
	}

	return nil
}

type PANCheckoutRequest struct {
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

	Card PANCheckoutCard `json:"card"`
}

type PANCheckoutResponse struct {
	PaymentToken string `json:"payment_token"`
}

func (h *InternalHandler) PANCheckout(rw http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	checkoutReq := &PANCheckoutRequest{}
	dec := json.NewDecoder(req.Body)
	if err := dec.Decode(checkoutReq); err != nil {
		h.sendError(ctx, rw, http.StatusBadRequest,
			api.CodeInvalidRequest, "can't parse payload: "+err.Error())
		return
	}

	if err := checkoutReq.TransactionInfo.Validate(); err != nil {
		h.sendError(ctx, rw, http.StatusBadRequest, api.CodeInvalidRequest, err.Error())
		return
	}

	pubKey, err := h.keyVerifier.Verify(checkoutReq.RecipientPublicKey, checkoutReq.RecipientPublicKeySignature)
	if err != nil {
		h.sendError(ctx, rw, http.StatusBadRequest, api.CodeInvalidPublicKey, err.Error())
		return
	}

	recipientID := checkoutReq.RecipientID
	if len(recipientID) == 0 {
		h.sendError(ctx, rw, http.StatusBadRequest,
			api.CodeInvalidRecipientID, "recipient_id is required")
		return
	}

	card := checkoutReq.Card
	if err := card.Validate(); err != nil {
		h.sendError(ctx, rw, http.StatusBadRequest, api.CodeInvalidCard, err.Error())
		return
	}

	if checkoutReq.MessageExpiration <= 0 {
		h.sendError(ctx, rw, http.StatusBadRequest,
			api.CodeInvalidMessageExpiration, "message_expiration is invalid")
		return
	}
	if len(checkoutReq.MessageID) == 0 {
		h.sendError(ctx, rw, http.StatusBadRequest,
			api.CodeInvalidMessageID, "message_id is invalid")
		return
	}
	if len(checkoutReq.GatewayMerchantID) == 0 {
		h.sendError(ctx, rw, http.StatusBadRequest,
			api.CodeInvalidGatewayMerchantID, "gateway_merchant_id is invalid")
		return
	}
	if checkoutReq.MITInfo.IsEmpty() && checkoutReq.TransactionInfo.Amount == 0 {
		h.sendError(ctx, rw, http.StatusBadRequest, api.CodeInvalidGatewayMerchantID,
			"MIT is not allowed but transaction_details.amount is \"0\"")
		return
	}

	lastFour := getCardLastFour(card.PrimaryAccountNumber)

	ctxlog.Info(ctx, h.logger, "Checkout PAN card",
		log.String("card_last4", lastFour),
	)

	msg := paymenttoken.EncryptedMessage{
		PaymentMethod: paymenttoken.PaymentMethodCard,
		PaymentMethodDetails: paymenttoken.PaymentMethodDetails{
			AuthMethod:      paymenttoken.AuthMethodPANOnly,
			PAN:             card.PrimaryAccountNumber,
			ExpirationMonth: card.PanExpirationMonth,
			ExpirationYear:  card.PanExpirationYear,
		},
		MessageID:         checkoutReq.MessageID,
		MessageExpiration: strconv.FormatInt(checkoutReq.MessageExpiration, 10),
		GatewayMerchantID: checkoutReq.GatewayMerchantID,
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

	token, err := h.tokenSender.SealJSONMessage(recipientID, msg, pubKey)
	if err != nil {
		h.sendError(ctx, rw, http.StatusInternalServerError, api.CodeInternal, err.Error())
		return
	}

	checkoutResp := PANCheckoutResponse{
		PaymentToken: token,
	}

	h.sendResponse(ctx, rw, http.StatusOK, &checkoutResp)
}

type ThalesEncryptedCardRequest struct {
	Card PANCheckoutCard `json:"card"`
}

type ThalesEncryptedCardResponse struct {
	EncryptedCard string `json:"encrypted_card"`
}

type ThalesEncryptedMessage struct {
	PAN        string `json:"fpan"`
	Expiration string `json:"exp"`
	CVV        string `json:"cvv,omitempty"`
}

// See https://digital-payment-ttr.docs.stoplight.io/use-cases/card-enrollment/green-flow/card-info-encryption
func (h *InternalHandler) ThalesEncryptedCard(rw http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	reqData := ThalesEncryptedCardRequest{}
	reqDec := json.NewDecoder(req.Body)

	if err := reqDec.Decode(&reqData); err != nil {
		h.sendError(
			ctx, rw, http.StatusBadRequest,
			api.CodeInvalidBody,
			fmt.Sprintf("can't parse payload: %s", err.Error()),
		)
		return
	}

	card := reqData.Card
	if err := card.Validate(); err != nil {
		h.sendError(
			ctx, rw, http.StatusBadRequest,
			api.CodeInvalidCard, err.Error(),
		)
		return
	}

	encryptedMessage := ThalesEncryptedMessage{
		PAN:        card.PrimaryAccountNumber,
		Expiration: fmt.Sprintf("%02d%02d", card.PanExpirationMonth%100, card.PanExpirationYear%100),
		CVV:        card.CVV,
	}
	obj, err := json.Marshal(&encryptedMessage)
	if err != nil {
		h.sendError(
			ctx, rw, http.StatusBadRequest,
			api.CodeInternal, err.Error(),
		)
		return
	}

	encrypted, err := EncryptCMS(obj, h.thalesCert)
	if err != nil {
		h.sendError(
			ctx, rw, http.StatusInternalServerError,
			api.CodeInternal, err.Error(),
		)
		return
	}

	response := ThalesEncryptedCardResponse{
		EncryptedCard: encrypted,
	}

	h.sendResponse(ctx, rw, http.StatusOK, &response)
}

func getCardLastFour(pan string) string {
	n := 4
	if len(pan) < n {
		n = len(pan)
	}
	return pan[len(pan)-n:]
}

type internalAPIError struct {
	Status string          `json:"status"`
	Code   int             `json:"code"`
	Data   json.RawMessage `json:"data,omitempty"`
}

func handleJSONError(ctx context.Context, logger log.Logger, logMsg string, rw http.ResponseWriter, err error) {
	cerr, ok := err.(interactionerror.InteractionError)
	if !ok {
		sendAPIError(ctx, logger, rw, http.StatusInternalServerError, api.CodeInternal, err.Error())
		return
	}

	ctxlog.Error(ctx, logger, logMsg, cerr.LogFields()...)

	rw.Header().Set("Content-Type", "application/json; charset=utf-8")
	for k, v := range cerr.CorrelationHeaders() {
		rw.Header().Set(k, v)
	}
	rw.Header().Set("X-Content-Type-Options", "nosniff")
	rw.WriteHeader(cerr.GetStatusCode())

	msg := internalAPIError{
		Status: api.StatusFail,
		Code:   cerr.GetStatusCode(),
		Data:   cerr.GetRawMessage(),
	}

	enc := json.NewEncoder(rw)
	_ = enc.Encode(&msg)
}

func (h *InternalHandler) sendError(ctx context.Context, rw http.ResponseWriter, statusCode int, messageCode api.Code, description string) {
	sendAPIError(ctx, h.logger, rw, statusCode, messageCode, description)
}

func (h *InternalHandler) sendResponse(ctx context.Context, rw http.ResponseWriter, statusCode int, data interface{}) {
	sendAPIResponse(ctx, h.logger, rw, statusCode, data)
}
