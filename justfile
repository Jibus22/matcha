default:
    @just --list

# Every file git tracks or would track. Unlike `prettier .`, this skips local-only files
# listed in .git/info/exclude.
files := "git ls-files -z --cached --others --exclude-standard"

# Format every file
fmt:
    {{ files }} | xargs -0 pnpm exec prettier --write --ignore-unknown --no-error-on-unmatched-pattern

# Fail if a file isn't formatted
fmt-check:
    {{ files }} | xargs -0 pnpm exec prettier --check --ignore-unknown --no-error-on-unmatched-pattern

# What the pre-push hook runs. Each service adds its linter here.
lint: fmt-check

cluster := "matcha"

# Create the local cluster if it's missing
up:
    @test -n "${KUBECONFIG:-}" || { echo "KUBECONFIG is unset: run this from the direnv shell, or k3d writes ~/.kube/config"; exit 1; }
    k3d cluster list {{ cluster }} >/dev/null 2>&1 || k3d cluster create --config dev/k3d.yaml
    k3d kubeconfig merge {{ cluster }} --kubeconfig-merge-default --kubeconfig-switch-context >/dev/null

# Delete the local cluster and everything in it
down:
    k3d cluster delete {{ cluster }}
