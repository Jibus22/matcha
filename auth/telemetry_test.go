package main

import (
	"bytes"
	"context"
	"encoding/json"
	"log/slog"
	"testing"

	sdktrace "go.opentelemetry.io/otel/sdk/trace"
)

func TestLogsCarryTheTraceID(t *testing.T) {
	var out bytes.Buffer
	logger := slog.New(traceHandler{slog.NewJSONHandler(&out, nil)})
	ctx, span := sdktrace.NewTracerProvider().Tracer("test").Start(context.Background(), "op")
	defer span.End()

	logger.InfoContext(ctx, "inside a span")
	logger.Info("outside a span")

	lines := bytes.Split(bytes.TrimSpace(out.Bytes()), []byte("\n"))
	var inside, outside map[string]any
	_ = json.Unmarshal(lines[0], &inside)
	_ = json.Unmarshal(lines[1], &outside)
	if inside["trace_id"] != span.SpanContext().TraceID().String() {
		t.Errorf("trace_id = %v, want the span's", inside["trace_id"])
	}
	if _, ok := outside["trace_id"]; ok {
		t.Errorf("a log outside any span got a trace_id: %s", lines[1])
	}
}
