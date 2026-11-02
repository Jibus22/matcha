package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"regexp"
	"strings"

	"github.com/getkin/kin-openapi/openapi3"
	"github.com/getkin/kin-openapi/routers"
	nethttpmiddleware "github.com/oapi-codegen/nethttp-middleware"

	"github.com/Jibus22/matcha/auth/api"
)

// problem builds an RFC 9457 problem; every error the service returns has this shape.
func problem(status int, title string, fields ...api.FieldError) api.Problem {
	p := api.Problem{Status: status, Title: title}
	if len(fields) > 0 {
		p.Errors = &fields
	}
	return p
}

func writeProblem(w http.ResponseWriter, p api.Problem) {
	w.Header().Set("Content-Type", "application/problem+json")
	w.WriteHeader(p.Status)
	_ = json.NewEncoder(w).Encode(p)
}

// handlerError answers when a handler returns an error instead of a response.
func handlerError(w http.ResponseWriter, r *http.Request, err error) {
	slog.ErrorContext(r.Context(), "handler failed", "error", err)
	writeProblem(w, problem(http.StatusInternalServerError, "Something went wrong on our side"))
}

// validationProblem answers when a request breaks the contract: unknown route, wrong method,
// or fields that break their rules, listed one by one.
func validationProblem(_ context.Context, err error, w http.ResponseWriter, _ *http.Request, opts nethttpmiddleware.ErrorHandlerOpts) {
	switch {
	case errors.Is(err, routers.ErrMethodNotAllowed):
		writeProblem(w, problem(http.StatusMethodNotAllowed, "Method not allowed"))
	case opts.MatchedRoute == nil:
		writeProblem(w, problem(http.StatusNotFound, "Not found"))
	default:
		fields := fieldErrors(err)
		title := "Some fields are invalid"
		if len(fields) == 0 {
			title = "The request body isn't valid JSON for this endpoint"
		}
		writeProblem(w, problem(http.StatusBadRequest, title, fields...))
	}
}

func fieldErrors(err error) []api.FieldError {
	var all openapi3.MultiError
	if errors.As(err, &all) {
		var out []api.FieldError
		for _, e := range all {
			out = append(out, fieldErrors(e)...)
		}
		return out
	}
	var se *openapi3.SchemaError
	if !errors.As(err, &se) {
		return nil
	}
	return []api.FieldError{{Field: fieldName(se), Message: ruleMessage(se)}}
}

// A missing or unknown property is reported on its parent object; the reason names it.
var namedProperty = regexp.MustCompile(`property "([^"]+)" is (?:missing|unsupported)`)

func fieldName(se *openapi3.SchemaError) string {
	if m := namedProperty.FindStringSubmatch(se.Reason); m != nil {
		return m[1]
	}
	return strings.Join(se.JSONPointer(), ".")
}

// ruleMessage turns a broken schema rule into a sentence for the user.
func ruleMessage(se *openapi3.SchemaError) string {
	s := se.Schema
	switch se.SchemaField {
	case "required":
		return "Required."
	case "minLength":
		return fmt.Sprintf("Use at least %d characters.", s.MinLength)
	case "maxLength":
		return fmt.Sprintf("Use at most %d characters.", *s.MaxLength)
	case "format":
		if s.Format == "email" {
			return "Enter a valid email address."
		}
	case "pattern":
		if s.Description != "" {
			return strings.ReplaceAll(s.Description, "`", "")
		}
	case "properties": // a property the schema doesn't define
		return "Unknown field."
	}
	return se.Reason
}
