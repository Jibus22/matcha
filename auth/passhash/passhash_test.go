package passhash

import (
	"strings"
	"testing"
)

func TestHashAndVerify(t *testing.T) {
	h1, err := Hash("correct-horse-battery-staple")
	if err != nil {
		t.Fatal(err)
	}
	h2, _ := Hash("correct-horse-battery-staple")

	if !strings.HasPrefix(h1, "$argon2id$v=19$m=19456,t=2,p=1$") {
		t.Errorf("hash %q isn't in the expected PHC format", h1)
	}
	if h1 == h2 {
		t.Error("two hashes of the same password are equal: the salt isn't random")
	}
	if ok, err := Verify("correct-horse-battery-staple", h1); !ok || err != nil {
		t.Errorf("the right password doesn't verify: %v %v", ok, err)
	}
	if ok, _ := Verify("correct-horse-battery-stapl", h1); ok {
		t.Error("a wrong password verifies")
	}
	if _, err := Verify("anything", "not-a-hash"); err == nil {
		t.Error("a malformed hash gives no error")
	}
}
