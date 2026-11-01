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

	srv := &http.Server{Addr: ":8080", Handler: routes(), ReadHeaderTimeout: 5 * time.Second}
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

// routes answers under the full public path: Traefik doesn't strip /api/auth, so logs and traces
// show the URL the browser used.
func routes() *http.ServeMux {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /api/auth/health", health)
	return mux
}

func health(w http.ResponseWriter, _ *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	_, _ = w.Write([]byte(`{"status":"ok"}` + "\n"))
}
