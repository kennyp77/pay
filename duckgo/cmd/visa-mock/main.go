package main

import (
	"flag"
	xlog "log"
	"net"
	"os"
	"os/signal"
	"syscall"

	"a.yandex-team.ru/library/go/core/log"
	"a.yandex-team.ru/library/go/core/log/zap"

	"a.yandex-team.ru/pay/duckgo/visa"
	"a.yandex-team.ru/pay/duckgo/visa/visamock"
)

func main() {
	var (
		listenAddr    string
		signingKeyID  string
		encKeyID      string
		signingKeySec string
		encKeySec     string
	)
	flag.StringVar(&listenAddr, "listen", "", "Listen address. For example, localhost:2021")
	flag.StringVar(&encKeyID, "encryption-key-id", "", "encryption key id")
	flag.StringVar(&encKeySec, "encryption-key-secret", "", "encryption key secret")
	flag.StringVar(&signingKeyID, "signing-key-id", "", "signing key id")
	flag.StringVar(&signingKeySec, "signing-key-secret", "", "signing key secret")
	flag.Parse()

	if listenAddr == "" {
		flag.Usage()
		return
	}

	resolve(&signingKeyID, "VISA_SIGNING_KEY_ID", "visa-signing-key-id")
	resolve(&signingKeySec, "VISA_SIGNING_KEY_SECRET", "visa-signing-key-secret")
	resolve(&encKeyID, "VISA_ENCRYPTION_KEY_ID", "visa-enc-key-id")
	resolve(&encKeySec, "VISA_ENCRYPTION_KEY_SECRET", "visa-enc-key-secret")

	logger, err := zap.NewDeployLogger(log.DebugLevel)
	if err != nil {
		xlog.Fatalf("Can't create zap logger: %v", err)
	}

	l, err := net.Listen("tcp", listenAddr)
	if err != nil {
		logger.Fatal("Can't listen address",
			log.String("listen_addr", listenAddr),
			log.Error(err),
		)
	}

	mock := visamock.NewVTSServer(logger,
		visamock.WithListener(l),
		visamock.WithSigningKey(&visa.SharedKey{
			KeyID:  signingKeyID,
			Secret: signingKeySec,
		}),
		visamock.WithEncryptionKey(&visa.SharedKey{
			KeyID:  encKeyID,
			Secret: encKeySec,
		}),
		visamock.WithEnrollAnyCard())

	logger.Info("Serving mocked VISA VTS API",
		log.String("base_url", mock.GetBaseURL()),
	)

	terminate := make(chan os.Signal, 1)
	signal.Notify(terminate, os.Interrupt, syscall.SIGTERM)
	sig := <-terminate
	xlog.Printf("Received terminate signal: signal=%s", sig.String())

	mock.Close()
}

func resolve(val *string, envName, defaultValue string) {
	if *val != "" {
		return
	}

	if envVal, ok := os.LookupEnv(envName); ok {
		*val = envVal
	} else if defaultValue != "" {
		*val = defaultValue
	}
	if *val == "" {
		panic("missing required env var $" + envName + " or related argument")
	}
}
