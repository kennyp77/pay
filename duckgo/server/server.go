package server

import (
	"context"
	"fmt"
	xlog "log"
	"net"
	"net/http"

	"a.yandex-team.ru/library/go/core/log"

	"a.yandex-team.ru/pay/duckgo/visa"
)

// Server wraps HTTP server
type Server struct {
	config *Config

	logger         log.Logger
	internalServer *http.Server
	externalServer *http.Server

	healthChecks []HealthCheck
}

// New allocates new Server
func New(config *Config) (*Server, error) {
	logger, err := newLogger(&config.Logger)
	if err != nil {
		panic(err)
	}

	srv := &Server{
		config: config,
		logger: logger,
	}

	mcClient, err := newMastercardClient(logger.WithName("mastercard_client"), &config.Mastercard)
	if err != nil {
		return nil, err
	}
	srv.AddHealthCheck("mastercard_client", mcClient.HealthCheck)

	var vClient *visa.Client = nil
	if config.Visa.IsEnabled {
		vClient, err = newVisaClient(logger.WithName("visa_client"), &config.Visa)
		if err != nil {
			return nil, err
		}
		srv.AddHealthCheck("visa_client", vClient.HealthCheck)
	}

	tokenSender, err := newTokenSender(&config.PaymentToken)
	if err != nil {
		return nil, err
	}

	keyVerifier, err := newRecipientKeyVerifier(&config.PaymentToken)
	if err != nil {
		return nil, err
	}

	thalesCert, err := loadCertificate(config.Wallet.Thales.CardEncryptionCertPath)

	if err != nil {
		return nil, err
	}

	internalHandler, err := NewInternalHandler(
		logger.WithName("internal_api"),
		&config.InternalAPI,
		mcClient,
		vClient,
		tokenSender,
		keyVerifier,
		thalesCert,
	)
	if err != nil {
		return nil, err
	}

	externalHandler, err := NewExternalHandler(
		logger.WithName("external_api"),
		&config.ExternalAPI,
		srv,
		mcClient,
		vClient,
		tokenSender,
		keyVerifier,
	)
	if err != nil {
		return nil, err
	}

	srv.internalServer = &http.Server{
		Handler: internalHandler,
	}
	srv.externalServer = &http.Server{
		Handler: externalHandler,
	}
	return srv, nil
}

func (s *Server) Start() {
	if err := s.start(); err != nil {
		xlog.Fatalf("Server Start error: %v", err)
	}
}

func (s *Server) GetExternalAPIEndpoint() string {
	return s.externalServer.Addr
}

func (s *Server) GetInternalAPIEndpoint() string {
	return s.internalServer.Addr
}

func (s *Server) start() error {
	if err := s.startInternalAPI(); err != nil {
		return err
	}

	return s.startExternalAPI()
}

func (s *Server) goServe(name string, serveFunc func() error) {
	go func() {
		err := serveFunc()
		if err != nil && err != http.ErrServerClosed {
			xlog.Fatalf("Server %q error: %v", name, err)
		}
	}()
}

func (s *Server) startInternalAPI() error {
	l, err := net.Listen("tcp", s.config.InternalAPI.ListenAddr)
	if err != nil {
		return err
	}

	s.internalServer.Addr = l.Addr().String()
	s.goServe("internal", func() error {
		return s.internalServer.Serve(l)
	})

	return nil
}

func (s *Server) startExternalAPI() error {
	l, err := net.Listen("tcp", s.config.ExternalAPI.ListenAddr)
	if err != nil {
		return err
	}

	s.externalServer.Addr = l.Addr().String()
	serveFunc := func() error {
		return s.externalServer.ServeTLS(l,
			s.config.ExternalAPI.CertFile, s.config.ExternalAPI.KeyFile)
	}

	if s.config.ExternalAPI.DisableTLS {
		serveFunc = func() error {
			return s.externalServer.Serve(l)
		}
	}

	s.goServe("external", serveFunc)
	return nil
}

func (s *Server) Shutdown(ctx context.Context) {
	_ = s.externalServer.Shutdown(ctx)
	_ = s.internalServer.Shutdown(ctx)
}

func (s *Server) HealthCheck(ctx context.Context) error {
	for i := range s.healthChecks {
		if err := s.healthChecks[i].Check(ctx); err != nil {
			return fmt.Errorf("server: healthcheck %q error: %v", s.healthChecks[i].Name, err)
		}
	}
	return nil
}

func (s *Server) AddHealthCheck(name string, check func(ctx context.Context) error) {
	s.healthChecks = append(s.healthChecks, HealthCheck{
		Name:  name,
		Check: check,
	})
}
