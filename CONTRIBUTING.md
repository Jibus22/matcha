# Contributing to matcha

## Prerequisites

- [Nix](https://nixos.org/download) with flakes enabled, and [direnv](https://direnv.net) with [nix-direnv](https://github.com/nix-community/nix-direnv).
- Docker (OrbStack, Docker Desktop…), running.

## Getting started

```bash
direnv allow   # loads the dev shell: every toolchain, pinned by flake.lock
pnpm install   # installs the formatters and activates the git hooks
just           # lists the recipes
```

Without direnv, run `nix develop` first and export `KUBECONFIG` as `.envrc` does. Run git from that shell: the hooks need its tools.

## Local cluster

```bash
just up     # creates the k3d cluster if it's missing, then starts Tilt (http://localhost:10350)
just psql   # psql into the local Postgres, as the superuser
just down   # deletes the cluster and everything in it
```

- Traefik answers on http://localhost:8080.
- `.envrc` points `KUBECONFIG` at `.direnv/kubeconfig`: inside the repo, `kubectl`, `helm` and `tilt` only see the local cluster, and `~/.kube/config` is never touched. `just up` refuses to run without it.

## Observability

- Grafana on http://localhost:3000, no login: Tempo (traces), Loki (logs) and Prometheus (metrics) are already wired in. Telemetry resets when the `otel-lgtm` pod restarts.
- Services send OTLP to the address in `OTEL_EXPORTER_OTLP_ENDPOINT`: `http://otel-lgtm.observability:4318` in the local cluster. Never hard-code it.
- Traefik traces every request it receives, so a request's trace starts at the edge. A new trace takes about 20 seconds to become searchable in Tempo.

## The flow: one issue → one branch → one PR

`main` only changes through pull requests, squash-merged, so its history stays linear with one commit per change.

1. **Issue first**, from the template, on the [project board](https://github.com/users/Jibus22/projects/4).
2. **Branch** off `main`: `type/MT-<issue>/description`, e.g. `chore/MT-1/repo-foundations`. Types: `feat fix chore docs refactor ci test wip`; `wip/MT-xxx/…` for a spike without an issue.
3. **Commit** in small steps. The hook prefixes each message with the ticket: `[MT-1] …`.
4. **Open a PR** against `main`, from the template. Its title becomes the commit on `main`.
5. **Squash & merge.** GitHub deletes the branch. Never `gh pr merge --delete-branch`: it closes the PRs stacked on it.

One issue at a time. Dependent work: branch the next issue off the previous one and merge bottom-up.

## Commits

- [Conventional Commits](https://www.conventionalcommits.org): `type(scope): outcome`. The scope is one service or area (`auth`, `profiles`, `chat`, `web`, `dev`…) or none, never a list. `!` after the type marks a breaking change.
- At most 50 characters after the `[MT-n] ` prefix: squashed, the title gets ` (#NNN)` appended, and GitHub cuts a subject past 72.
- The body says why, and what the change decides; the diff already says what. Wrapped at 72 columns. A body past ~350 characters means the commit does two things: split it.
- Every commit builds and passes its tests.

## Issues

- Title ≤ 72 characters, body ≤ ~20 lines.
- Decisions are the payload, each with its reason. No implementation plan and no `file:line`: the code moves while the issue waits.
- An assignee, at least one label, and a place on the board.

## Pull requests

- Title: `[MT-n] type(scope): outcome`, with the same 50-character cap.
- Short: ≤ ~20 lines above **How to test**. Why over what: only the decisions a reviewer wouldn't guess. Delete empty sections.
- No commit-by-commit walkthrough (the commits are that), no open questions (settle them first), no hard wraps.
- **Out of scope** names what was left out, with its follow-up issue.
- UI change: screenshots as GitHub attachments, never committed.
- `Closes #<issue>` is the last line of the description.
- Past ~400 lines of logic (tests, docs and lockfiles don't count), split the PR.

## Git hooks

Installed by `pnpm install` (husky):

| Hook                 | Does                                                                 |
| -------------------- | -------------------------------------------------------------------- |
| `post-checkout`      | Warns when the branch name breaks the convention                     |
| `prepare-commit-msg` | Prefixes the message with the branch's ticket                        |
| `commit-msg`         | Refuses a subject that isn't Conventional Commits or is too long     |
| `pre-commit`         | Formats the staged files                                             |
| `pre-push`           | Refuses a bad branch name or a push to `main`, then runs `just lint` |

`sh .husky/test.sh` checks the hooks' rules.
