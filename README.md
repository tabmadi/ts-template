# TypeScript Template

A template for a TypeScript application on the Bun runtime. Bun runs TypeScript with no build step, Biome lints and formats, and the `tsconfig` is strict. It starts from [github-project-template](https://github.com/tabmadi/github-project-template), so it has the same hooks, CI gate, and documentation convention.

## Stack

| Tool | Owns |
| --- | --- |
| [Bun](https://bun.sh) | The runtime, install, and tests |
| [TypeScript](https://www.typescriptlang.org) | The type check |
| [Biome](https://biomejs.dev) | Lint and format |
| [convict](https://github.com/mozilla/node-convict) | Configuration |
| [mise](https://mise.jdx.dev) | Tool versions and tasks |
| [lefthook](https://github.com/evilmartians/lefthook) | Git hooks |
| [cocogitto](https://docs.cocogitto.io) | Conventional Commits checks |
| [rumdl](https://github.com/rvben/rumdl) | Markdown lint |
| [gitleaks](https://github.com/gitleaks/gitleaks) | Secret scan |
| [Renovate](https://docs.renovatebot.com) | Updates to the pinned versions |

## Getting started

1. Install [mise](https://mise.jdx.dev/getting-started.html).
2. Clone the repo and install the tools, dependencies, and hooks:

   ```bash
   git clone git@github.com:tabmadi/ts-template.git
   cd ts-template
   mise install
   mise run setup
   ```

3. Start the server in watch mode, then call it:

   ```bash
   mise run dev
   curl http://localhost:3000/health
   ```

## Tasks

| Task | Does |
| --- | --- |
| `mise run setup` | Installs the locked dependencies and the git hooks |
| `mise run dev` | Runs the app and reloads on change |
| `mise run start` | Runs the app |
| `mise run format` | Applies every formatter |
| `mise run lint` | Runs `lint:ts`, `lint:md`, and `lint:secrets` |
| `mise run test` | Runs the tests |
| `mise run check` | Runs `lint` and `test`. Run it before you finish a change |
| `mise run ci` | Runs exactly what CI runs. The `pre-push` hook runs it too |

## Layout

```text
.
├── src/
│   ├── index.ts      The HTTP server with a /health route
│   ├── config.ts     The configuration schema
│   └── __tests__/    The tests
├── docs/adr/         The decisions: foundations, doc conventions, toolchain
├── biome.json        Lint and format rules
├── tsconfig.json     Compiler settings
├── .mise.toml        Tool pins and tasks
└── .lefthook.yml     Git hooks
```

## Configuration

| Variable | Description | Default |
| --- | --- | --- |
| `PORT` | The port the server binds | `3000` |

## Using this template

1. Create a repository from this template on GitHub.
2. Change `name` in `package.json`.
3. Replace the sample server in `src/` with your own code.
4. Update the contacts in `SECURITY.md` and the copyright line in `LICENSE`.
5. Install the [Renovate app](https://github.com/apps/renovate) on the new repository.

## Decisions

The ADRs in [docs/adr](docs/adr/README.md) record every decision and the reason for it. [ADR-0001](docs/adr/0001-documentation-conventions.md) is the house style for all text.

## Contributing

Follow the [Code of Conduct](CODE_OF_CONDUCT.md). Commit messages follow [Conventional Commits](https://www.conventionalcommits.org), and the `commit-msg` hook checks them. Run `mise run check` before you open a pull request.

## Security

To report a vulnerability, follow [SECURITY.md](SECURITY.md).

## License

Apache License 2.0. See [LICENSE](LICENSE).
