# ADR-0100: Toolchain

- **Status:** Accepted
- **Decides:** Nix pins every tool and runs every check, `just` runs every task, and Zed is the supported editor.

## Context

A tool choice is worth something only when every machine reproduces it. Four failures matter:

1. A tool resolves from `$PATH`, at whatever version the machine has.
2. Two machines have the same tool version, but the tool links against different system libraries.
3. A check runs only in CI, so every local commit passes it.
4. A pin goes stale because nobody updates it.

A repo can also hold more than one language, ship artifacts, or run its own machines. One mechanism must cover all of these cases.

| Option | Verdict |
| --- | --- |
| A version manager, such as mise or asdf | It pins versions only. A tool still links against the libraries of the machine |
| Dev Containers | Every command runs in a container, and the image drifts unless it is built from pins |
| devbox, Flox, or devenv | A second layer with its own config on top of Nix |
| **Nix with flakes** | **Chosen. One lock file pins every tool and every library under it. Nix also builds packages, images, and machines** |
| Guix | The same model as Nix, with a smaller package set |

## Decision

### Nix pins every tool

`flake.nix` imports the tabnix module, which holds the shared dev shell, git hooks, and checks. The repo adds only its own tools. `flake.lock` pins `nixpkgs` and every other input, so every engineer, CI run, and machine gets the same tools.

| Tool | Owns |
| --- | --- |
| Nix with flakes | Tool versions, the dev shell, and the sandboxed checks |
| Bun | The runtime, install, and tests |
| TypeScript | The type check, as `tsc --noEmit` |
| Biome | TypeScript and JavaScript lint and format |
| bun2nix | `bun.nix`, from which a check installs the dependencies |
| `just` | Tasks |
| Zed | The supported editor, with its project settings in `.zed/` |
| tabnix, with flake-parts | The shared dev shell, git hooks, and checks |
| `git-hooks.nix`, with `prek` | Git hooks, declared through tabnix |
| cocogitto | Commit message shape |
| rumdl | Markdown style |
| tablint | Prose, comments, and ADRs, per ADR-0001 |
| dprint | JSON, JSONC, TOML, and YAML format |
| gitleaks | Secret scanning |
| Renovate | Updates to `flake.lock`, the packages in `package.json`, and the GitHub Actions |

`nixpkgs` follows `nixpkgs-unstable`, so the tools stay current. The lock fixes the version of each tool. A version that `nixpkgs` does not have comes from an overlay in `flake.nix`.

The dev shell takes `bun` from `nixpkgs`, and `packageManager` in `package.json` names the same version.

An engineer enters the dev shell with `nix develop`, or with direnv through `.envrc`.

### `just` runs every task

Nix decides what is installed, and `just` decides what runs.

| Option | Verdict |
| --- | --- |
| Flake apps, `nix run .#task` | Each run waits for an evaluation, and tasks have no dependencies or arguments |
| mise tasks | mise is also a version manager, and that role overlaps with Nix |
| Make | Its file-target model and whitespace rules do not fit a list of commands |
| **`just`** | **Chosen. One small binary, with recipe dependencies, arguments, and doc comments** |

| Recipe | Does |
| --- | --- |
| `setup` | Builds the dev shell, installs the locked dependencies, and installs the git hooks |
| `dev` | Runs the app and reloads on change |
| `start` | Runs the app |
| `bun-nix` | Writes `bun.nix` again from `bun.lock` |
| `format` | Applies every formatter and every safe lint fix |
| `lint` | Runs every linter |
| `test` | Runs the tests |
| `check` | Runs `lint` and `test`. It is the fast gate before a change is finished |
| `ci` | Runs `nix flake check`. It is exactly what CI runs |

A recipe that calls a tool stops outside the dev shell, so no tool comes from `$PATH`.

### One formatter for each file type

| File type | Formatter |
| --- | --- |
| TypeScript and JavaScript | Biome |
| Markdown | `rumdl` |
| Nix | `nixfmt` |
| JSON, JSONC, TOML, and YAML | dprint |
| `justfile` | `just --fmt` |

Biome uses tabs. Every other formatter uses two spaces and LF line endings. The repo has no `.editorconfig`: the formatters and their checks are the only rules. `just format` runs every formatter, and a check in `flake.nix` fails on a file that is not formatted.

dprint is one tool with one config for four file types. Its plugins are WebAssembly files from `nixpkgs`, pinned by `flake.lock`. dprint takes its config and plugins only as flags, so tabnix wraps the `dprint` command to add both.

| Option for JSON, TOML, and YAML | Verdict |
| --- | --- |
| Biome, Taplo, and yamlfmt | Three tools and three configs, and Biome finds a config in `.config/` only through a flag |
| Prettier | It needs Node.js |
| **dprint with its plugins** | **Chosen. One small tool, one config in `.config/`, and pinned plugins** |

### File layout

A file that a person reads or runs stays visible at the root: `README.md`, `LICENSE`, `AGENTS.md`, `flake.nix`, and `justfile`. A file that only a tool reads is hidden, with a dot name or in a dot folder.

Every tool config lives in `.config/`. A file that its tool reads only at the root stays there: `.envrc`, `.gitignore`, and `.gitattributes`.

| Tool | How it finds its config in `.config/` |
| --- | --- |
| rumdl | By itself |
| gitleaks | An environment variable that tabnix sets |
| Biome | `--config-path .config` in every recipe, check, hook, and Zed setting |
| cog | `--config` in every recipe, hook, and workflow |
| dprint | The wrapper in tabnix |

The `just` recipes are the only supported way to run a tool. A tool that someone runs by hand without its flag is outside this contract.

### TypeScript

Biome is both the linter and the formatter, for TypeScript and JavaScript only. It runs with warnings as errors. Biome replaces ESLint and Prettier: one tool and one config.

Biome reads a config in `.config/` only with `--config-path .config`, and only when the config excludes `.config` from its own files. Without that exclusion, Biome reads the same file again as a nested root config and stops.

The `package.json` scripts only call the `just` recipes. A new command is a recipe in `justfile`, not a script.

The checks need the dependencies, and the Nix sandbox has no network. So `bun2nix` writes `bun.nix` from `bun.lock`, with the hash of each package. A hook fails when `bun.nix` does not match `bun.lock`.

### The same checks everywhere

Every check is a derivation under `checks` in `flake.nix`. `nix flake check` builds each one in the Nix sandbox from the files that git tracks. So a local change that git does not track cannot make a check pass.

| When | What runs |
| --- | --- |
| Commit | The `pre-commit` hook runs the fast checks on the staged files, with `biome check --write`. A fix stops the commit, so the engineer reviews it. The `commit-msg` hook runs `cog verify` |
| Push | The `pre-push` hook runs `cog check` on the new commits, and `just ci` |
| CI | The workflow runs `just ci` inside `nix develop`, on every push to `master` and on every pull request |

Each hook calls its tool by its Nix store path, so it works in any terminal, inside the dev shell or not. Entering the dev shell installs the hooks.

CI also checks the pull request title with `cog`, because the title becomes the squash commit. The title reaches the shell only through an environment variable.

### Zed is the supported editor

The repo supports one editor fully and depends on none.

| Option | Verdict |
| --- | --- |
| **Zed** | **Chosen. It loads the dev shell through direnv with no plugin. Its project settings are plain files in `.zed/`. It is native and open source** |
| VS Code | It needs an extension to load the dev shell, and its settings mix the project and the person |
| A JetBrains IDE | It is commercial, and its project files hold personal state |
| Neovim or Helix | Each engineer builds a different setup, so a committed setup fits few people |

`.zed/settings.json` formats on save only with the formatters of the repo, so Zed and `just format` agree. It selects the language servers from the dev shell. It also holds the typing rules: two spaces, tabs in TypeScript and JavaScript, a final newline, and no trailing whitespace outside Markdown. `.zed/tasks.json` runs the `just` recipes.

Other editors use the same dev shell with no committed config. `just format` fixes what they get wrong.

### Nix beyond the toolchain

A repo uses the layers of Nix that its kind needs.

| Kind of repo | Builds its artifacts with Nix | Declares its machines with NixOS |
| --- | --- | --- |
| A library or a tool with no deploy | Not applicable | Not applicable |
| An app that a managed provider runs | When the provider takes an image | No. The provider runs the machine |
| An app on its own machines, with no orchestrator | Yes | Yes |
| An app on an orchestrator | Yes | Only the hosts outside the cluster |

## Consequences

- Every engineer installs Nix and enables flakes, which upstream marks as experimental. Nix runs on Linux and macOS, and on Windows only inside WSL.
- Zed needs direnv, and nix-direnv for a fast reload. Each engineer allows `.envrc` once.
- A push runs the full gate locally first, so a slow gate makes every push slow. `git push --no-verify` skips it, and CI still runs it.
- CI downloads every tool on each run unless the workflow has a binary cache.
- Renovate needs its GitHub app on the repo. Without it, the pins go stale.
- A change to a shared hook or check reaches the repo only when the tabnix input moves to a new tag.
- A dependency change also changes `bun.nix`. `just bun-nix` writes it, and the hook fails until it matches `bun.lock`.

## Rules

- Every tool comes from the dev shell of `flake.nix`, never from a second version manager.
- `flake.lock` is committed. Renovate updates it, and the CI gate decides.
- Every task is a `just` recipe with a doc comment. A recipe that calls a tool runs only inside the dev shell.
- Every check is a derivation under `checks` in `flake.nix`, and `just ci` is the only CI step after setup. `(CI: ci)`
- The git hooks are declared in `flake.nix`, through tabnix.
- Every tracked text format has one formatter in the dev shell and a check in `flake.nix`. `(CI: ci)`
- A file that a person reads or runs is visible at the root. Every tool config lives in `.config/`, unless its tool reads it only at the root.
- The editor formats only with the formatters of the repo. No check depends on the editor.
- `just check` passes before a change is finished.
- Commit messages and pull request titles follow Conventional Commits with the types in `.config/cog.toml`. `(ref: Conventional Commits 1.0.0)`
- A Biome rule is disabled by name with a reason in `.config/biome.json`. `(CI: lint-ts)`
- Every Biome call passes `--config-path .config`, and the config excludes `.config` from its files.
- `bun.nix` matches `bun.lock` in every commit.
- A workflow never puts event text, such as a pull request title, directly into a `run` script.
