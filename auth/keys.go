package main

import (
	"context"
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha256"
	"crypto/x509"
	"encoding/base64"
	"encoding/pem"
	"errors"
	"math/big"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/Jibus22/matcha/auth/api"
)

// signingKey signs access tokens; kid names it in each token's header and in the JWKS.
type signingKey struct {
	kid string
	key *rsa.PrivateKey
}

// loadSigningKey returns the newest key, creating one on first start. Two replicas starting at
// once may both create one: harmless, since the JWKS publishes every key.
func loadSigningKey(ctx context.Context, db *pgxpool.Pool) (signingKey, error) {
	var pemText string
	err := db.QueryRow(ctx, `SELECT private_key_pem FROM signing_keys ORDER BY created_at DESC LIMIT 1`).Scan(&pemText)
	if errors.Is(err, pgx.ErrNoRows) {
		key, err := rsa.GenerateKey(rand.Reader, 2048)
		if err != nil {
			return signingKey{}, err
		}
		der := x509.MarshalPKCS1PrivateKey(key)
		pemText = string(pem.EncodeToMemory(&pem.Block{Type: "RSA PRIVATE KEY", Bytes: der}))
		if _, err := db.Exec(ctx, `INSERT INTO signing_keys (kid, private_key_pem) VALUES ($1, $2)`,
			keyID(&key.PublicKey), pemText); err != nil {
			return signingKey{}, err
		}
	} else if err != nil {
		return signingKey{}, err
	}
	return parseSigningKey(pemText)
}

func parseSigningKey(pemText string) (signingKey, error) {
	block, _ := pem.Decode([]byte(pemText))
	if block == nil {
		return signingKey{}, errors.New("signing key: not PEM")
	}
	key, err := x509.ParsePKCS1PrivateKey(block.Bytes)
	if err != nil {
		return signingKey{}, err
	}
	return signingKey{kid: keyID(&key.PublicKey), key: key}, nil
}

// keyID is derived from the public key, so it never needs storing separately.
func keyID(pub *rsa.PublicKey) string {
	sum := sha256.Sum256(x509.MarshalPKCS1PublicKey(pub))
	return base64.RawURLEncoding.EncodeToString(sum[:12])
}

// GetJWKS publishes every public key, so tokens signed by an older key still verify.
func (s *server) GetJWKS(ctx context.Context, _ api.GetJWKSRequestObject) (api.GetJWKSResponseObject, error) {
	rows, err := s.db.Query(ctx, `SELECT private_key_pem FROM signing_keys ORDER BY created_at`)
	if err != nil {
		return nil, err
	}
	pems, err := pgx.CollectRows(rows, pgx.RowTo[string])
	if err != nil {
		return nil, err
	}
	set := api.GetJWKS200JSONResponse{Keys: []api.JWK{}}
	for _, p := range pems {
		k, err := parseSigningKey(p)
		if err != nil {
			return nil, err
		}
		set.Keys = append(set.Keys, api.JWK{
			Kty: api.RSA, Kid: k.kid, Use: api.Sig, Alg: api.RS256,
			N: base64.RawURLEncoding.EncodeToString(k.key.N.Bytes()),
			E: base64.RawURLEncoding.EncodeToString(big.NewInt(int64(k.key.E)).Bytes()),
		})
	}
	return set, nil
}
