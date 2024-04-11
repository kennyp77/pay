package mcmock

import (
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha1"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"net"
	"net/http"
	"net/http/httptest"
	"sync"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-resty/resty/v2"
	"github.com/gofrs/uuid"
	"gopkg.in/square/go-jose.v2"

	"a.yandex-team.ru/library/go/core/log"

	"a.yandex-team.ru/pay/duckgo/mastercard"
)

type Service struct {
	EncryptionKey jose.JSONWebKey
}

type SRCServer struct {
	logger   log.Logger
	listener net.Listener

	serverEncryptionKey   jose.JSONWebKey
	serverVerificationKey jose.JSONWebKey

	cardsLock       sync.Mutex
	cards           map[string]*EnrolledCard
	consumerIDByKey map[string]string
	consumers       map[string]*EnrolledConsumer
	services        map[string]*Service

	server *httptest.Server
}

func mustGenerateRSAKey() *rsa.PrivateKey {
	key, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		panic(err)
	}
	return key
}

type SRCServerOption interface {
	apply(server *SRCServer)
}

type srcServerOptionFunc func(*SRCServer)

func (f srcServerOptionFunc) apply(sender *SRCServer) {
	f(sender)
}

func WithListener(l net.Listener) SRCServerOption {
	return srcServerOptionFunc(func(server *SRCServer) {
		server.listener = l
	})
}

func NewSRCServer(logger log.Logger, opts ...SRCServerOption) *SRCServer {
	encryptionKey := jose.JSONWebKey{
		Key:       mustGenerateRSAKey(),
		KeyID:     "149123-src-fpan-encryption",
		Algorithm: "RSA-OAEP-256",
		Use:       "enc",
	}
	verificationKey := jose.JSONWebKey{
		Key:       mustGenerateRSAKey(),
		KeyID:     "151091-src-payload-verification",
		Algorithm: "RS256",
		Use:       "sig",
	}

	srv := SRCServer{
		logger:                logger,
		serverEncryptionKey:   encryptionKey,
		serverVerificationKey: verificationKey,
		cards:                 make(map[string]*EnrolledCard),
		consumerIDByKey:       make(map[string]string),
		consumers:             make(map[string]*EnrolledConsumer),
		services:              make(map[string]*Service),
	}

	for i := range opts {
		opts[i].apply(&srv)
	}

	mux := chi.NewRouter()
	mux.Post("/src/api/digital/payments/cards", srv.handleEnrollCard)
	mux.Post("/src/api/digital/payments/transaction/credentials", srv.handleCheckout)
	mux.Post("/check_oauth", srv.handleCheckOAuth)
	mux.Get("/keys", srv.getKeys)

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

func (s *SRCServer) GetBaseURL() string {
	return s.server.URL
}

func (s *SRCServer) GetKeysURL() string {
	return s.server.URL + "/keys"
}

func (s *SRCServer) Close() {
	s.server.Close()
}

func (s *SRCServer) RegisterService(serviceID string, srv *Service) {
	s.services[serviceID] = srv
}

func (s *SRCServer) handleEnrollCard(rw http.ResponseWriter, req *http.Request) {
	dec := json.NewDecoder(req.Body)
	enroll := &mastercard.EnrollCardRequest{}
	err := dec.Decode(&enroll)
	if err != nil {
		http.Error(rw, "unmarshal request: "+err.Error(), http.StatusBadRequest)
		return
	}

	_, found := s.services[enroll.ServiceID]
	if !found {
		http.Error(rw, "service not found", http.StatusNotFound)
		return
	}

	var errs []error
	notEmpty := func(val string, msg string) {
		if len(val) == 0 {
			errs = append(errs, fmt.Errorf("empty %s", msg))
		}
	}
	notEmpty(enroll.ServiceID, "serviceId")
	notEmpty(enroll.SRCCorrelationID, "srcCorrelationId")
	notEmpty(enroll.SRCClientID, "srcClientId")
	notEmpty(enroll.CardSource.String(), "cardSource")
	notEmpty(enroll.EncryptedCard, "encryptedCard")
	notEmpty(enroll.Consumer.ConsumerIdentity.IdentityValue, "consumer's identityValue")
	notEmpty(enroll.Consumer.ConsumerIdentity.IdentityType.String(), "consumer's identityType")
	if mastercard.IdentityTypeExternalAccountID != enroll.Consumer.ConsumerIdentity.IdentityType {
		errs = append(errs, fmt.Errorf("unexpected consumer's identityType: %s",
			enroll.Consumer.ConsumerIdentity.IdentityType))
	}
	if len(errs) != 0 {
		http.Error(rw, "request validation failed, errors:", http.StatusBadRequest)
		for i := range errs {
			_, _ = fmt.Fprintf(rw, "\t%s\n", errs[i].Error())
		}
		return
	}

	card, err := s.DecryptCard(enroll.EncryptedCard)
	if err != nil {
		http.Error(rw, "card decrypt error: "+err.Error(), http.StatusBadRequest)
		return
	}

	pan := card.PrimaryAccountNumber

	notEmpty(pan, "primaryAccountNumber")
	if len(pan) < 8 || len(pan) > 19 {
		errs = append(errs, fmt.Errorf("invalid PAN length: %s", pan))
	}
	notEmpty(card.PanExpirationMonth, "panExpirationMonth")
	notEmpty(card.PanExpirationYear, "panExpirationYear")
	if len(card.CardSecurityCode) != 0 && len(card.CardSecurityCode) != 3 {
		errs = append(errs, fmt.Errorf("invalid cardSecurityCode: %s", card.CardSecurityCode))
	}
	if len(errs) != 0 {
		http.Error(rw, "card validation failed, errors:", http.StatusBadRequest)
		for i := range errs {
			_, _ = fmt.Fprintf(rw, "\t%s\n", errs[i].Error())
		}
		return
	}

	enrolledCard, _ := s.EnrollCard(enroll.ServiceID, card, &enroll.Consumer)
	resp := mastercard.EnrollCardResponse{
		SRCCorrelationID: enroll.SRCCorrelationID,
		MaskedCard:       enrolledCard.MaskedCard,
	}

	rw.Header().Set("Content-Type", "application/json; charset=utf-8")
	rw.Header().Set("Correlation-ID", s.genGUID())
	enc := json.NewEncoder(rw)
	err = enc.Encode(&resp)

	if err != nil {
		s.logger.Error("enroll: can't write response", log.Error(err))
	}
}

type EnrolledCard struct {
	CardID               string
	PrimaryAccountNumber string
	PAR                  string
	DPAN                 string

	MaskedCard mastercard.MaskedCard
}

type EnrolledConsumer struct {
	ConsumerID    string
	EnrolledCards []*EnrolledCard
}

func (s *SRCServer) EnrollCard(serviceID string, card *mastercard.Card, consumer *mastercard.Consumer) (
	*EnrolledCard, *EnrolledConsumer,
) {
	return s.EnrollCardWithFixedCardID(serviceID, s.genGUID(), card, consumer)
}

func (s *SRCServer) EnrollCardWithFixedCardID(serviceID string, cardID string, card *mastercard.Card, consumer *mastercard.Consumer) (
	*EnrolledCard, *EnrolledConsumer,
) {
	s.cardsLock.Lock()
	defer s.cardsLock.Unlock()

	enrolledConsumer := s.getOrCreateConsumer(serviceID, consumer)
	par := s.getOrCreatePAR(card.PrimaryAccountNumber)
	enrolledCard := s.getOrCreateCard(serviceID, enrolledConsumer, par, cardID, card)

	return enrolledCard, enrolledConsumer
}

func (s *SRCServer) getOrCreateConsumer(serviceID string, consumer *mastercard.Consumer) *EnrolledConsumer {
	consumerKey := serviceID + ":" + consumer.ConsumerIdentity.IdentityValue
	consumerID, found := s.consumerIDByKey[consumerKey]
	if !found {
		consumerID = s.genGUID()
		s.consumerIDByKey[consumerKey] = consumerID
	}

	enrolledConsumer, found := s.consumers[consumerID]
	if !found {
		enrolledConsumer = &EnrolledConsumer{
			ConsumerID: consumerID,
		}
		s.consumers[consumerID] = enrolledConsumer
	}
	return enrolledConsumer
}

func (s *SRCServer) getOrCreatePAR(pan string) (par string) {
	return fmt.Sprintf("%x", sha1.Sum([]byte(pan)))
}

func (s *SRCServer) getOrCreateCard(serviceID string, enrolledConsumer *EnrolledConsumer, par string, cardID string, card *mastercard.Card) *EnrolledCard {
	pan := card.PrimaryAccountNumber
	for _, c := range enrolledConsumer.EnrolledCards {
		if c.PrimaryAccountNumber == pan {
			return c
		}
	}

	const dpan = "5105105105105100"

	enrolledCard := &EnrolledCard{
		CardID:               cardID,
		PrimaryAccountNumber: pan,
		PAR:                  par,
		DPAN:                 dpan,

		MaskedCard: mastercard.MaskedCard{
			SRCDigitalCardID:   cardID,
			PANExpirationMonth: card.PanExpirationMonth,
			PANExpirationYear:  card.PanExpirationYear,
			PANBin:             pan[:6],
			PANLastFour:        pan[len(pan)-4:],

			TokenLastFour: dpan[len(dpan)-4:],

			ServiceID: serviceID,

			PaymentAccountReference: par,

			DigitalCardData: mastercard.DigitalCardData{
				Status:         "ACTIVE",
				DescriptorName: "mastercard",
				ArtURI:         "https://stage.assets.mastercard.com/card-art/combined-image-asset/661032b6-b10a-4d33-91ab-a0ec917d9123.png",
			},

			DateOfCardCreated: time.Now().UTC().Format(time.RFC3339),
		},
	}

	enrolledConsumer.EnrolledCards = append(
		enrolledConsumer.EnrolledCards,
		enrolledCard,
	)

	s.cards[enrolledCard.CardID] = enrolledCard

	return enrolledCard
}

func (s *SRCServer) genGUID() string {
	id, err := uuid.NewV4()
	if err != nil {
		panic(err)
	}
	return id.String()
}

func (s *SRCServer) DecryptCard(ct string) (*mastercard.Card, error) {
	jwe, err := jose.ParseEncrypted(ct)
	if err != nil {
		return nil, err
	}
	data, err := jwe.Decrypt(s.serverEncryptionKey)
	if err != nil {
		return nil, err
	}
	card := &mastercard.Card{}
	err = json.Unmarshal(data, card)
	if err != nil {
		return nil, err
	}

	// Verify that cardholderFullName key is not present with empty value.
	kv := map[string]interface{}{}
	err = json.Unmarshal(data, &kv)
	if err != nil {
		return nil, err
	}
	ch, ok := kv["cardholderFullName"]
	if ok && len(ch.(string)) == 0 {
		return nil, errors.New("mastercard mock: card: empty cardholder")
	}

	return card, nil
}

func (s *SRCServer) handleCheckOAuth(rw http.ResponseWriter, req *http.Request) {
	if err := s.verifyOAuth(req); err != nil {
		http.Error(rw, err.Error(), http.StatusUnauthorized)
		return
	}
}

func (s *SRCServer) verifyOAuth(req *http.Request) error {
	authHeader := req.Header.Get("Authorization")
	if len(authHeader) == 0 {
		return errors.New("empty auth header")
	}

	// TODO: verify oauth header using s.clientSigningKey.Public()

	return nil
}

func (s *SRCServer) handleCheckout(rw http.ResponseWriter, req *http.Request) {
	if !resty.IsJSONType(req.Header.Get("Content-Type")) {
		http.Error(rw, req.Header.Get("Content-Type"), http.StatusUnsupportedMediaType)
		return
	}

	checkoutRequest := &mastercard.CheckoutRequest{}
	jsonDecoder := json.NewDecoder(req.Body)
	err := jsonDecoder.Decode(checkoutRequest)
	if err != nil {
		http.Error(rw, err.Error(), http.StatusBadRequest)
		return
	}

	service, found := s.services[checkoutRequest.ServiceID]
	if !found {
		http.Error(rw, "service not found", http.StatusNotFound)
		return
	}

	s.cardsLock.Lock()
	defer s.cardsLock.Unlock()

	card, found := s.cards[checkoutRequest.SRCDigitalCardID]
	if !found {
		http.Error(rw, "card not found", http.StatusNotFound)
		return
	}

	payload := &mastercard.RawCheckoutEncryptedPayload{
		Token: mastercard.Token{
			PaymentToken:            card.DPAN,
			PaymentAccountReference: card.PAR,
			TokenExpirationMonth:    card.MaskedCard.PANExpirationMonth,
			TokenExpirationYear:     card.MaskedCard.PANExpirationYear,
		},
		Cryptogram: mastercard.Cryptogram{
			DynamicDataType:  "CARD_APPLICATION_CRYPTOGRAM_SHORT_FORM",
			DynamicDataValue: base64.StdEncoding.EncodeToString([]byte(card.DPAN)),
		},
	}

	encryptedPayload, err := s.encryptPayload(&service.EncryptionKey, payload)
	if err != nil {
		panic(err)
	}

	verified := &mastercard.RawCheckoutVerifiedPayload{
		SRCCorrelationID: checkoutRequest.SRCCorrelationID,
		EncryptedPayload: encryptedPayload,
		MaskedCard:       card.MaskedCard,
	}

	jws, err := s.signPayload(&s.serverVerificationKey, verified)
	if err != nil {
		panic(err)
	}

	checkoutResponse := mastercard.RawCheckoutResponse{
		CheckoutResponseJWS: jws,
	}

	rw.Header().Set("Content-Type", "application/json; charset=utf-8")
	rw.Header().Set("Correlation-ID", s.genGUID())
	jsonEncoder := json.NewEncoder(rw)
	err = jsonEncoder.Encode(checkoutResponse)
	if err != nil {
		s.logger.Error("mastercard/checkout: can't write response", log.Error(err))
	}
}

func (s *SRCServer) getKeys(rw http.ResponseWriter, _ *http.Request) {
	keys := jose.JSONWebKeySet{
		Keys: []jose.JSONWebKey{
			s.serverEncryptionKey.Public(),
			s.serverVerificationKey.Public(),
		},
	}

	rw.Header().Set("Content-Type", "application/json; charset=utf-8")
	enc := json.NewEncoder(rw)
	err := enc.Encode(&keys)
	if err != nil {
		s.logger.Error("getKeys: can't write response", log.Error(err))
	}
}

func (s *SRCServer) encryptPayload(key *jose.JSONWebKey, payload interface{}) (string, error) {
	encrypter, err := jose.NewEncrypter(
		jose.A128GCM,
		jose.Recipient{
			Algorithm: jose.RSA_OAEP_256,
			Key:       key,
		},
		nil,
	)
	if err != nil {
		return "", err
	}

	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		return "", err
	}

	jwe, err := encrypter.Encrypt(payloadBytes)
	if err != nil {
		return "", err
	}

	return jwe.CompactSerialize()
}

func (s *SRCServer) signPayload(key *jose.JSONWebKey, payload interface{}) (string, error) {
	signer, err := jose.NewSigner(jose.SigningKey{
		Algorithm: jose.RS256,
		Key:       key,
	}, nil)
	if err != nil {
		return "", err
	}

	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		return "", err
	}

	jws, err := signer.Sign(payloadBytes)
	if err != nil {
		return "", err
	}

	return jws.CompactSerialize()
}
