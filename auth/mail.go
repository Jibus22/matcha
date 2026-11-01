package main

import (
	"context"
	"fmt"
	"log/slog"
	"net/mail"
	"net/smtp"
	"time"
)

type message struct{ Subject, Body string }

type mailer interface {
	Send(ctx context.Context, to string, m message) error
}

// smtpMailer sends plain-text email over SMTP without authentication: to Mailpit locally.
type smtpMailer struct{ addr, from string }

func (m smtpMailer) Send(_ context.Context, to string, msg message) error {
	from, err := mail.ParseAddress(m.from)
	if err != nil {
		return err
	}
	// `to` was validated as an email address and the subject is ours: no header injection.
	raw := fmt.Sprintf("From: %s\r\nTo: %s\r\nSubject: %s\r\nMIME-Version: 1.0\r\nContent-Type: text/plain; charset=utf-8\r\n\r\n%s",
		m.from, to, msg.Subject, msg.Body)
	return smtp.SendMail(m.addr, nil, from.Address, []string{to}, []byte(raw))
}

// sendLater sends in the background, so the answer neither waits for SMTP nor takes longer when
// an account exists, which would reveal that it does. A failure is logged; the user can ask for a
// new link.
func (s *server) sendLater(ctx context.Context, to string, msg message) {
	ctx = context.WithoutCancel(ctx) // keep the request's trace, not its cancellation
	go func() {
		ctx, cancel := context.WithTimeout(ctx, 30*time.Second)
		defer cancel()
		if err := s.mail.Send(ctx, to, msg); err != nil {
			slog.ErrorContext(ctx, "email not sent", "subject", msg.Subject, "error", err)
		}
	}()
}

func verificationEmail(firstName, link string) message {
	return message{
		Subject: "Verify your matcha account",
		Body: fmt.Sprintf("Hi %s,\n\nOpen this link to verify your account:\n%s\n\n"+
			"It works once and expires in 24 hours. If you didn't sign up for matcha, ignore this email.\n",
			firstName, link),
	}
}

func resetEmail(firstName, link string) message {
	return message{
		Subject: "Reset your matcha password",
		Body: fmt.Sprintf("Hi %s,\n\nOpen this link to choose a new password:\n%s\n\n"+
			"It works once and expires in 30 minutes. If you didn't ask for it, ignore this email: your password stays as it is.\n",
			firstName, link),
	}
}
