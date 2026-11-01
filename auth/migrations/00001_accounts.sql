-- +goose Up
CREATE TABLE accounts (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email         text NOT NULL,
    username      text NOT NULL,
    first_name    text NOT NULL,
    last_name     text NOT NULL,
    password_hash text NOT NULL,
    verified_at   timestamptz, -- null until the email link is opened
    created_at    timestamptz NOT NULL DEFAULT now()
);

-- Unique ignoring case: Jibus22 and jibus22 are the same account.
CREATE UNIQUE INDEX accounts_email_unique ON accounts (lower(email));
CREATE UNIQUE INDEX accounts_username_unique ON accounts (lower(username));

-- +goose Down
DROP TABLE accounts;
