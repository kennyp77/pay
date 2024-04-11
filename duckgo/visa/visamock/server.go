package visamock

import (
	"bytes"
	"context"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"math/rand"
	"net"
	"net/http"
	"net/http/httptest"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/gofrs/uuid"

	"a.yandex-team.ru/library/go/core/log"

	"a.yandex-team.ru/pay/duckgo/visa"
)

type VTSServer struct {
	logger   log.Logger
	listener net.Listener

	jwe *visa.JWEEncrypter

	server     *httptest.Server
	signingKey *visa.SharedKey

	paymentInstruments map[string]*visa.PaymentInstrument
	tokens             map[string]string
	provisionedInfos   map[string]provisionInfo

	allowUnknownCards     bool
	allowedRelationshipID string

	lock sync.Mutex
}

type VTSServerOption interface {
	apply(server *VTSServer)
}

type vtsServerOptionFunc func(*VTSServer)

func (f vtsServerOptionFunc) apply(sender *VTSServer) {
	f(sender)
}

func WithListener(l net.Listener) VTSServerOption {
	return vtsServerOptionFunc(func(server *VTSServer) {
		server.listener = l
	})
}

func WithEncryptionKey(encryptionKey *visa.SharedKey) VTSServerOption {
	return vtsServerOptionFunc(func(server *VTSServer) {
		server.jwe = &visa.JWEEncrypter{Key: encryptionKey}
	})
}

func WithSigningKey(signingKey *visa.SharedKey) VTSServerOption {
	return vtsServerOptionFunc(func(server *VTSServer) {
		server.signingKey = signingKey
	})
}

func WithEnrollAnyCard() VTSServerOption {
	return vtsServerOptionFunc(func(server *VTSServer) {
		server.allowUnknownCards = true
	})
}

func WithAllowedRelationshipID(relationshipID string) VTSServerOption {
	return vtsServerOptionFunc(func(server *VTSServer) {
		server.allowedRelationshipID = relationshipID
	})
}

func NewVTSServer(logger log.Logger, opts ...VTSServerOption) *VTSServer {
	srv := VTSServer{
		logger:                logger,
		allowedRelationshipID: "123-123",
	}

	for i := range opts {
		opts[i].apply(&srv)
	}

	if srv.signingKey == nil {
		panic("inbound keys are required")
	}
	if srv.jwe == nil {
		panic("encryption keys are required")
	}

	mux := chi.NewRouter()

	mux.Use(srv.auth)
	mux.Use(middleware.RequestID)

	mux.Post("/check_oauth", srv.handleCheckOAuth)

	mux.Route("/vts", func(r chi.Router) {
		r.Use(srv.relationshipIDChecker)
		r.Post("/provisionedTokens", srv.handleEnrollCard)
		r.Post("/v2/provisionedTokens/{provisionedTokenId}/paymentData", srv.handleGetPaymentData)
		r.Get("/provisionedTokens/{provisionedTokenId}", srv.handleGetTokenInfo)
	})

	srv.tokens = make(map[string]string)

	srv.provisionedInfos = make(map[string]provisionInfo)
	srv.paymentInstruments = make(map[string]*visa.PaymentInstrument)

	defaultPAN := "5204731600014792"
	never := visa.ExpirationDate{
		Year:  "2099",
		Month: "12",
	}
	srv.generateRandomPaymentInstrument(defaultPAN, never)

	if srv.listener == nil {
		srv.server = httptest.NewServer(mux)
		return &srv
	}

	srv.server = &httptest.Server{
		Listener: srv.listener,
		Config:   &http.Server{Handler: mux},
	}

	srv.server.Start()

	return &srv
}

func (s *VTSServer) GetBaseURL() string {
	return s.server.URL
}

func (s *VTSServer) GetOrCreateToken(pan string) string {
	s.lock.Lock()
	defer s.lock.Unlock()

	token, ok := s.tokens[pan]
	if !ok {
		token = strconv.FormatInt(time.Now().Unix(), 10)
		s.tokens[pan] = token
	}
	return token
}

func GetProvisionedKey(pan string, clientWalletAccauntID string) string {
	key := pan + "-" + clientWalletAccauntID
	shaBytes := sha256.Sum256([]byte(key))
	return base64.URLEncoding.EncodeToString(shaBytes[:])
}

func (s *VTSServer) GetOrCreateProvisionedID(pan string, clientWalletAccauntID string) string {
	s.lock.Lock()
	defer s.lock.Unlock()

	provisionedID := GetProvisionedKey(pan, clientWalletAccauntID)

	_, ok := s.provisionedInfos[provisionedID]
	if !ok {
		s.provisionedInfos[provisionedID] = provisionInfo{
			pan:      pan,
			clientID: clientWalletAccauntID,
		}
	}

	return provisionedID
}

func (s *VTSServer) Close() {
	s.server.Close()
}

func (s *VTSServer) handleEnrollCard(rw http.ResponseWriter, req *http.Request) {
	dec := json.NewDecoder(req.Body)
	enroll := &visa.EnrollCardRequest{}
	err := dec.Decode(&enroll)
	if err != nil {
		sendAPIError(rw, errorResponse{
			Status:  http.StatusBadRequest,
			Message: "cant deserialize incomming message",
			Reason:  "wrongJsonFormat",
		})
		return
	}

	if req.URL.Query().Get("relationshipID") == "" {
		sendAPIError(rw, errorResponse{
			Status:  http.StatusBadRequest,
			Message: "relationshipID is required",
			Reason:  "relationshipID",
		})
		return
	}

	var errs []error
	notEmpty := func(val string, msg string) {
		if len(val) == 0 {
			errs = append(errs, fmt.Errorf("empty %s", msg))
		}
	}

	ensure := func(val bool, msg string) {
		if !val {
			errs = append(errs, fmt.Errorf("empty %s", msg))
		}
	}

	notEmpty(enroll.Locale, "locale")
	notEmpty(enroll.ClientAppID, "clientAppId")
	notEmpty(enroll.ClientWalletAccountEmailAddressHash, "clientWalletAccountEmailAddress")
	notEmpty(enroll.ClientWalletAccountID, "clientWalletAccountID")
	notEmpty(enroll.EncPaymentInstrument, "encPaymentInstrument")
	ensure(enroll.ConsumerEntryMode.IsValid(), "consumerEntryMode")
	ensure(enroll.ProtectionType.IsValid(), "protectionType")
	ensure(enroll.PANSource.IsValid(), "panSource")

	if enroll.PANSource == visa.PANSourceManuallyEntered {
		notEmpty(enroll.EncRiskDataInfo, "risk data info expected fo manually entered cards")
		rd := make([]visa.RiskData, 0, 1)
		err := s.jwe.DecryptAndUnmarshal(enroll.EncRiskDataInfo, &rd)
		ensure(err == nil, "risk data must be decrypted")
	}

	if len(errs) != 0 {
		details := make(map[string]string)
		for i, err := range errs {
			details[fmt.Sprintf("error-%d", i)] = err.Error()
		}

		sendAPIError(rw, errorResponse{
			Status:  http.StatusBadRequest,
			Message: "Your request does not have valid set of parameters required to process the business function.",
			Reason:  "invalidParameter",
			Details: details,
		})
		return
	}

	paymentInstrument, err := s.DecryptPaymentInstrument(enroll.EncPaymentInstrument)
	if err != nil {
		sendAPIError(rw, errorResponse{
			Status:  http.StatusUnauthorized,
			Message: "Credentials API key incorrect.",
			Reason:  "authError",
		})
		return
	}

	pan := paymentInstrument.AccountNumber

	notEmpty(pan, "primaryAccountNumber")
	if len(pan) < 8 || len(pan) > 19 {
		errs = append(errs, fmt.Errorf("invalid PAN length: %s", pan))
	}

	notEmpty(paymentInstrument.ExpirationDate.Month, "expiration month")
	notEmpty(paymentInstrument.ExpirationDate.Year, "expiration year")

	if len(errs) != 0 {
		details := make(map[string]string)
		for i, err := range errs {
			details[fmt.Sprintf("error-%d", i)] = err.Error()
		}

		sendAPIError(rw, errorResponse{
			Status:  http.StatusBadRequest,
			Message: "Your request does not have valid set of parameters required to process the business function.",
			Reason:  "invalidParameter",
			Details: details,
		})
		return
	}

	respPaymentInstrument, ok := s.paymentInstruments[pan]
	if !ok {
		if s.allowUnknownCards {
			respPaymentInstrument = s.generateRandomPaymentInstrument(pan, paymentInstrument.ExpirationDate)
		} else {
			sendAPIError(rw, errorResponse{
				Status:  http.StatusBadRequest,
				Message: "No card with chosen pan found",
				Reason:  "invalidParameter",
				Details: nil,
			})
			return
		}
	}

	token := s.GetOrCreateToken(pan)
	encToken, err := s.jwe.Encrypt("{\"token\":\"" + token + "\"}")
	if err != nil {
		sendAPIError(rw, errorResponse{
			Status:  http.StatusInternalServerError,
			Message: "cant encrypt token",
			Reason:  "internalError",
			Details: nil,
		})
		return
	}

	provisionedID := s.GetOrCreateProvisionedID(pan, enroll.ClientWalletAccountID)

	resp := visa.EnrollCardResponse{
		ProvisionedTokenID: string(provisionedID),
		PanEnrollmentID:    genUUID(),
		PaymentInstrument:  *respPaymentInstrument,
		TokenInfo: visa.TokenInfo{
			TokenStatus:      visa.TokenStatusActive,
			TokenRequestorID: "40010082083",
			TokenReferenceID: genUUID(),
			Last4:            pan[len(pan)-4:],
			ExpirationDate:   respPaymentInstrument.ExpirationDate,
			EncTokenInfo:     encToken,
		},
	}

	rw.Header().Set("Content-Type", "application/json; charset=utf-8")
	rw.Header().Set("X-Correlation-Id", genUUID())
	rw.Header().Set("X-Response-Id", middleware.GetReqID(req.Context()))

	enc := json.NewEncoder(rw)
	err = enc.Encode(&resp)

	if err != nil {
		s.logger.Error("enroll: can't write response", log.Error(err))
		sendAPIError(rw, errorResponse{
			Status:  http.StatusInternalServerError,
			Message: "cant write response",
			Reason:  "internalError",
			Details: nil,
		})
		return
	}
}

func (s *VTSServer) handleCheckOAuth(rw http.ResponseWriter, req *http.Request) {
	_, _ = rw.Write([]byte("OK"))
}

type ContextKey string

const ContextRelationshipID ContextKey = "relationship_id"

func (s *VTSServer) relationshipIDChecker(next http.Handler) http.Handler {
	fn := func(rw http.ResponseWriter, req *http.Request) {
		ctx := req.Context()
		relID, err := s.verifyRelationshipID(req)
		if err != nil {
			sendAPIError(rw, errorResponse{
				Status:  http.StatusUnauthorized,
				Message: err.Error(),
				Reason:  "ERROR",
			})
			return
		}
		ctx = context.WithValue(ctx, ContextRelationshipID, relID)
		next.ServeHTTP(rw, req.WithContext(ctx))
	}
	return http.HandlerFunc(fn)
}

func (s *VTSServer) verifyRelationshipID(req *http.Request) (string, error) {
	relID := req.URL.Query().Get("relationshipID")
	if relID == "" {
		return "", errors.New("vts: relationship_id is missing")
	}
	if relID != s.allowedRelationshipID {
		return "", fmt.Errorf("vts: relationship_id %s is not allowed", relID)
	}

	return relID, nil
}

func (s *VTSServer) auth(next http.Handler) http.Handler {
	fn := func(rw http.ResponseWriter, req *http.Request) {
		ctx := req.Context()
		if err := s.verifyAuth(req); err != nil {
			sendAPIError(rw, errorResponse{
				Status:  http.StatusUnauthorized,
				Message: "Token Validation Failed",
				Reason:  "ERROR",
			})
			return
		}
		next.ServeHTTP(rw, req.WithContext(ctx))
	}
	return http.HandlerFunc(fn)
}

func (s *VTSServer) verifyAuth(req *http.Request) error {
	reqIDHeader := req.Header.Get("x-request-id")
	if reqIDHeader == "" {
		return errors.New("missing x-request-id id header")
	}

	authHeader := req.Header.Get("x-pay-token")
	if authHeader == "" {
		return errors.New("empty auth header")
	}

	if req.URL.Query().Get("apiKey") == "" {
		return errors.New("apiKey is missing")
	}

	parts := strings.Split(authHeader, ":")
	if len(parts) != 3 || parts[0] != "xv2" {
		return errors.New("wrong key format, 3 expected xv2:ts:sig")
	}

	timestampString := parts[1]
	ts, err := strconv.ParseInt(timestampString, 10, 64)
	if err != nil {
		return err
	}

	if time.Now().Unix()-ts > int64(10*time.Second) {
		return errors.New("auth expired")
	}

	if req.Body == nil {
		return nil
	}

	body, err := ioutil.ReadAll(req.Body)
	if err != nil {
		return err
	}

	req.Body = ioutil.NopCloser(bytes.NewBuffer(body))

	expected := visa.MakeAuthHeaderForTimestamp(ts, req.URL, body, s.signingKey.Secret)
	if expected != authHeader {
		return errors.New("wrong signature")
	}

	if req.URL.Query().Get("apiKey") != s.signingKey.KeyID {
		return errors.New("wrong api key")
	}
	return nil
}

func (s *VTSServer) DecryptPaymentInstrument(encrypted string) (*visa.ReqPaymentInstrument, error) {
	result := visa.ReqPaymentInstrument{}
	err := s.jwe.DecryptAndUnmarshal(encrypted, &result)
	if err != nil {
		return nil, err
	}
	return &result, nil
}

func (s *VTSServer) handleGetTokenInfo(rw http.ResponseWriter, req *http.Request) {
	provisionedTokenID := chi.URLParam(req, "provisionedTokenId")

	send404 := func() {
		sendAPIError(rw, errorResponse{
			Status:  http.StatusBadRequest,
			Message: "No DeployedToken found",
			Reason:  "invalidParameter",
			Details: nil,
		})
	}

	info, ok := s.provisionedInfos[provisionedTokenID]
	if !ok {
		send404()
		return
	}

	pi, ok := s.paymentInstruments[info.pan]
	if !ok {
		send404()
		return
	}

	tokenInfo := visa.TokenInfo{
		TokenStatus:    visa.TokenStatusActive,
		ExpirationDate: pi.ExpirationDate,
	}

	rw.Header().Set("Content-Type", "application/json; charset=utf-8")
	rw.Header().Set("X-Correlation-Id", genUUID())
	rw.Header().Set("X-Response-Id", middleware.GetReqID(req.Context()))

	enc := json.NewEncoder(rw)
	err := enc.Encode(&tokenInfo)

	if err != nil {
		s.logger.Error("tokenInfo: can't write response", log.Error(err))
		sendAPIError(rw, errorResponse{
			Status:  http.StatusInternalServerError,
			Message: "cant write response",
			Reason:  "internalError",
		})
		return
	}
}

func (s *VTSServer) handleGetPaymentData(rw http.ResponseWriter, req *http.Request) {
	provisionedTokenID := chi.URLParam(req, "provisionedTokenId")

	info, ok := s.provisionedInfos[provisionedTokenID]
	if !ok {
		sendAPIError(rw, errorResponse{
			Status:  http.StatusBadRequest,
			Message: "No DeployedToken found",
			Reason:  "invalidParameter",
			Details: nil,
		})
		return
	}

	pi, ok := s.paymentInstruments[info.pan]
	if !ok {
		sendAPIError(rw, errorResponse{
			Status:  http.StatusBadRequest,
			Message: "No DeployedToken found",
			Reason:  "invalidParameter",
			Details: nil,
		})
		return
	}

	token := s.GetOrCreateToken(info.pan)

	encToken, err := s.jwe.Encrypt("{\"token\":\"" + token + "\"}")

	if err != nil {
		sendAPIError(rw, errorResponse{
			Status:  http.StatusInternalServerError,
			Message: "cant encrypt token",
			Reason:  "internalError",
		})
		return
	}

	resp := visa.PaymentDataResponse{
		PaymentDataID: genUUID(),
		PaymentInstrument: visa.PaymentInstrument{
			Last4:                   pi.Last4,
			PaymentAccountReference: pi.PaymentAccountReference,
		},
		TokenInfo: visa.TokenInfo{
			EncTokenInfo:   encToken,
			Last4:          token[len(token)-4:],
			ExpirationDate: pi.ExpirationDate,
		},
		CryptogramInfo: visa.CryptogramInfo{
			Cryptogram: "sandbox-cryptogram",
			ECI:        "08",
			ATC:        "92",
		},
	}
	rw.Header().Set("Content-Type", "application/json; charset=utf-8")
	rw.Header().Set("X-Correlation-Id", genUUID())
	rw.Header().Set("X-Response-Id", middleware.GetReqID(req.Context()))

	enc := json.NewEncoder(rw)
	err = enc.Encode(&resp)

	if err != nil {
		s.logger.Error("enroll: can't write response", log.Error(err))
		sendAPIError(rw, errorResponse{
			Status:  http.StatusInternalServerError,
			Message: "cant write response",
			Reason:  "internalError",
		})
		return
	}
}

func sendAPIError(rw http.ResponseWriter, errResp errorResponse) {
	rw.Header().Set("Content-Type", "application/json; charset=utf-8")
	rw.Header().Set("X-Content-Type-Options", "nosniff")
	rw.WriteHeader(errResp.Status)

	enc := json.NewEncoder(rw)
	_ = enc.Encode(&errResp)
}

func genUUID() string {
	id, err := uuid.NewV4()
	if err != nil {
		panic(err)
	}

	return id.String()
}

func (s *VTSServer) generateRandomPaymentInstrument(pan string, expDate visa.ExpirationDate) *visa.PaymentInstrument {
	s.lock.Lock()
	defer s.lock.Unlock()

	if pi, ok := s.paymentInstruments[pan]; ok {
		return pi
	}

	randomPAR := func() string {
		l := []byte("0123456789")
		r := make([]byte, 28)
		for i := 0; i < len(r); i++ {
			r[i] = l[rand.Intn(len(l))]
		}
		return "V" + string(r)
	}

	pi := &visa.PaymentInstrument{
		Last4:                   pan[len(pan)-4:],
		ExpirationDate:          expDate,
		ExpDatePrintedInd:       visa.VisaBoolTrue,
		CVV2PrintedInd:          visa.VisaBoolTrue,
		PaymentAccountReference: randomPAR(),
		EnabledServices: visa.EnabledServices{
			MerchantPresentedQR: visa.VisaBoolFalse,
		},
	}

	s.paymentInstruments[pan] = pi
	return pi
}

type errorResponse struct {
	Status  int    `json:"status"`
	Message string `json:"message"`
	Reason  string `json:"reason"`

	Details map[string]string `json:"details"`
}

type provisionInfo struct {
	pan      string
	clientID string
}
