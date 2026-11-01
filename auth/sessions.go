package main

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/jackc/pgx/v5"

	"github.com/Jibus22/matcha/auth/api"
	"github.com/Jibus22/matcha/auth/passhash"
)

const (
	accessTTL  = 10 * time.Minute
	sessionTTL = 30 * 24 * time.Hour
	issuer     = "matcha-auth"
	audience   = "matcha"
)

// A hash of a password nobody has: login compares against it when the username doesn't exist, so
// both cases take as long and the answer time doesn't reveal which usernames exist.
var unknownUserHash, _ = passhash.Hash("no account has this password")

var errBadRefresh = errors.New("missing, expired, revoked or reused refresh token")

// Login signs in with username (case ignored) and password. A wrong username and a wrong password
// get the same answer.
func (s *server) Login(ctx context.Context, req api.LoginRequestObject) (api.LoginResponseObject, error) {
	var id, username, hash string
	var verified bool
	err := s.db.QueryRow(ctx, `SELECT id, username, password_hash, verified_at IS NOT NULL FROM accounts WHERE lower(username) = lower($1)`,
		req.Body.Username).Scan(&id, &username, &hash, &verified)
	if errors.Is(err, pgx.ErrNoRows) {
		hash = unknownUserHash
	} else if err != nil {
		return nil, err
	}
	ok, err := passhash.Verify(req.Body.Password, hash)
	if err != nil {
		return nil, err
	}
	if !ok || id == "" {
		return api.Login401ApplicationProblemPlusJSONResponse(problem(http.StatusUnauthorized, "Wrong username or password")), nil
	}
	if !verified {
		return api.Login403ApplicationProblemPlusJSONResponse(problem(http.StatusForbidden,
			"Verify your email first: open the link we sent, or ask for a new one")), nil
	}

	var refresh string
	err = pgx.BeginFunc(ctx, s.db, func(tx pgx.Tx) error {
		var session string
		if err := tx.QueryRow(ctx, `INSERT INTO sessions (account_id, expires_at) VALUES ($1, $2) RETURNING id`,
			id, time.Now().Add(sessionTTL)).Scan(&session); err != nil {
			return err
		}
		refresh, err = issueRefreshToken(ctx, tx, session)
		return err
	})
	if err != nil {
		return nil, err
	}
	tokens, err := s.accessToken(id, username)
	if err != nil {
		return nil, err
	}
	return api.Login200JSONResponse{Body: tokens, Headers: api.Login200ResponseHeaders{SetCookie: s.refreshCookie(refresh, sessionTTL)}}, nil
}

// Refresh trades a refresh token for new tokens. Each refresh token works once: a used one means
// it was copied, so the whole session ends.
func (s *server) Refresh(ctx context.Context, req api.RefreshRequestObject) (api.RefreshResponseObject, error) {
	var id, username, refresh string
	err := pgx.BeginFunc(ctx, s.db, func(tx pgx.Tx) error {
		if req.Params.RefreshToken == nil {
			return errBadRefresh
		}
		var session string
		var used, valid bool
		err := tx.QueryRow(ctx, `
			SELECT s.id, a.id, a.username, r.used_at IS NOT NULL, s.revoked_at IS NULL AND s.expires_at > now()
			FROM refresh_tokens r JOIN sessions s ON s.id = r.session_id JOIN accounts a ON a.id = s.account_id
			WHERE r.token_hash = $1 FOR UPDATE OF r`, hashToken(*req.Params.RefreshToken)).
			Scan(&session, &id, &username, &used, &valid)
		if errors.Is(err, pgx.ErrNoRows) {
			return errBadRefresh
		}
		if err != nil {
			return err
		}
		if used {
			// Reuse: end the session. Returning nil commits that; refresh stays empty, so the
			// caller still refuses.
			_, err := tx.Exec(ctx, `UPDATE sessions SET revoked_at = now() WHERE id = $1 AND revoked_at IS NULL`, session)
			return err
		}
		if !valid {
			return errBadRefresh
		}
		if _, err := tx.Exec(ctx, `UPDATE refresh_tokens SET used_at = now() WHERE token_hash = $1`,
			hashToken(*req.Params.RefreshToken)); err != nil {
			return err
		}
		refresh, err = issueRefreshToken(ctx, tx, session)
		return err
	})
	if errors.Is(err, errBadRefresh) || (err == nil && refresh == "") {
		return api.Refresh401ApplicationProblemPlusJSONResponse(problem(http.StatusUnauthorized, "Sign in again")), nil
	}
	if err != nil {
		return nil, err
	}
	tokens, err := s.accessToken(id, username)
	if err != nil {
		return nil, err
	}
	return api.Refresh200JSONResponse{Body: tokens, Headers: api.Refresh200ResponseHeaders{SetCookie: s.refreshCookie(refresh, sessionTTL)}}, nil
}

// Logout ends the session the refresh cookie belongs to, and clears the cookie.
func (s *server) Logout(ctx context.Context, req api.LogoutRequestObject) (api.LogoutResponseObject, error) {
	if req.Params.RefreshToken != nil {
		if _, err := s.db.Exec(ctx, `
			UPDATE sessions SET revoked_at = now()
			WHERE revoked_at IS NULL AND id = (SELECT session_id FROM refresh_tokens WHERE token_hash = $1)`,
			hashToken(*req.Params.RefreshToken)); err != nil {
			return nil, err
		}
	}
	return api.Logout204Response{Headers: api.Logout204ResponseHeaders{SetCookie: s.refreshCookie("", 0)}}, nil
}

func issueRefreshToken(ctx context.Context, tx pgx.Tx, session string) (string, error) {
	raw := make([]byte, 32)
	if _, err := rand.Read(raw); err != nil {
		return "", err
	}
	token := base64.RawURLEncoding.EncodeToString(raw)
	_, err := tx.Exec(ctx, `INSERT INTO refresh_tokens (token_hash, session_id) VALUES ($1, $2)`, hashToken(token), session)
	return token, err
}

// refreshCookie is HttpOnly so page scripts never see it, SameSite=Strict so other sites can't
// send it, and scoped to /api/auth. An empty token with maxAge 0 deletes it.
func (s *server) refreshCookie(token string, maxAge time.Duration) *string {
	c := fmt.Sprintf("refresh_token=%s; Path=/api/auth; Max-Age=%d; HttpOnly; SameSite=Strict", token, int(maxAge.Seconds()))
	if strings.HasPrefix(s.publicURL, "https://") {
		c += "; Secure"
	}
	return &c
}

// accessToken signs a short-lived JWT that every service verifies with the JWKS.
func (s *server) accessToken(accountID, username string) (api.Tokens, error) {
	now := time.Now()
	claims := struct {
		jwt.RegisteredClaims
		Username string `json:"username"`
	}{
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer: issuer, Subject: accountID, Audience: jwt.ClaimStrings{audience},
			IssuedAt: jwt.NewNumericDate(now), ExpiresAt: jwt.NewNumericDate(now.Add(accessTTL)),
		},
		Username: username,
	}
	token := jwt.NewWithClaims(jwt.SigningMethodRS256, claims)
	token.Header["kid"] = s.key.kid
	signed, err := token.SignedString(s.key.key)
	if err != nil {
		return api.Tokens{}, err
	}
	return api.Tokens{AccessToken: signed, TokenType: api.Bearer, ExpiresIn: int(accessTTL.Seconds())}, nil
}
