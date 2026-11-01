// Command gen rebuilds password/data/blocklist.txt.gz from the pinned sources listed in
// password/data/SOURCES.md. Run it with `just blocklist`.
package main

import (
	"bufio"
	"compress/gzip"
	"fmt"
	"net/http"
	"os"
	"slices"
	"strings"

	"github.com/Jibus22/matcha/auth/password"
)

const (
	frequencyWords = "https://raw.githubusercontent.com/hermitdave/FrequencyWords/525f9b560de45753a5ea01069454e72e9aa541c6/content/2018/%[1]s/%[1]s_50k.txt"
	secLists       = "https://raw.githubusercontent.com/danielmiessler/SecLists/43cbd03be467262ca199816e4d2650c42759fa80/Passwords/Common-Credentials/100k-most-used-passwords-NCSC.txt"
)

func main() {
	entries := map[string]struct{}{}
	add := func(s string) {
		for _, form := range password.ListForms(s) {
			// Shorter forms would refuse passwords like "ab-1234567890" for matching "ab".
			if len([]rune(form)) >= 3 {
				entries[form] = struct{}{}
			}
		}
	}
	for _, lang := range []string{"fr", "en", "es", "it", "de", "pt"} {
		// Each line is "word count".
		must(eachLine(fmt.Sprintf(frequencyWords, lang), func(line string) { add(strings.Fields(line)[0]) }))
	}
	must(eachLine(secLists, add))

	sorted := make([]string, 0, len(entries))
	for e := range entries {
		sorted = append(sorted, e)
	}
	slices.Sort(sorted)

	f, err := os.Create("password/data/blocklist.txt.gz")
	must(err)
	zw, err := gzip.NewWriterLevel(f, gzip.BestCompression)
	must(err)
	for _, e := range sorted {
		_, err = fmt.Fprintln(zw, e)
		must(err)
	}
	must(zw.Close())
	must(f.Close())
	fmt.Printf("password/data/blocklist.txt.gz: %d entries\n", len(sorted))
}

func eachLine(url string, fn func(string)) error {
	resp, err := http.Get(url)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("%s: %s", url, resp.Status)
	}
	lines := bufio.NewScanner(resp.Body)
	for lines.Scan() {
		if line := strings.TrimSpace(lines.Text()); line != "" {
			fn(line)
		}
	}
	return lines.Err()
}

func must(err error) {
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}
