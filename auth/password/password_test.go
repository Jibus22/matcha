package password

import (
	"errors"
	"strings"
	"testing"
)

func TestCheck(t *testing.T) {
	refused := map[string]string{
		"Bonjour2024!":  "French word",
		"Sunshine2024!": "English word",
		"Mariposa2024!": "Spanish word",
		"Farfalla2024!": "Italian word",
		"Wohnung2024!!": "German word",
		"Saudade2024!!": "Portuguese word",
		"Été-2024-2025": "French word with an accent",
		"P4ssw0rd2024":  "leetspeak of a common password",
		"1l0veyou2024!": "leetspeak, 1 read as i or l",
		"qwertyuiop123": "common password",
		"Short1!":       "too short",
	}
	for pw, why := range refused {
		var rej *Rejection
		if err := Check(pw); !errors.As(err, &rej) {
			t.Errorf("%q (%s) was accepted", pw, why)
		} else if strings.Contains(rej.Reason, pw) {
			t.Errorf("the refusal for %q echoes the password", pw)
		}
	}

	accepted := []string{
		"correct-horse-battery-staple", // several words: a passphrase
		"Mot de passe très long!",
		"zx9!Kq#2vL@8wT",
	}
	for _, pw := range accepted {
		if err := Check(pw); err != nil {
			t.Errorf("%q was refused: %v", pw, err)
		}
	}
}

func TestCandidates(t *testing.T) {
	got := Candidates("P4ssw0rd2024")
	for _, want := range []string{"p4ssw0rd2024", "p4ssw0rd", "password"} {
		found := false
		for _, g := range got {
			found = found || g == want
		}
		if !found {
			t.Errorf("Candidates(P4ssw0rd2024) = %v, missing %q", got, want)
		}
	}
}
