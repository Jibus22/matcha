package main

import (
	"context"
	"net/http"
	"regexp"
	"testing"
	"time"
)

type sentMail struct {
	to string
	message
}

// fakeMailer hands sent emails to the test instead of an SMTP server.
type fakeMailer chan sentMail

func (f fakeMailer) Send(_ context.Context, to string, m message) error {
	f <- sentMail{to, m}
	return nil
}

// newTestServer returns a server on the throwaway database, emptied, with a fake mailer.
func newTestServer(t *testing.T) (*server, fakeMailer) {
	t.Helper()
	db, err := openDB(context.Background())
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(db.Close)
	if _, err := db.Exec(context.Background(), `TRUNCATE accounts CASCADE`); err != nil {
		t.Fatal(err)
	}
	key, err := loadSigningKey(context.Background(), db)
	if err != nil {
		t.Fatal(err)
	}
	mail := make(fakeMailer, 10)
	return &server{db: db, mail: mail, publicURL: "http://matcha.test", key: key}, mail
}

var linkToken = regexp.MustCompile(`/verify\?token=([A-Za-z0-9_-]+)`)

// nextLink waits for the next email and returns the token in its link.
func nextLink(t *testing.T, mail fakeMailer, to string) string {
	t.Helper()
	select {
	case m := <-mail:
		if m.to != to {
			t.Fatalf("email sent to %q, want %q", m.to, to)
		}
		match := linkToken.FindStringSubmatch(m.Body)
		if match == nil {
			t.Fatalf("no link in %q", m.Body)
		}
		return match[1]
	case <-time.After(2 * time.Second):
		t.Fatal("no email sent")
		return ""
	}
}

const jean = `{"email":"jean@example.com","username":"Jibus22","firstName":"Jean","lastName":"Dupont","password":"correct-horse-battery-staple"}`

func TestSignupThenVerifyOnce(t *testing.T) {
	s, mail := newTestServer(t)

	if rec := call(t, s, http.MethodPost, "/api/auth/signup", jean); rec.Code != http.StatusCreated {
		t.Fatalf("signup = %d %s", rec.Code, rec.Body.String())
	}
	token := nextLink(t, mail, "jean@example.com")

	var verified bool
	verify := func() int {
		return call(t, s, http.MethodPost, "/api/auth/verification", `{"token":"`+token+`"}`).Code
	}
	if code := verify(); code != http.StatusNoContent {
		t.Fatalf("first verification = %d", code)
	}
	_ = s.db.QueryRow(context.Background(), `SELECT verified_at IS NOT NULL FROM accounts`).Scan(&verified)
	if !verified {
		t.Error("the account isn't verified")
	}
	if code := verify(); code != http.StatusBadRequest {
		t.Errorf("second use of the link = %d, want 400", code)
	}
}

func TestSignupRefusesTakenEmailAndUsername(t *testing.T) {
	s, _ := newTestServer(t)
	call(t, s, http.MethodPost, "/api/auth/signup", jean)

	for field, body := range map[string]string{
		"email":    `{"email":"JEAN@example.com","username":"someone","firstName":"J","lastName":"D","password":"correct-horse-battery-staple"}`,
		"username": `{"email":"other@example.com","username":"jibus22","firstName":"J","lastName":"D","password":"correct-horse-battery-staple"}`,
	} {
		rec := call(t, s, http.MethodPost, "/api/auth/signup", body)
		if rec.Code != http.StatusConflict || problemFields(t, rec)[field] == "" {
			t.Errorf("taken %s = %d %s, want 409 on %s", field, rec.Code, rec.Body.String(), field)
		}
	}
}

func TestSignupRefusesDictionaryPasswords(t *testing.T) {
	s, mail := newTestServer(t)
	rec := call(t, s, http.MethodPost, "/api/auth/signup",
		`{"email":"jean@example.com","username":"Jibus22","firstName":"Jean","lastName":"Dupont","password":"Bonjour2024!"}`)
	if rec.Code != http.StatusBadRequest || problemFields(t, rec)["password"] == "" {
		t.Fatalf("dictionary password = %d %s, want 400 on password", rec.Code, rec.Body.String())
	}
	if len(mail) != 0 {
		t.Error("an email was sent for a refused signup")
	}
}

func TestResendReplacesTheLinkAndRevealsNothing(t *testing.T) {
	s, mail := newTestServer(t)
	call(t, s, http.MethodPost, "/api/auth/signup", jean)
	first := nextLink(t, mail, "jean@example.com")

	for _, email := range []string{"Jean@Example.com", "nobody@example.com"} {
		if code := call(t, s, http.MethodPost, "/api/auth/verification/resend", `{"email":"`+email+`"}`).Code; code != http.StatusAccepted {
			t.Errorf("resend for %s = %d, want 202 either way", email, code)
		}
	}
	second := nextLink(t, mail, "Jean@Example.com")
	select {
	case m := <-mail:
		t.Errorf("an email went to %s, an address with no account", m.to)
	case <-time.After(200 * time.Millisecond):
	}

	if code := call(t, s, http.MethodPost, "/api/auth/verification", `{"token":"`+first+`"}`).Code; code != http.StatusBadRequest {
		t.Errorf("the replaced link = %d, want 400", code)
	}
	if code := call(t, s, http.MethodPost, "/api/auth/verification", `{"token":"`+second+`"}`).Code; code != http.StatusNoContent {
		t.Errorf("the new link = %d, want 204", code)
	}
}

func TestExpiredLinkIsRefused(t *testing.T) {
	s, mail := newTestServer(t)
	call(t, s, http.MethodPost, "/api/auth/signup", jean)
	token := nextLink(t, mail, "jean@example.com")
	if _, err := s.db.Exec(context.Background(), `UPDATE account_tokens SET expires_at = now() - interval '1 second'`); err != nil {
		t.Fatal(err)
	}
	if code := call(t, s, http.MethodPost, "/api/auth/verification", `{"token":"`+token+`"}`).Code; code != http.StatusBadRequest {
		t.Errorf("expired link = %d, want 400", code)
	}
}
