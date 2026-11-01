-- +goose Up
-- Single-use tokens sent in email links: account verification, and password reset later. Only
-- their SHA-256 is stored, so a leaked database gives no usable link.
CREATE TABLE account_tokens (
    token_hash bytea PRIMARY KEY,
    account_id uuid NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
    purpose    text NOT NULL CHECK (purpose IN ('verify', 'reset')),
    expires_at timestamptz NOT NULL,
    used_at    timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX account_tokens_account ON account_tokens (account_id, purpose);

-- +goose Down
DROP TABLE account_tokens;
