package main

import (
	"crypto/rsa"
	"encoding/base64"
	"encoding/json"
	"math/big"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/golang-jwt/jwt/v5"
)

// verifiedJean signs jean up and verifies the account.
func verifiedJean(t *testing.T, s *server, mail fakeMailer) {
	t.Helper()
	call(t, s, http.MethodPost, "/api/auth/signup", jean)
	token := nextLink(t, mail, "jean@example.com")
	if code := call(t, s, http.MethodPost, "/api/auth/verification", `{"token":"`+token+`"}`).Code; code != http.StatusNoContent {
		t.Fatalf("verification = %d", code)
	}
}

// refreshCookieOf returns the refresh cookie a response sets.
func refreshCookieOf(t *testing.T, rec *httptest.ResponseRecorder) *http.Cookie {
	t.Helper()
	c, err := http.ParseSetCookie(rec.Header().Get("Set-Cookie"))
	if err != nil || c.Name != "refresh_token" {
		t.Fatalf("no refresh cookie in %q", rec.Header().Get("Set-Cookie"))
	}
	return c
}

// claimsOf checks the access token against the published JWKS and returns its claims.
func claimsOf(t *testing.T, s *server, rec *httptest.ResponseRecorder) jwt.MapClaims {
	t.Helper()
	var tokens struct{ AccessToken string }
	if err := json.Unmarshal(rec.Body.Bytes(), &tokens); err != nil {
		t.Fatal(err)
	}
	var set struct{ Keys []struct{ Kid, N, E string } }
	if err := json.Unmarshal(call(t, s, http.MethodGet, "/api/auth/.well-known/jwks.json", "").Body.Bytes(), &set); err != nil {
		t.Fatal(err)
	}
	claims := jwt.MapClaims{}
	_, err := jwt.ParseWithClaims(tokens.AccessToken, claims, func(tok *jwt.Token) (any, error) {
		for _, k := range set.Keys {
			if k.Kid == tok.Header["kid"] {
				n, _ := base64.RawURLEncoding.DecodeString(k.N)
				e, _ := base64.RawURLEncoding.DecodeString(k.E)
				return &rsa.PublicKey{N: new(big.Int).SetBytes(n), E: int(new(big.Int).SetBytes(e).Int64())}, nil
			}
		}
		return nil, jwt.ErrTokenUnverifiable
	}, jwt.WithValidMethods([]string{"RS256"}), jwt.WithIssuer(issuer), jwt.WithAudience(audience))
	if err != nil {
		t.Fatalf("access token doesn't verify with the JWKS: %v", err)
	}
	return claims
}

func TestLoginRefreshLogout(t *testing.T) {
	s, mail := newTestServer(t)
	verifiedJean(t, s, mail)

	// The username's case doesn't matter; the token carries it as registered.
	rec := call(t, s, http.MethodPost, "/api/auth/login", `{"username":"JIBUS22","password":"correct-horse-battery-staple"}`)
	if rec.Code != http.StatusOK {
		t.Fatalf("login = %d %s", rec.Code, rec.Body.String())
	}
	if claims := claimsOf(t, s, rec); claims["username"] != "Jibus22" || claims["sub"] == "" {
		t.Errorf("claims = %v", claims)
	}
	first := refreshCookieOf(t, rec)
	if !first.HttpOnly || first.SameSite != http.SameSiteStrictMode || first.Path != "/api/auth" || first.MaxAge <= 0 {
		t.Errorf("refresh cookie = %q", first.Raw)
	}

	rec = call(t, s, http.MethodPost, "/api/auth/refresh", "", first)
	if rec.Code != http.StatusOK {
		t.Fatalf("refresh = %d %s", rec.Code, rec.Body.String())
	}
	claimsOf(t, s, rec)
	second := refreshCookieOf(t, rec)
	if second.Value == first.Value {
		t.Error("refresh kept the same refresh token")
	}

	rec = call(t, s, http.MethodPost, "/api/auth/logout", "", second)
	if rec.Code != http.StatusNoContent || refreshCookieOf(t, rec).MaxAge >= 0 {
		t.Errorf("logout = %d, cookie %q, want 204 and the cookie deleted", rec.Code, rec.Header().Get("Set-Cookie"))
	}
	if code := call(t, s, http.MethodPost, "/api/auth/refresh", "", second).Code; code != http.StatusUnauthorized {
		t.Errorf("refresh after logout = %d, want 401", code)
	}
}

func TestLoginRefusals(t *testing.T) {
	s, mail := newTestServer(t)
	call(t, s, http.MethodPost, "/api/auth/signup", jean)
	<-mail

	if code := call(t, s, http.MethodPost, "/api/auth/login", `{"username":"Jibus22","password":"correct-horse-battery-staple"}`).Code; code != http.StatusForbidden {
		t.Errorf("unverified login = %d, want 403", code)
	}
	wrong := call(t, s, http.MethodPost, "/api/auth/login", `{"username":"Jibus22","password":"not-the-right-one"}`)
	unknown := call(t, s, http.MethodPost, "/api/auth/login", `{"username":"nobody","password":"not-the-right-one"}`)
	if wrong.Code != http.StatusUnauthorized || wrong.Body.String() != unknown.Body.String() {
		t.Errorf("wrong password = %d %q, unknown user = %d %q: want the same 401", wrong.Code, wrong.Body, unknown.Code, unknown.Body)
	}
	if code := call(t, s, http.MethodPost, "/api/auth/refresh", "").Code; code != http.StatusUnauthorized {
		t.Errorf("refresh without a cookie = %d, want 401", code)
	}
}

func TestReusedRefreshTokenEndsTheSession(t *testing.T) {
	s, mail := newTestServer(t)
	verifiedJean(t, s, mail)
	first := refreshCookieOf(t, call(t, s, http.MethodPost, "/api/auth/login", `{"username":"Jibus22","password":"correct-horse-battery-staple"}`))
	second := refreshCookieOf(t, call(t, s, http.MethodPost, "/api/auth/refresh", "", first))

	if code := call(t, s, http.MethodPost, "/api/auth/refresh", "", first).Code; code != http.StatusUnauthorized {
		t.Errorf("reused refresh token = %d, want 401", code)
	}
	if code := call(t, s, http.MethodPost, "/api/auth/refresh", "", second).Code; code != http.StatusUnauthorized {
		t.Errorf("the session's latest token after a reuse = %d, want 401", code)
	}
}
