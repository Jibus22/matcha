package main

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

// call sends one request through the full stack the service runs: validation, handlers, errors.
func call(t *testing.T, s *server, method, path, body string, cookies ...*http.Cookie) *httptest.ResponseRecorder {
	t.Helper()
	handler, err := s.routes()
	if err != nil {
		t.Fatal(err)
	}
	req := httptest.NewRequest(method, path, strings.NewReader(body))
	if body != "" {
		req.Header.Set("Content-Type", "application/json")
	}
	for _, c := range cookies {
		req.AddCookie(c)
	}
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)
	return rec
}

// problemFields decodes a problem's field errors as field → message.
func problemFields(t *testing.T, rec *httptest.ResponseRecorder) map[string]string {
	t.Helper()
	var p struct {
		Errors []struct{ Field, Message string }
	}
	if err := json.Unmarshal(rec.Body.Bytes(), &p); err != nil {
		t.Fatalf("not a problem: %q", rec.Body.String())
	}
	fields := map[string]string{}
	for _, e := range p.Errors {
		fields[e.Field] = e.Message
	}
	return fields
}

func TestHealth(t *testing.T) {
	rec := call(t, &server{}, http.MethodGet, "/api/auth/health", "")
	if rec.Code != http.StatusOK || rec.Body.String() != "{\"status\":\"ok\"}\n" {
		t.Fatalf("GET /api/auth/health = %d %q", rec.Code, rec.Body.String())
	}
}

func TestErrorsAreProblems(t *testing.T) {
	for _, tc := range []struct {
		method, path string
		status       int
	}{
		{http.MethodPost, "/api/auth/health", http.StatusMethodNotAllowed},
		{http.MethodGet, "/api/auth/nowhere", http.StatusNotFound},
	} {
		rec := call(t, &server{}, tc.method, tc.path, "")
		if rec.Code != tc.status || rec.Header().Get("Content-Type") != "application/problem+json" {
			t.Errorf("%s %s = %d %s, want %d problem", tc.method, tc.path, rec.Code, rec.Header().Get("Content-Type"), tc.status)
		}
	}
}

func TestInvalidFieldsAreListed(t *testing.T) {
	body := `{"email":"not-an-email","username":"x!","firstName":"","lastName":"Dupont","password":"short","age":3}`
	rec := call(t, &server{}, http.MethodPost, "/api/auth/signup", body)
	if rec.Code != http.StatusBadRequest {
		t.Fatalf("status = %d, want 400: %s", rec.Code, rec.Body.String())
	}
	fields := problemFields(t, rec)
	for _, f := range []string{"email", "username", "firstName", "password"} {
		if fields[f] == "" {
			t.Errorf("no error for %s in %v", f, fields)
		}
	}
	if fields["password"] != "Use at least 12 characters." {
		t.Errorf("password message = %q", fields["password"])
	}
	if fields["firstName"] != "Required." {
		t.Errorf("an empty required field: %v", fields)
	}
	if fields["age"] != "Unknown field." {
		t.Errorf("a field the contract doesn't define: %v", fields)
	}
}
