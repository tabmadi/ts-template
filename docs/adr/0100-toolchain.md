# ADR-0100: Toolchain

**Status:** Accepted
**Decides:** The pinned toolchain, the task surface, what runs at commit and push time, and how the pins stay current.

## Context

The value of a template is that its tool choices are made and reproducible. Three failures matter. The first is a tool that resolves from `$PATH`, at the version the machine has. The second is a check that only CI runs, which every local commit passes. The third is a pin that nobody updates.

## Decision

`mise` pins every tool and is the only command surface. A command is `mise run <task>`.

| Tool | Owns |
| --- | --- |
| bun | The runtime, install, and tests |
| biome | Lint and format for TypeScript and JSON |
| typescript | The type check, as `tsc --noEmit` |
| lefthook | Git hooks |
| cocogitto | Commit message shape |
| rumdl | Markdown style |
| gitleaks | Secret scanning |
| Renovate | Updates to the pins |

Biome replaces ESLint and Prettier: one tool and one config file. It runs with warnings as errors.

The `package.json` scripts only call the `mise` tasks. A new command is a task in `.mise.toml`, not a script.

A hook has no active mise shell, so each hook command runs its tool through `mise x` or a `mise` task. The `pre-commit` hook runs Biome, the type check, the tests, `rumdl`, and `gitleaks`. The `pre-push` hook runs `cog check` on the commits that the push adds, and `mise run ci`.

The CI workflow runs `mise run ci` on every push to `master` and on every pull request. On a pull request, it also verifies the title with `cog`. Renovate opens a pull request for a new tool, package, or Action version, and the CI gate decides.

## Consequences

Without a hook through `mise x`, the lefthook script falls back to another package manager, such as `pnpm`, which writes its own lock file. So the `lefthook:` key in `.lefthook.yml` runs lefthook itself through mise.

Renovate needs the Renovate GitHub app on the repository. Without it, the pins go stale.

## Rules

- Every tool is pinned in `.mise.toml`. No tool is resolved from `$PATH`.
- Every command is a `mise` task with a `description`. A CI workflow step calls a task, never a tool directly.
- A git hook runs every tool through `mise x` or a `mise` task.
- The `package.json` scripts call `mise` tasks only.
- Commit messages and pull request titles follow Conventional Commits with the type set in `cog.toml`. `(ref: Conventional Commits 1.0.0)`
- `mise run check` passes before a change is finished.
- A workflow never puts event text, such as a pull request title, directly into a `run` script.
