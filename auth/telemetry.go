package main

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"strings"
	"time"

	"go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetrichttp"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp"
	"go.opentelemetry.io/otel/propagation"
	sdkmetric "go.opentelemetry.io/otel/sdk/metric"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	"go.opentelemetry.io/otel/trace"
)

// setupTelemetry sends traces and metrics over OTLP to OTEL_EXPORTER_OTLP_ENDPOINT, names the
// service from OTEL_SERVICE_NAME, and writes JSON logs to stdout. The returned function flushes
// what's still buffered.
func setupTelemetry(ctx context.Context) (func(context.Context) error, error) {
	slog.SetDefault(slog.New(traceHandler{slog.NewJSONHandler(os.Stdout, nil)}))

	traces, err := otlptracehttp.New(ctx)
	if err != nil {
		return nil, err
	}
	metrics, err := otlpmetrichttp.New(ctx)
	if err != nil {
		return nil, err
	}
	tp := sdktrace.NewTracerProvider(sdktrace.WithBatcher(traces))
	mp := sdkmetric.NewMeterProvider(sdkmetric.WithReader(sdkmetric.NewPeriodicReader(metrics)))
	otel.SetTracerProvider(tp)
	otel.SetMeterProvider(mp)
	// Read the traceparent header Traefik sends, so auth's span joins the request's trace.
	otel.SetTextMapPropagator(propagation.TraceContext{})

	return func(ctx context.Context) error { return errors.Join(tp.Shutdown(ctx), mp.Shutdown(ctx)) }, nil
}

// instrument gives each request a span and request metrics, and one log line, except for
// Kubernetes' health checks, which would bury real traffic.
func instrument(mux *http.ServeMux) http.Handler {
	logged := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		rec := &statusRecorder{ResponseWriter: w, status: http.StatusOK}
		mux.ServeHTTP(rec, r)
		// The mux has now matched a pattern: name the span after it, not after the raw URL.
		if r.Pattern != "" {
			trace.SpanFromContext(r.Context()).SetName(r.Pattern)
		}
		if !isHealthCheck(r) {
			slog.InfoContext(r.Context(), "request", "method", r.Method, "path", r.URL.Path,
				"status", rec.status, "duration_ms", time.Since(start).Milliseconds())
		}
	})
	return otelhttp.NewHandler(logged, "http", otelhttp.WithFilter(func(r *http.Request) bool {
		return !isHealthCheck(r)
	}))
}

func isHealthCheck(r *http.Request) bool {
	return strings.HasPrefix(r.UserAgent(), "kube-probe/")
}

type statusRecorder struct {
	http.ResponseWriter
	status int
}

func (s *statusRecorder) WriteHeader(code int) {
	s.status = code
	s.ResponseWriter.WriteHeader(code)
}

// traceHandler adds the current trace and span IDs to every log record, so a line in Loki leads
// to its trace in Tempo.
type traceHandler struct{ slog.Handler }

func (h traceHandler) Handle(ctx context.Context, r slog.Record) error {
	if sc := trace.SpanContextFromContext(ctx); sc.IsValid() {
		r.AddAttrs(slog.String("trace_id", sc.TraceID().String()), slog.String("span_id", sc.SpanID().String()))
	}
	return h.Handler.Handle(ctx, r)
}

func (h traceHandler) WithAttrs(attrs []slog.Attr) slog.Handler {
	return traceHandler{h.Handler.WithAttrs(attrs)}
}

func (h traceHandler) WithGroup(name string) slog.Handler {
	return traceHandler{h.Handler.WithGroup(name)}
}
