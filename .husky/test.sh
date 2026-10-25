# Self-check for the hooks' rules: sh .husky/test.sh
set -e
cd "$(dirname "$0")/.."
. .husky/lib.sh

ok() { "$@" || { echo "FAIL, should pass: $*" && exit 1; }; }
ko() { if "$@"; then echo "FAIL, should be refused: $*" && exit 1; fi; }

ok valid_branch chore/MT-1/repo-foundations
ok valid_branch wip/MT-xxx/spike
ko valid_branch main
ko valid_branch feature/MT-1/repo
ko valid_branch feat/SD-1/repo
ko valid_branch feat/MT-1/Bad_Name

msg=$(mktemp)
subject() { printf '%s\n' "$1" >"$msg" && sh .husky/commit-msg "$msg" >/dev/null; }
ok subject '[MT-1] chore(dev): add the nix dev shell'
ok subject '[WIP] feat!: drop the legacy route'
ok subject 'fixup! [MT-1] chore(dev): add the nix dev shell'
ko subject '[MT-1] add the nix dev shell'
ko subject '[MT-1] chore(dev, web): two scopes'
ko subject '[MT-1] feat(auth): a subject that runs well past the fifty character cap'
rm -f "$msg"

echo "hooks: all checks pass"
