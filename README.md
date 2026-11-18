# TypeScript Template

A template for a TypeScript application on the Bun runtime. Bun runs TypeScript with no build step, Biome lints and formats, and the `tsconfig` is strict. It starts from [github-project-template](https://github.com/tabmadi/github-project-template), so it has the same hooks, CI gate, and documentation convention.

## Stack

| Tool | Owns |
| --- | --- |
| [Bun](https://bun.sh) | The runtime, install, and tests |
| [TypeScript](https://www.typescriptlang.org) | The type check |
| [Biome](https://biomejs.dev) | Lint and format |
| [convict](https://github.com/mozilla/node-convict) | Configuration |
| [Nix](https://nixos.org) with flakes | Tool versions, the dev shell, and the sandboxed checks |
| [bun2nix](https://github.com/nix-community/bun2nix) | The dependency set for Nix |
| [tabnix](https://github.com/tabmadi/tabnix) | The shared dev shell, git hooks, and checks |
| [just](https://just.systems) | Tasks |
| [Zed](https://zed.dev) | The supported editor, with project settings in `.zed/` |
| [git-hooks.nix](https://github.com/cachix/git-hooks.nix) | Git hooks |
| [cocogitto](https://docs.cocogitto.io) | Conventional Commits checks |
| [rumdl](https://github.com/rvben/rumdl) | Markdown lint |
| [dprint](https://dprint.dev) | JSON, TOML, and YAML format |
| [tablint](https://github.com/tabmadi/tablint) | Prose, comments, and ADRs |
| [gitleaks](https://github.com/gitleaks/gitleaks) | Secret scan |
| [Renovate](https://docs.renovatebot.com) | Updates to the pinned versions |

## Getting started

1. Install [Nix](https://nixos.org/download) and enable flakes. For the editor, also install [Zed](https://zed.dev), and [direnv](https://direnv.net) with [nix-direnv](https://github.com/nix-community/nix-direnv). direnv enters the dev shell on `cd`, and Zed loads it through direnv.
2. Clone the repo and enter the dev shell. The first entry downloads every tool and installs the git hooks:

   ```bash
   git clone git@github.com:tabmadi/ts-template.git
   cd ts-template
   nix develop
   ```

3. Install the locked dependencies, then start the server in watch mode:

   ```bash
   just setup
   just dev
   ```

4. Call it from another terminal:

   ```bash
   curl http://localhost:3000/health
   ```

## Editor

Open the folder in Zed, and run `direnv allow` once. Zed suggests its Nix extension when you open `flake.nix`, so install it once on each machine. Zed then uses the language servers and formatters of the dev shell, formats on save, and lists every recipe under `task: spawn`. Zed loads the dev shell when it opens the folder. After a change to `flake.nix`, open the folder again, so Zed loads the new tools. Any other editor works through the same dev shell.

## Tasks

| Recipe | Does |
| --- | --- |
| `just setup` | Builds the dev shell, installs the locked dependencies, and installs the git hooks |
| `just dev` | Runs the app and reloads on change |
| `just start` | Runs the app |
| `just bun-nix` | Writes `bun.nix` again from `bun.lock`. Run it after each dependency change |
| `just format` | Applies every formatter and every safe lint fix |
| `just lint` | Runs every linter: `lint-ts`, `lint-prose`, `lint-md`, `lint-secrets`, `lint-data`, `lint-nix`, and `lint-just` |
| `just test` | Runs the tests |
| `just check` | Runs `lint` and `test`. Run it before you finish a change |
| `just ci` | Runs `nix flake check`, exactly what CI runs: the tests and every linter. The `pre-push` hook runs it too |

## Layout

```text
.
├── .config/
│   ├── biome.json    TypeScript lint and format rules
│   ├── cog.toml      Commit types
│   ├── dprint.json   JSON, TOML, and YAML format rules
│   ├── gitleaks.toml Secret scan rules
│   └── rumdl.toml    Markdown rules
├── .github/          Issue forms, the CI workflow, Renovate, SECURITY.md, and CODE_OF_CONDUCT.md
├── .zed/             Zed project settings and tasks
├── src/
│   ├── index.ts      The HTTP server with a /health route
│   ├── config.ts     The configuration schema
│   └── __tests__/    The tests
├── docs/adr/         The decisions of the project: foundations, doc conventions, toolchain
├── template/         What only the template needs: its contract, checks, and outputs
├── .envrc            Enters the dev shell through direnv
├── flake.nix         The dev shell, the git hooks, and the checks
├── flake.lock        The pinned nixpkgs and inputs
├── bun.lock          The locked dependencies
├── bun.nix           The same dependencies for Nix
├── justfile          Tasks
├── package.json
├── tsconfig.json     Compiler settings
├── AGENTS.md
├── README.md
└── LICENSE
```

## Configuration

| Variable | Description | Default |
| --- | --- | --- |
| `PORT` | The port the server binds | `3000` |

## Starting a project

Make a new project with Nix. It copies every file except the `template/` folder, which holds what only the template needs. This is the preferred way:

```bash
nix flake new -t github:tabmadi/ts-template my-project
```

Then follow the steps that it prints:

1. In the new folder, run `git init` and `git add -A`. A flake sees only the files that git tracks.
2. Change `name` in `package.json` to your own.
3. Run `nix develop`. It downloads the tools and installs the git hooks.
4. Run `just setup`. It installs the locked dependencies.
5. Replace the sample server in `src/` with your own code.
6. Rewrite this README for the project, with the sections that ADR-0001 sets for its kind of repo.
7. Update the contacts in `.github/SECURITY.md` and the copyright line in `LICENSE`.
8. Install the [Renovate app](https://github.com/apps/renovate) on the new repository.

### With the GitHub template button

The button copies every file, the `template/` folder included. Remove it in the first commit:

1. Clone the new repository, and run `nix develop` in it.
2. Run `just init`. It prints the first steps, and it removes the `template/` folder with git.
3. Commit the removal.
4. Follow the printed steps from step 2. Your repository already has git.

## Decisions

The ADRs in [docs/adr](docs/adr/README.md) record every decision and the reason for it. `template/adr/0000-template-contract.md` records what makes this repo a template. [ADR-0001](docs/adr/0001-documentation-conventions.md) is the house style for all text.

## Contributing

Follow the [Code of Conduct](.github/CODE_OF_CONDUCT.md). Commit messages follow [Conventional Commits](https://www.conventionalcommits.org), and the `commit-msg` hook checks them. Run `just check` before you open a pull request.

## Security

To report a vulnerability, follow [SECURITY.md](.github/SECURITY.md).

## License

Apache License 2.0. See [LICENSE](LICENSE).
