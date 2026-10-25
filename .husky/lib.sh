# Sourced by the hooks. Husky runs them with `sh -e`, so everything here is POSIX sh.

# type/MT-<issue>/description, or wip/MT-xxx/description for a spike without an issue.
valid_branch() {
  printf '%s\n' "$1" | grep -Eq '^(feat|fix|chore|docs|refactor|ci|test|wip)/MT-([0-9]+|xxx)/[a-z0-9-]+$'
}

branch_help() {
  echo "  Expected: type/MT-<issue>/description, e.g. chore/MT-1/repo-foundations"
  echo "  type: feat fix chore docs refactor ci test wip (wip/MT-xxx/… for a spike)"
}
