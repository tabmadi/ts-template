# TPL-0000: Template contract

- **Status:** Accepted
- **Decides:** Which files are the template and which are the project, how a project is made, and what this template may hold.

## Context

This repo is a template for a TypeScript application on Bun. A project made from it copies its files, and the copies do not link back. So every sentence in a copied file must stay true in the project. A sentence that names the template or another repo turns false in the copy.

This repo starts from [github-project-template](https://github.com/tabmadi/github-project-template) and adds the TypeScript toolchain. The [blueprints](https://github.com/tabmadi/blueprints) repo keeps the templates of the same size in step.

## Decision

### Two scopes

| Scope | Holds | In a project |
| --- | --- | --- |
| Project | Every file outside `template/`, written in the voice of the project | Copied |
| Template | The `template/` folder: this ADR, the agent hints, and the template checks and outputs | Not copied |

`flake.nix` loads `template/scope.nix` when it exists. That file adds the template checks and the `templates` output. A project has no `template/` folder, so it adds nothing.

### Making a project

`nix flake new -t github:tabmadi/ts-template <dir>` copies the project scope. Its welcome text lists the first steps of the new project. The first step renames the package in `package.json`.

GitHub's template button copies every file, `template/` included. In that copy, `just init` prints the same first steps and removes `template/`.

### What this template holds

The sample code shows the structure, not a feature set. A project replaces the sample server in `src/` with its own code.

A dependency added here is a dependency of every project. So the template adds one only when the template itself needs it.

Its project ADRs are listed in [the ADR index](../../docs/adr/README.md).

## Consequences

The root `README.md` describes the template. A new project rewrites it, and the welcome text says so.

## Rules

- Every file that a project must not inherit lives in `template/`.
- A file outside `template/` never links into it. `(CI: lint-scope)`
- A project doc never names another repo or speaks as the template. `(CI: lint-scope)`
- The template adds a dependency only when the template itself needs it.
- A change to a shared project ADR starts in github-project-template and goes to every template of the same size in one pass.
