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
