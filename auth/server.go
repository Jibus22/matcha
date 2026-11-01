package main

import (
	"context"
	"net/http"

	"github.com/getkin/kin-openapi/openapi3"
	"github.com/getkin/kin-openapi/openapi3filter"
	"github.com/jackc/pgx/v5/pgxpool"
	nethttpmiddleware "github.com/oapi-codegen/nethttp-middleware"
	"go.opentelemetry.io/otel/trace"

	"github.com/Jibus22/matcha/auth/api"
)

// server implements the API described in contracts/openapi/auth.yaml (api.StrictServerInterface).
type server struct {
	db *pgxpool.Pool
}

var _ api.StrictServerInterface = (*server)(nil)

func init() {
	// kin-openapi only checks the formats it's told about.
	openapi3.DefineStringFormatValidator("email", openapi3.NewRegexpFormatValidator(openapi3.FormatOfStringForEmail))
}

// routes serves the contract. Requests are validated against it before reaching a handler, and
// every error, the validator's or a handler's, is an RFC 9457 problem.
func (s *server) routes() (http.Handler, error) {
	spec, err := api.GetSwagger()
	if err != nil {
		return nil, err
	}
	spec.Servers = nil // match on paths alone, whatever host the request came through

	mux := http.NewServeMux()
	handlers := api.NewStrictHandlerWithOptions(s, nil, api.StrictHTTPServerOptions{
		RequestErrorHandlerFunc: func(w http.ResponseWriter, _ *http.Request, _ error) {
			writeProblem(w, problem(http.StatusBadRequest, "The request body isn't valid JSON for this endpoint"))
		},
		ResponseErrorHandlerFunc: handlerError,
	})
	api.HandlerWithOptions(handlers, api.StdHTTPServerOptions{
		BaseRouter:  mux,
		Middlewares: []api.MiddlewareFunc{nameSpanAfterRoute},
	})
	validate := nethttpmiddleware.OapiRequestValidatorWithOptions(spec, &nethttpmiddleware.Options{
		Options:               openapi3filter.Options{MultiError: true},
		ErrorHandlerWithOpts:  validationProblem,
		SilenceServersWarning: true,
	})
	return limitBody(validate(mux)), nil
}

// nameSpanAfterRoute names the request's span after the matched route ("POST /api/auth/signup"),
// not the raw URL.
func nameSpanAfterRoute(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		trace.SpanFromContext(r.Context()).SetName(r.Pattern)
		next.ServeHTTP(w, r)
	})
}

// limitBody refuses bodies over 64 KiB: no endpoint needs more.
func limitBody(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		r.Body = http.MaxBytesReader(w, r.Body, 64<<10)
		next.ServeHTTP(w, r)
	})
}

func (s *server) GetHealth(context.Context, api.GetHealthRequestObject) (api.GetHealthResponseObject, error) {
	return api.GetHealth200JSONResponse{Status: "ok"}, nil
}

// Not served yet: signup and verification (#11), sessions and keys (#12), password reset (#13).

func (s *server) Signup(context.Context, api.SignupRequestObject) (api.SignupResponseObject, error) {
	return nil, errNotImplemented
}

func (s *server) VerifyEmail(context.Context, api.VerifyEmailRequestObject) (api.VerifyEmailResponseObject, error) {
	return nil, errNotImplemented
}

func (s *server) ResendVerification(context.Context, api.ResendVerificationRequestObject) (api.ResendVerificationResponseObject, error) {
	return nil, errNotImplemented
}

func (s *server) Login(context.Context, api.LoginRequestObject) (api.LoginResponseObject, error) {
	return nil, errNotImplemented
}

func (s *server) Refresh(context.Context, api.RefreshRequestObject) (api.RefreshResponseObject, error) {
	return nil, errNotImplemented
}

func (s *server) Logout(context.Context, api.LogoutRequestObject) (api.LogoutResponseObject, error) {
	return nil, errNotImplemented
}

func (s *server) GetJWKS(context.Context, api.GetJWKSRequestObject) (api.GetJWKSResponseObject, error) {
	return nil, errNotImplemented
}

func (s *server) RequestPasswordReset(context.Context, api.RequestPasswordResetRequestObject) (api.RequestPasswordResetResponseObject, error) {
	return nil, errNotImplemented
}

func (s *server) ConfirmPasswordReset(context.Context, api.ConfirmPasswordResetRequestObject) (api.ConfirmPasswordResetResponseObject, error) {
	return nil, errNotImplemented
}
