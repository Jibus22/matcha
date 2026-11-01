package main

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"errors"
	"time"

	"github.com/jackc/pgx/v5"
)

// Token purposes, as stored in account_tokens.purpose.
const (
	purposeVerify = "verify"
	purposeReset  = "reset"
)

// errBadToken: the token is unknown, expired or already used. The caller can't tell which.
var errBadToken = errors.New("invalid, expired or used token")

func hashToken(token string) []byte {
	sum := sha256.Sum256([]byte(token))
	return sum[:]
}

// issueToken creates a token for an email link and stores its hash. The account's unused tokens
// for the same purpose are deleted: an older link stops working.
func issueToken(ctx context.Context, tx pgx.Tx, accountID, purpose string, ttl time.Duration) (string, error) {
	raw := make([]byte, 32)
	if _, err := rand.Read(raw); err != nil {
		return "", err
	}
	token := base64.RawURLEncoding.EncodeToString(raw)

	if _, err := tx.Exec(ctx, `DELETE FROM account_tokens WHERE account_id = $1 AND purpose = $2 AND used_at IS NULL`,
		accountID, purpose); err != nil {
		return "", err
	}
	_, err := tx.Exec(ctx, `INSERT INTO account_tokens (token_hash, account_id, purpose, expires_at) VALUES ($1, $2, $3, $4)`,
		hashToken(token), accountID, purpose, time.Now().Add(ttl))
	return token, err
}

// consumeToken marks a valid token as used and returns its account, or errBadToken.
func consumeToken(ctx context.Context, tx pgx.Tx, token, purpose string) (accountID string, err error) {
	err = tx.QueryRow(ctx, `
		UPDATE account_tokens SET used_at = now()
		WHERE token_hash = $1 AND purpose = $2 AND used_at IS NULL AND expires_at > now()
		RETURNING account_id`, hashToken(token), purpose).Scan(&accountID)
	if errors.Is(err, pgx.ErrNoRows) {
		return "", errBadToken
	}
	return accountID, err
}
