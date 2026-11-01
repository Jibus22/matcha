// Package password decides whether a password is acceptable: long enough, and, once normalized,
// neither a dictionary word (French, English, Spanish, Italian, German, Portuguese) nor one of
// the most common passwords.
package password

import (
	"bufio"
	"bytes"
	"compress/gzip"
	_ "embed"
	"fmt"
	"strings"
	"sync"
	"unicode"
	"unicode/utf8"

	"golang.org/x/text/runes"
	"golang.org/x/text/transform"
	"golang.org/x/text/unicode/norm"
)

// MinLength follows NIST SP 800-63B: length and a blocklist, no composition rules.
const MinLength = 12

// Rejection says why a password was refused, in words a user can act on. It never contains the
// password itself.
type Rejection struct{ Reason string }

func (r *Rejection) Error() string { return r.Reason }

// Check returns nil when the password is acceptable, and a *Rejection otherwise.
func Check(password string) error {
	if utf8.RuneCountInString(password) < MinLength {
		return &Rejection{fmt.Sprintf("Use at least %d characters.", MinLength)}
	}
	loadBlocklist.Do(load)
	for _, form := range Candidates(password) {
		if _, found := blocklist[form]; found {
			return &Rejection{"This is a common word or password, easy to guess. Try several words together."}
		}
	}
	return nil
}

// Candidates are the forms of a password compared with the blocklist: lowercased and without
// accents, then also with digits and symbols trimmed at both ends, and with leetspeak undone
// (before or after that trim, reading 1 as i or as l). "P4ssw0rd2024" gives "password".
func Candidates(password string) []string {
	base := Fold(password)
	var forms []string
	add := func(s string) {
		for _, f := range forms {
			if f == s {
				return
			}
		}
		if s != "" {
			forms = append(forms, s)
		}
	}
	add(base)
	add(trimEnds(base))
	for _, one := range []rune{'i', 'l'} {
		add(unleet(trimEnds(base), one))
		add(trimEnds(unleet(base, one)))
	}
	return forms
}

// Fold lowercases and removes accents: "Été" gives "ete". The blocklist is built with it too.
func Fold(s string) string {
	noAccents, _, _ := transform.String(transform.Chain(norm.NFD, runes.Remove(runes.In(unicode.Mn)), norm.NFC), s)
	return strings.ToLower(noAccents)
}

// ListForms are the blocklist entries for one source word or password: folded, and also with
// digits and symbols trimmed at both ends ("password1" also blocks "password").
func ListForms(entry string) []string {
	folded := Fold(entry)
	if trimmed := trimEnds(folded); trimmed != folded && trimmed != "" {
		return []string{folded, trimmed}
	}
	return []string{folded}
}

func trimEnds(s string) string {
	return strings.TrimFunc(s, func(r rune) bool { return !unicode.IsLetter(r) })
}

var leet = map[rune]rune{'0': 'o', '3': 'e', '4': 'a', '5': 's', '7': 't', '8': 'b', '@': 'a', '$': 's'}

func unleet(s string, one rune) string {
	return strings.Map(func(r rune) rune {
		if r == '1' {
			return one
		}
		if letter, ok := leet[r]; ok {
			return letter
		}
		return r
	}, s)
}

// The blocklist ships in the binary, built by `just blocklist` from pinned sources (see
// data/SOURCES.md), and is loaded on first use.
//
//go:embed data/blocklist.txt.gz
var blocklistGzip []byte

var (
	loadBlocklist sync.Once
	blocklist     map[string]struct{}
)

func load() {
	zr, err := gzip.NewReader(bytes.NewReader(blocklistGzip))
	if err != nil {
		panic(fmt.Sprintf("password: embedded blocklist: %v", err))
	}
	blocklist = make(map[string]struct{}, 400_000)
	lines := bufio.NewScanner(zr)
	for lines.Scan() {
		blocklist[lines.Text()] = struct{}{}
	}
	if err := lines.Err(); err != nil {
		panic(fmt.Sprintf("password: embedded blocklist: %v", err))
	}
}
