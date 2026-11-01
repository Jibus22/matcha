package main

import (
	"context"
	"errors"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"

	"github.com/Jibus22/matcha/auth/api"
	"github.com/Jibus22/matcha/auth/passhash"
	"github.com/Jibus22/matcha/auth/password"
)

const verifyTTL = 24 * time.Hour

// Signup creates an unverified account and emails it a verification link.
func (s *server) Signup(ctx context.Context, req api.SignupRequestObject) (api.SignupResponseObject, error) {
	b := req.Body
	var rejected *password.Rejection
	if err := password.Check(b.Password); errors.As(err, &rejected) {
		return api.Signup400ApplicationProblemPlusJSONResponse{InvalidApplicationProblemPlusJSONResponse: api.InvalidApplicationProblemPlusJSONResponse(
			problem(http.StatusBadRequest, "Some fields are invalid", api.FieldError{Field: "password", Message: rejected.Reason}))}, nil
	}
	hash, err := passhash.Hash(b.Password)
	if err != nil {
		return nil, err
	}

	var id, token string
	err = pgx.BeginFunc(ctx, s.db, func(tx pgx.Tx) error {
		if err := tx.QueryRow(ctx, `
			INSERT INTO accounts (email, username, first_name, last_name, password_hash)
			VALUES ($1, $2, $3, $4, $5) RETURNING id`,
			string(b.Email), b.Username, b.FirstName, b.LastName, hash).Scan(&id); err != nil {
			return err
		}
		token, err = issueToken(ctx, tx, id, purposeVerify, verifyTTL)
		return err
	})
	if field := takenField(err); field != "" {
		return api.Signup409ApplicationProblemPlusJSONResponse(
			problem(http.StatusConflict, "Already taken", api.FieldError{Field: field, Message: "Already taken."})), nil
	}
	if err != nil {
		return nil, err
	}

	s.sendLater(ctx, string(b.Email), verificationEmail(b.FirstName, s.publicURL+"/verify?token="+token))
	return api.Signup201JSONResponse{
		Id: uuid.MustParse(id), Email: b.Email, Username: b.Username, FirstName: b.FirstName, LastName: b.LastName,
	}, nil
}

// takenField names the field whose uniqueness the error breaks, or returns "".
func takenField(err error) string {
	var pgErr *pgconn.PgError
	if !errors.As(err, &pgErr) || pgErr.Code != "23505" {
		return ""
	}
	switch pgErr.ConstraintName {
	case "accounts_email_unique":
		return "email"
	case "accounts_username_unique":
		return "username"
	}
	return ""
}

// VerifyEmail verifies the account a link's token belongs to. The token works once.
func (s *server) VerifyEmail(ctx context.Context, req api.VerifyEmailRequestObject) (api.VerifyEmailResponseObject, error) {
	err := pgx.BeginFunc(ctx, s.db, func(tx pgx.Tx) error {
		id, err := consumeToken(ctx, tx, req.Body.Token, purposeVerify)
		if err != nil {
			return err
		}
		_, err = tx.Exec(ctx, `UPDATE accounts SET verified_at = now() WHERE id = $1 AND verified_at IS NULL`, id)
		return err
	})
	if errors.Is(err, errBadToken) {
		return api.VerifyEmail400ApplicationProblemPlusJSONResponse(
			problem(http.StatusBadRequest, "This link is invalid, has expired or was already used")), nil
	}
	if err != nil {
		return nil, err
	}
	return api.VerifyEmail204Response{}, nil
}

// ResendVerification emails a new link to an unverified account; the previous link stops
// working. The answer is the same whether or not such an account exists.
func (s *server) ResendVerification(ctx context.Context, req api.ResendVerificationRequestObject) (api.ResendVerificationResponseObject, error) {
	email := string(req.Body.Email)
	var firstName, token string
	err := pgx.BeginFunc(ctx, s.db, func(tx pgx.Tx) error {
		var id string
		err := tx.QueryRow(ctx, `SELECT id, first_name FROM accounts WHERE lower(email) = lower($1) AND verified_at IS NULL`,
			email).Scan(&id, &firstName)
		if errors.Is(err, pgx.ErrNoRows) {
			return nil
		}
		if err != nil {
			return err
		}
		token, err = issueToken(ctx, tx, id, purposeVerify, verifyTTL)
		return err
	})
	if err != nil {
		return nil, err
	}
	if token != "" {
		s.sendLater(ctx, email, verificationEmail(firstName, s.publicURL+"/verify?token="+token))
	}
	return api.ResendVerification202Response{}, nil
}

const resetTTL = 30 * time.Minute

// RequestPasswordReset emails a reset link; the previous one stops working. The answer is the same
// whether or not the account exists.
func (s *server) RequestPasswordReset(ctx context.Context, req api.RequestPasswordResetRequestObject) (api.RequestPasswordResetResponseObject, error) {
	var email, firstName, token string
	err := pgx.BeginFunc(ctx, s.db, func(tx pgx.Tx) error {
		var id string
		err := tx.QueryRow(ctx, `SELECT id, email, first_name FROM accounts WHERE lower(email) = lower($1)`,
			string(req.Body.Email)).Scan(&id, &email, &firstName)
		if errors.Is(err, pgx.ErrNoRows) {
			return nil
		}
		if err != nil {
			return err
		}
		token, err = issueToken(ctx, tx, id, purposeReset, resetTTL)
		return err
	})
	if err != nil {
		return nil, err
	}
	if token != "" {
		s.sendLater(ctx, email, resetEmail(firstName, s.publicURL+"/reset-password?token="+token))
	}
	return api.RequestPasswordReset202Response{}, nil
}

// ConfirmPasswordReset sets the new password and ends every session of the account. The link
// proves the email address too, so an unverified account becomes verified.
func (s *server) ConfirmPasswordReset(ctx context.Context, req api.ConfirmPasswordResetRequestObject) (api.ConfirmPasswordResetResponseObject, error) {
	// Checked before the token is spent: a refused password leaves the link usable.
	var rejected *password.Rejection
	if err := password.Check(req.Body.Password); errors.As(err, &rejected) {
		return api.ConfirmPasswordReset400ApplicationProblemPlusJSONResponse(
			problem(http.StatusBadRequest, "Some fields are invalid", api.FieldError{Field: "password", Message: rejected.Reason})), nil
	}
	hash, err := passhash.Hash(req.Body.Password)
	if err != nil {
		return nil, err
	}
	err = pgx.BeginFunc(ctx, s.db, func(tx pgx.Tx) error {
		id, err := consumeToken(ctx, tx, req.Body.Token, purposeReset)
		if err != nil {
			return err
		}
		if _, err := tx.Exec(ctx, `UPDATE accounts SET password_hash = $2, verified_at = coalesce(verified_at, now()) WHERE id = $1`,
			id, hash); err != nil {
			return err
		}
		_, err = tx.Exec(ctx, `UPDATE sessions SET revoked_at = now() WHERE account_id = $1 AND revoked_at IS NULL`, id)
		return err
	})
	if errors.Is(err, errBadToken) {
		return api.ConfirmPasswordReset400ApplicationProblemPlusJSONResponse(
			problem(http.StatusBadRequest, "This link is invalid, has expired or was already used")), nil
	}
	if err != nil {
		return nil, err
	}
	return api.ConfirmPasswordReset204Response{}, nil
}
