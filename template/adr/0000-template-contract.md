# TPL-0000: Template contract

- **Status:** Accepted
- **Decides:** Which files are the template and which are the project, how a project is made, and what this template may hold.

## Context

This repo is a template for a TypeScript application on Node.js. A project made from it copies its files, and the copies do not link back. So every sentence in a copied file must stay true in the project. A sentence that names the template or another repo turns false in the copy.

This repo starts from [github-project-template](https://github.com/tabmadi/github-project-template) and adds the TypeScript toolchain. The [blueprints](https://github.com/tabmadi/blueprints) repo keeps the templates of the same size in step.

## Decision

### Two scopes

| Scope | Holds | In a project |
| --- | --- | --- |
| Project | Every file outside `template/`, written in the voice of the project | Copied |
| Template | The `template/` folder: this ADR, the agent hints, and the template checks and outputs | Not copied |

`flake.nix` loads `template/scope.nix` when it exists. That file imports the template module of tabkit and sets its description and welcome text. The module adds the template checks and the `templates` output. A project has no `template/` folder, so it adds nothing.

### Making a project

`nix flake new -t github:tabmadi/ts-template <dir>` copies the project scope. Its welcome text lists the first steps of the new project. The first step renames the package in `package.json`.

GitHub's template button copies every file, `template/` included. In that copy, `just init` prints the same first steps and removes `template/`.

### What this template holds

A dependency added here is a dependency of every project. So the template adds one only when the template itself needs it.

Its project ADRs are listed in [the ADR index](../../docs/adr/README.md).

### The sample service

The sample is one small HTTP service. The Go, Python, and TypeScript templates hold the same service to this spec, each with the standard tools of its language.

| Part | Behavior |
| --- | --- |
| `PORT` | The port. A number from 1 to 65535, and 8080 by default |
| `LOG_LEVEL` | One of `debug`, `info`, `warn`, or `error`, in any case, and `info` by default |
| An unset or empty variable | Takes its default |
| A bad value | The app writes the error to standard error and exits with code 1, before it listens |
| Logs | One JSON object per line on standard output, with `time`, `level`, and `msg`. The app logs `listening` with the port, and `stopped` |
| A request | Logged at the debug level, with the method, the path, and the status |
| `GET /health` | Status 200, with the JSON body `{"status":"ok"}` |
| Every other path | Status 404 |
| SIGINT or SIGTERM | The server stops accepting connections, the open requests finish, and the app exits with code 0 |

The tests cover the defaults, an override, each bad value, `/health`, and a 404. A project replaces the sample with its own code.

## Consequences

The root `README.md` describes the template. A new project rewrites it, and the welcome text says so.

## Rules

- Every file that a project must not inherit lives in `template/`.
- A file outside `template/` never links into it. `(CI: lint-scope)`
- A project doc never names another repo or speaks as the template. `(CI: lint-scope)`
- The template adds a dependency only when the template itself needs it.
- The sample service follows the spec in this ADR, the same in every language. `(CI: test)`
- A change to a shared project ADR starts in github-project-template and goes to every template of the same size in one pass.
