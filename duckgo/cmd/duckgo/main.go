package main

import (
	"context"
	"flag"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/coreos/go-systemd/daemon"

	"a.yandex-team.ru/pay/duckgo/server"
)

func main() {
	configPath := flag.String("config", "", "Path to config file")
	flag.Parse()

	if *configPath == "" {
		flag.Usage()
		return
	}

	config := server.NewConfig()
	if err := config.ParseFromFile(*configPath); err != nil {
		log.Fatal(err)
	}
	config.PopulateFromEnv()

	srv, err := server.New(config)
	if err != nil {
		log.Fatal(err)
	}
	srv.Start()

	terminate := make(chan os.Signal, 1)
	signal.Notify(terminate, os.Interrupt, syscall.SIGTERM)

	go func() {
		err := srv.HealthCheck(context.Background())
		if err == nil {
			_, _ = daemon.SdNotify(false, daemon.SdNotifyReady)
		}
	}()

	sig := <-terminate
	log.Printf("Received terminate signal: signal=%s", sig.String())

	srv.Shutdown(context.Background())
	log.Println("Done")
}
