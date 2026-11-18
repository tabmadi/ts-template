# ADR-0101: Source control and CI

- **Status:** Accepted
- **Decides:** The git hooks, the commit convention and its check, the secret scan, and the CI gate.

## Context

A check that runs only in CI fails after the push, when the author has moved on. A check that runs only in a hook binds only the machine where the hook is installed. So the same checks run at commit time, at push time, and in CI.

A commit history with free-form messages has no reliable type. A release tool and a reviewer then read each message by hand.

A secret in a commit stays in the history after a later commit removes it.

## Decision drivers

1. **Pinned.** The hook runner and every hook come from the lock of [ADR-0100](0100-toolchain.md), with no second package manager.
2. **Outside the shell.** A hook works in any terminal and in an editor, inside the dev shell or not.
3. **One tool per job.** A tool with no runtime beyond a single binary wins over one that needs Node.js or Python.
4. **Open.** The license lets any project use the tool with no condition on its own code.

## Considered options

### The hook runner

| Option | 1 Pinned | 2 Outside the shell | 3 Runtime | Verdict |
| --- | --- | --- | --- | --- |
| husky | npm only | Needs Node.js on `PATH` | Node.js | Rejected |
| pre-commit | It downloads hook environments itself | Yes | Python | Rejected on drivers 1 and 3 |
| lefthook | Yes, from `nixpkgs` | Only when each command reaches its tool | A single binary | Rejected. Each command needs the dev shell or a wrapper |
| **git-hooks.nix with prek** | **Yes. Each hook is a store path** | **Yes** | **A single binary** | **Chosen** |

Sources:

- prek is a Rust rewrite of pre-commit, compatible with its config: [prek](https://github.com/j178/prek).
- git-hooks.nix declares hooks in a flake: [cachix/git-hooks.nix](https://github.com/cachix/git-hooks.nix).

### The commit convention and its check

| Option | Machine-readable type | 3 Runtime | Verdict |
| --- | --- | --- | --- |
| Free-form messages | No | Not applicable | Rejected |
| Conventional Commits with commitlint | Yes | Node.js | Rejected on driver 3 |
| Conventional Commits with committed | Yes | A single binary | Rejected. It checks style and has no changelog or bump |
| **Conventional Commits with cocogitto** | **Yes** | **A single binary** | **Chosen. It checks each message, a range of commits, and the pull request title** |

Sources:

- [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/), [cocogitto](https://docs.cocogitto.io/), [commitlint](https://commitlint.js.org/).

### The secret scan

| Option | 3 Runtime | 4 Open | Verdict |
| --- | --- | --- | --- |
| trufflehog | A single binary | AGPL-3.0 | Rejected on driver 4. It also verifies each secret live, which a commit hook does not need |
| detect-secrets | Python | Apache-2.0 | Rejected on driver 3 |
| **gitleaks** | **A single binary** | **MIT** | **Chosen. It scans a staged change in a hook and the working tree in a check** |

Sources:

- [gitleaks](https://github.com/gitleaks/gitleaks), [trufflehog](https://github.com/trufflesecurity/trufflehog), [detect-secrets](https://github.com/Yelp/detect-secrets).

### The CI gate

| Option | Gate for a contributor without the hooks | Verdict |
| --- | --- | --- |
| The `pre-push` hook only | No. `--no-verify` and a missing hook skip it | Rejected as the only gate. The hook stays, for early feedback |
| A CI system outside the forge | Yes, with a second login and a second config | Rejected. The repo lives on GitHub |
| **GitHub Actions running `just ci`** | **Yes** | **Chosen. One step after setup, so CI and a laptop run the same command** |

## Decision

| When | What runs |
| --- | --- |
| Commit | The `pre-commit` hook runs the fast checks on the staged files. The `commit-msg` hook runs `cog verify` |
| Push | The `pre-push` hook runs `cog check` on the new commits, and `just ci` |
| CI | The workflow runs `just ci` inside `nix develop`, on every push to `master` and on every pull request |

tabnix declares the hooks, and entering the dev shell installs them. Each hook calls its tool by its Nix store path.

Before the first push, `cog check` checks every commit. After it, `cog check` checks only the commits that the push adds, so older history can predate the convention.

CI also checks the pull request title with `cog`, because the title becomes the squash commit. The title reaches the shell only through an environment variable.

## Consequences

- A push runs the full gate locally first, so a slow gate makes every push slow. `git push --no-verify` skips it, and CI still runs it.
- A repo that turns GitHub Actions off has the hook as its only gate.
- gitleaks scans the working tree in the local recipe, so it also reads files that git ignores. Its config skips build output, installed dependencies, and lock files.

## Rules

- The git hooks are declared in `flake.nix`, through tabnix.
- Commit messages and pull request titles follow Conventional Commits with the types in `.config/cog.toml`. `(ref: Conventional Commits 1.0.0)`
- `just ci` is the only CI step after setup. `(CI: ci)`
- A workflow never puts event text, such as a pull request title, directly into a `run` script.
- A secret never enters a commit. `(CI: lint-secrets)`
