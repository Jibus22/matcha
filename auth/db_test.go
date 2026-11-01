package main

import (
	"context"
	"errors"
	"testing"

	"github.com/jackc/pgx/v5/pgconn"
)

func TestMigrationsRunTwiceAndUniquenessIgnoresCase(t *testing.T) {
	ctx := context.Background()
	db, err := openDB(ctx)
	if err != nil {
		t.Fatalf("first migration: %v", err)
	}
	defer db.Close()
	if err := migrate(ctx, db); err != nil {
		t.Fatalf("second migration: %v", err)
	}
	if _, err := db.Exec(ctx, `TRUNCATE accounts CASCADE`); err != nil {
		t.Fatal(err)
	}

	insert := `INSERT INTO accounts (email, username, first_name, last_name, password_hash)
	           VALUES ($1, $2, 'Jean', 'Dupont', 'hash')`
	if _, err := db.Exec(ctx, insert, "Jean@Example.com", "Jibus22"); err != nil {
		t.Fatalf("first account: %v", err)
	}
	for _, dup := range [][2]string{{"jean@example.com", "someone"}, {"other@example.com", "JIBUS22"}} {
		_, err := db.Exec(ctx, insert, dup[0], dup[1])
		var pgErr *pgconn.PgError
		if !errors.As(err, &pgErr) || pgErr.Code != "23505" {
			t.Errorf("insert %v: got %v, want a unique violation", dup, err)
		}
	}
}
