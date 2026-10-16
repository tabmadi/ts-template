# ADR-0000: Foundations

**Status:** Accepted
**Decides:** What this repo is, its layout, its TypeScript conventions, and the ADR process itself.

## Context

A TypeScript project starts with the same choices every time: the runtime, the package manager, the linter and formatter, the compiler settings, and the test runner. Each has several popular answers, and a mix of them costs a build step and several config files. A template makes these choices once, so a new project starts at its first feature.

## Decision

This repo is a TypeScript application template on the Bun runtime. It starts from [github-project-template](https://github.com/tabmadi/github-project-template) and adds the TypeScript toolchain. The sample code shows the structure. It is not a feature set.

| Path | Holds |
| --- | --- |
| `src/` | The application code |
| `src/__tests__/` | The tests, one file for each module |
| `src/config.ts` | The configuration: a `convict` schema with defaults and environment variable bindings |
| `bun.lock` | The locked dependency set. It is committed |

**Bun runs TypeScript directly.** There is no build step and no `dist/`.

**Configuration is read in one place.** `src/config.ts` validates the configuration once at startup. No other module reads `process.env`.

**The `tsconfig` is strict.** A type error is fixed, not silenced.

**Every decision is an ADR.** An ADR states what is true of the repo. It is law, not a plan. Planned work lives in an untracked `*.local.md` file.

## Consequences

A dependency added here is a dependency of every generated project. So the template adds one only when the template itself needs it.

The Bun version is in two places: `.mise.toml` and `packageManager` in `package.json`. A change updates both.

A generated project inherits these ADRs. So an ADR is written for the engineer who maintains the project. Selection guidance belongs in the root `README.md`.

## Rules

- Application code lives under `src/`. Tests live under `src/__tests__/` and use `bun:test`.
- Only `src/config.ts` reads environment variables.
- Dependencies change through `bun add` and `bun remove`. `bun.lock` is never edited by hand.
- No `any` and no `@ts-ignore`. A required cast is narrowed and carries a comment. `(CI: lint:ts)`
- The project is ESM. Exports are named, and no file uses `require`.
- A `biome-ignore` names one rule and gives a reason. `(CI: lint:ts)`
- Every ADR carries a `Status`, a one-sentence `Decides` line, and a flat `Rules` section.
- Planned work lives in an untracked `*.local.md` file. No committed file links to one.
