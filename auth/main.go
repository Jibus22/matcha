// Command auth is matcha's account service: registration, login and the tokens other services
// verify.
package main

import (
	"context"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
)

func main() {
	if err := run(); err != nil {
		slog.Error("auth stopped", "error", err)
		os.Exit(1)
	}
}

func run() error {
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	shutdownTelemetry, err := setupTelemetry(ctx)
	if err != nil {
		return err
	}
	defer func() { _ = shutdownTelemetry(context.Background()) }()

	db, err := openDB(ctx)
	if err != nil {
		return err
	}
	defer db.Close()

	// Routes are the full public paths (/api/auth/…): Traefik doesn't strip the prefix, so logs
	// and traces show the URL the browser used.
	s := &server{
		db:        db,
		mail:      smtpMailer{addr: os.Getenv("SMTP_ADDR"), from: os.Getenv("MAIL_FROM")},
		publicURL: os.Getenv("PUBLIC_URL"),
	}
	handler, err := s.routes()
	if err != nil {
		return err
	}
	srv := &http.Server{Addr: ":8080", Handler: instrument(handler), ReadHeaderTimeout: 5 * time.Second}
	errc := make(chan error, 1)
	go func() { errc <- srv.ListenAndServe() }()
	slog.Info("listening", "addr", srv.Addr)

	select {
	case err := <-errc:
		return err
	case <-ctx.Done():
	}
	// Kubernetes sends SIGTERM and waits 30 s before killing: let in-flight requests finish.
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	return srv.Shutdown(shutdownCtx)
}
