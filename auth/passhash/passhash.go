// Package passhash stores passwords as argon2id hashes, with a random salt per password, in the
// standard PHC string format: $argon2id$v=19$m=19456,t=2,p=1$<salt>$<hash>.
package passhash

import (
	"crypto/rand"
	"crypto/subtle"
	"encoding/base64"
	"errors"
	"fmt"
	"strings"

	"golang.org/x/crypto/argon2"
)

// OWASP's minimum recommended argon2id parameters: 19 MiB of memory, 2 passes, 1 thread.
const (
	memoryKiB = 19 * 1024
	passes    = 2
	threads   = 1
	saltLen   = 16
	keyLen    = 32
)

var b64 = base64.RawStdEncoding

// Hash returns the PHC string to store for password.
func Hash(password string) (string, error) {
	salt := make([]byte, saltLen)
	if _, err := rand.Read(salt); err != nil {
		return "", err
	}
	key := argon2.IDKey([]byte(password), salt, passes, memoryKiB, threads, keyLen)
	return fmt.Sprintf("$argon2id$v=%d$m=%d,t=%d,p=%d$%s$%s",
		argon2.Version, memoryKiB, passes, threads, b64.EncodeToString(salt), b64.EncodeToString(key)), nil
}

// Verify reports whether password matches a hash made by Hash, reading the parameters from the
// hash itself so stored hashes keep working if the defaults change. The comparison takes the
// same time whatever the input.
func Verify(password, hash string) (bool, error) {
	parts := strings.Split(hash, "$")
	if len(parts) != 6 || parts[1] != "argon2id" {
		return false, errors.New("passhash: not an argon2id hash")
	}
	var version int
	var memory, time uint32
	var threads uint8
	if _, err := fmt.Sscanf(parts[2], "v=%d", &version); err != nil || version != argon2.Version {
		return false, fmt.Errorf("passhash: unsupported version %q", parts[2])
	}
	if _, err := fmt.Sscanf(parts[3], "m=%d,t=%d,p=%d", &memory, &time, &threads); err != nil {
		return false, fmt.Errorf("passhash: parameters %q: %w", parts[3], err)
	}
	salt, err := b64.DecodeString(parts[4])
	if err != nil {
		return false, err
	}
	want, err := b64.DecodeString(parts[5])
	if err != nil {
		return false, err
	}
	got := argon2.IDKey([]byte(password), salt, time, memory, threads, uint32(len(want)))
	return subtle.ConstantTimeCompare(got, want) == 1, nil
}
