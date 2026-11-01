package main

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"testing"
)

// TestMain starts a throwaway Postgres with the dev shell's binaries and points the standard
// PG* variables at it, so database tests need neither the cluster nor Docker. It listens on a
// Unix socket only: no port to clash with.
func TestMain(m *testing.M) {
	os.Exit(withPostgres(m))
}

func withPostgres(m *testing.M) int {
	dir, err := os.MkdirTemp("", "auth-pg-")
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		return 1
	}
	defer os.RemoveAll(dir)

	data := filepath.Join(dir, "data")
	steps := [][]string{
		{"initdb", "-D", data, "-U", "postgres", "--auth=trust", "-E", "UTF8"},
		{"pg_ctl", "-D", data, "-l", filepath.Join(dir, "log"), "-o", "-k " + dir + " -h ''", "-w", "start"},
	}
	for _, step := range steps {
		if out, err := exec.Command(step[0], step[1:]...).CombinedOutput(); err != nil {
			fmt.Fprintf(os.Stderr, "%s: %v (run the tests from the dev shell)\n%s", step[0], err, out)
			return 1
		}
	}
	defer exec.Command("pg_ctl", "-D", data, "-m", "immediate", "stop").Run()

	for k, v := range map[string]string{"PGHOST": dir, "PGUSER": "postgres", "PGDATABASE": "postgres", "PGSSLMODE": "disable"} {
		os.Setenv(k, v)
	}
	return m.Run()
}
