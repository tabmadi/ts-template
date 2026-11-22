# ADR-0103: Tasks

- **Status:** Accepted
- **Decides:** `just` runs every task, and the recipe names `setup`, `format`, `lint`, `test`, `check`, and `ci` are a contract.

## Context

Nix decides what is installed, per [ADR-0100](0100-toolchain.md). Something must also decide what runs, so that an engineer, a hook, CI, and a coding agent run the same command for the same job.

## Decision drivers

1. **A list of commands.** A task is a named command with arguments and dependencies. File targets are not needed.
2. **Readable.** A task reads like the shell command it runs.
3. **One binary.** The runner needs no language runtime and comes from the lock.
4. **Maintained.** The project is active.

## Considered options

| Option | 1 Commands | 2 Readable | 3 One binary | 4 Maintained | Verdict |
| --- | --- | --- | --- | --- | --- |
| Make | A build system of file targets, used as a runner | Tab and whitespace rules | Yes | Yes | Rejected on drivers 1 and 2 |
| Task, from a YAML Taskfile | Yes | A short recipe grows in YAML | Yes | Yes | Rejected on driver 2 |
| npm scripts | Yes | One line of JSON per task | Needs Node.js | Yes | Rejected on driver 3 |
| Flake apps, with `nix run .#task` | No arguments or dependencies | Nix code | Yes | Yes | Rejected. Each run also waits for an evaluation |
| mise tasks | Yes | Yes | Yes | Yes | Rejected. mise is also a version manager, and that role overlaps with Nix |
| Earthly | Builds in containers | Yes | Needs a container runtime | No. Active development stopped in 2025 | Rejected on drivers 3 and 4 |
| **`just`** | **Recipes with arguments, dependencies, and doc comments** | **Yes** | **Yes** | **Yes** | **Chosen** |

Sources:

- [just](https://just.systems/), [Task](https://taskfile.dev/), [GNU Make](https://www.gnu.org/software/make/).
- Earthly winds down: [A message about Earthly](https://earthly.dev/blog/shutting-down-earthfiles-cloud/).

## Decision

Every task is a recipe in `justfile`, with a doc comment that `just --list` shows.

| Recipe | Does |
| --- | --- |
| `setup` | Builds the dev shell and installs the git hooks |
| `format` | Applies every formatter |
| `lint` | Runs every linter |
| `test` | Runs the tests |
| `check` | Runs `lint`, `test`, and `build` if the repo has a build. It is the fast gate before a change is finished |
| `ci` | Runs `nix flake check`, which every push must pass. A repo can add slower CI jobs beside it |

A repo adds recipes for its own jobs. The six names above always exist, and their names do not change.

A recipe that calls a tool stops outside the dev shell, so no tool comes from `$PATH`.

## Consequences

- An engineer learns one small syntax. `just --fmt` formats the file, and a check fails on a file that is not formatted.
- A recipe is a shell command, so a long one moves into a script that the recipe calls.

## Rules

- Every task is a `just` recipe with a doc comment. A recipe that calls a tool runs only inside the dev shell. `(CI: lint-prose)`
- The recipes `setup`, `format`, `lint`, `test`, `check`, and `ci` exist, and their names do not change.
- `just check` passes before a change is finished.
