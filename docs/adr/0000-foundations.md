# ADR-0000: Foundations

- **Status:** Accepted
- **Decides:** What this repo is, its layout, its TypeScript conventions, the recipe contract, and how ADRs work.

## Context

A TypeScript project makes the same choices every time: the runtime, the package manager, the linter and formatter, the compiler settings, and the test runner. Each has several popular answers, and a mix of them costs a build step and several config files. This repo writes the choices down once, so each change starts at the feature.

A repo without written decisions loses the reason for each choice. The next engineer removes a check that has a reason, or adds a second tool for a job that one tool already does.

A repo also needs fixed entry points. An engineer or a coding agent that knows the name of the gate runs it without reading every file first.

## Decision

This repo is a TypeScript application on the Bun runtime.

| Path | Holds |
| --- | --- |
| `src/` | The application code |
| `src/__tests__/` | The tests, one file for each module |
| `src/config.ts` | The configuration: a `convict` schema with defaults and environment variable bindings |
| `bun.lock` | The locked dependency set |
| `bun.nix` | The same set for Nix, written from `bun.lock`, per [ADR-0100](0100-toolchain.md) |

**Bun runs TypeScript directly.** There is no build step and no `dist/`.

**Configuration is read in one place.** `src/config.ts` validates the configuration once at startup. No other module reads `process.env`.

**The `tsconfig` is strict.** A type error is fixed, not silenced.

**The recipe names are a contract.** The recipes `setup`, `format`, `lint`, `test`, `check`, and `ci` always exist, per [ADR-0100](0100-toolchain.md). Their names do not change.

**Every decision is an ADR.** An ADR states a rule as true now. A gap between an ADR and the code is a defect in the code.

**An ADR has a fixed shape.** It has a `Status`, a one-sentence `Decides` line, and the sections `Context`, `Decision`, `Consequences`, and `Rules`. The `Rules` section is a flat list, so a grep over all ADRs finds every convention.

**Inside this repo, an ADR links only to other ADRs.** A README or a guide moves, and the ADR outlives it. A link to a published standard is allowed.

## Consequences

An ADR is for the engineer who maintains the repo. The root `README.md` helps a reader choose the repo and start.

The Bun version is in two places: the dev shell of `flake.nix` and `packageManager` in `package.json`. A change updates both.

## Rules

- Application code lives under `src/`. Tests live under `src/__tests__/` and use `bun:test`.
- Only `src/config.ts` reads environment variables.
- Dependencies change through `bun add` and `bun remove`, and `just bun-nix` writes `bun.nix` in the same change. Neither lock file is edited by hand.
- No `any` and no `@ts-ignore`. A required cast is narrowed and carries a comment. `(CI: lint-ts)`
- The project is ESM. Exports are named, and no file uses `require`.
- A `biome-ignore` names one rule and gives a reason. `(CI: lint-ts)`
- Every ADR has a `Status`, a one-sentence `Decides` line, and a flat `Rules` section.
- Inside this repo, an ADR links only to other ADRs.
- The recipes `setup`, `format`, `lint`, `test`, `check`, and `ci` exist, and their names do not change.
