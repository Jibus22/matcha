package main

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestHealth(t *testing.T) {
	rec := httptest.NewRecorder()
	routes().ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/api/auth/health", nil))

	if rec.Code != http.StatusOK || rec.Body.String() != "{\"status\":\"ok\"}\n" {
		t.Fatalf("GET /api/auth/health = %d %q", rec.Code, rec.Body.String())
	}
}

func TestHealthRefusesOtherMethods(t *testing.T) {
	rec := httptest.NewRecorder()
	routes().ServeHTTP(rec, httptest.NewRequest(http.MethodPost, "/api/auth/health", nil))

	if rec.Code != http.StatusMethodNotAllowed {
		t.Fatalf("POST /api/auth/health = %d, want 405", rec.Code)
	}
}
