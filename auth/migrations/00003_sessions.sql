-- +goose Up
-- The keys that sign access tokens. auth creates one on first start and keeps it here, so every
-- replica and every restart signs with the same key; /.well-known/jwks.json publishes them all.
CREATE TABLE signing_keys (
    kid             text PRIMARY KEY,
    private_key_pem text NOT NULL,
    created_at      timestamptz NOT NULL DEFAULT now()
);

-- One session per sign-in. Its refresh token changes on every use; presenting a used one means
-- it was stolen or replayed, and ends the session.
CREATE TABLE sessions (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id uuid NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
    expires_at timestamptz NOT NULL,
    revoked_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX sessions_account ON sessions (account_id);

-- Only the SHA-256 of each refresh token is stored.
CREATE TABLE refresh_tokens (
    token_hash bytea PRIMARY KEY,
    session_id uuid NOT NULL REFERENCES sessions (id) ON DELETE CASCADE,
    used_at    timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- +goose Down
DROP TABLE refresh_tokens;
DROP TABLE sessions;
DROP TABLE signing_keys;
