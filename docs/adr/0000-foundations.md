# ADR-0000: Foundations

- **Status:** Accepted
- **Decides:** What this repo is, its layout, its TypeScript conventions, the recipe contract, the shape of an ADR and how it compares options, and the license.

## Context

A TypeScript project makes the same choices every time: the runtime, the package manager, the linter and formatter, the compiler settings, and the test runner. Each has several popular answers, and a mix of them costs a build step and several config files. This repo writes the choices down once, so each change starts at the feature.

A repo without written decisions loses the reason for each choice. The next engineer removes a check that has a reason, or adds a second tool for a job that one tool already does.

A decision is also only as good as its comparison. A choice that names no rejected option cannot be checked, and nobody can tell when the reason stops being true.

A repo also needs fixed entry points. An engineer or a coding agent that knows the name of the gate runs it without reading every file first.

## Decision drivers

1. **Checkable.** A reader can verify why an option won, and can tell when the reason no longer holds.
2. **Greppable.** One search finds every rule of the repo.
3. **Small.** A short ADR gets read. An ADR is not a design document.
4. **Replaceable.** One decision changes without a rewrite of the others.

## Considered options

### The shape of an ADR

| Option | 1 Checkable | 2 Greppable | 3 Small | 4 Replaceable | Verdict |
| --- | --- | --- | --- | --- | --- |
| Nygard: Context, Decision, Status, and Consequences | No section for rejected options | No rule list | Yes | One decision per record | Rejected. It records the outcome, not the comparison |
| MADR 4: drivers, considered options, and their pros and cons | Yes | No rule list | Optional parts grow it | One decision per record | Rejected as a whole. Its drivers and considered options are taken |
| Y-statements: one sentence per decision | Names one rejected option | No | Yes | Yes | Rejected. One sentence holds no comparison of several options |
| Design documents, such as RFCs | Yes | No | No | No | Rejected. A design document is a plan, and it goes stale after the change |
| **Nygard with MADR drivers and options, plus a `Rules` list** | **Yes** | **Yes** | **Optional sections stay out** | **Yes** | **Chosen** |

Sources:

- Nygard's format: [Documenting architecture decisions](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions).
- MADR 4.0 with decision drivers and considered options: [adr.github.io/madr](https://adr.github.io/madr/).
- Y-statements and the other ADR templates: [adr.github.io/adr-templates](https://adr.github.io/adr-templates/).

### The license

| Option | Use in closed code | Patent grant | Copyleft | Verdict |
| --- | --- | --- | --- | --- |
| MIT | Yes | No express grant | No | Rejected. No patent grant |
| MPL-2.0 | Yes | Yes | On each changed file | Rejected. File copyleft adds a duty to every project that changes a file |
| GPL-3.0 or AGPL-3.0 | No | Yes | On the whole work | Rejected. A project of any license must be able to start here |
| **Apache-2.0** | **Yes** | **Yes** | **No** | **Chosen** |

Sources:

- The terms of each license: [choosealicense.com](https://choosealicense.com/licenses/).

## Decision

This repo is a TypeScript application on the Bun runtime.

| Path | Holds |
| --- | --- |
| `src/` | The application code |
| `src/__tests__/` | The tests, one file for each module |
| `src/config.ts` | The configuration: a `convict` schema with defaults and environment variable bindings |
| `bun.lock` | The locked dependency set |
| `bun.nix` | The same set for Nix, written from `bun.lock`, per [ADR-0110](0110-typescript.md) |

**Bun runs TypeScript directly.** There is no build step and no `dist/`.

**Configuration is read in one place.** `src/config.ts` validates the configuration once at startup. No other module reads `process.env`.

**The `tsconfig` is strict.** A type error is fixed, not silenced.

**The recipe names are a contract.** The recipes `setup`, `format`, `lint`, `test`, `check`, and `ci` always exist, per [ADR-0103](0103-tasks.md). Their names do not change.

**Every decision is an ADR, one decision per ADR.** An ADR states a rule as true now. A gap between an ADR and the code is a defect in the code.

**An ADR has a fixed shape.** It has a `Status` and a one-sentence `Decides` line. Its sections are `Context`, `Decision drivers`, `Considered options`, `Decision`, `Consequences`, and `Rules`. `_template.md` holds the shape.

**An ADR compares its options in a table.** Each column is a numbered decision driver, and the last column is the verdict. The chosen option is in bold. An ADR with no real alternative says so in one sentence instead of a table.

**A claim cites its source.** A list of sources follows each table, with a link to the page that states each claim. A claim without a source is reasoning, and the reader can weigh it as such.

**The `Rules` section is a flat list,** so a grep over all ADRs finds every convention.

**The number of an ADR names its topic.** A number has the same topic in every repo that uses the convention, so a reader moves between repos without a lookup.

| Numbers | Topic | Owner |
| --- | --- | --- |
| 0000 and 0001 | Foundations and documentation | Every repo |
| 0100 to 0109 | The shared toolchain: environment, source control and CI, dependency updates, tasks, formatters and linters, and the editor | Every repo, with the same number for the same topic |
| 0110 to 0199 | The toolchain of this repo only, such as the tools of its language | This repo |
| 0200 and up | Delivery, data, and the product | This repo |

**Inside this repo, an ADR links only to other ADRs and to its sources.** A README or a guide moves, and the ADR outlives it.

**The code is under the Apache License 2.0,** in `LICENSE`.

## Consequences

An ADR is for the engineer who maintains the repo. The root `README.md` helps a reader choose the repo and start.

A source can change after the ADR cites it. A reader who finds that a cited fact is no longer true reopens the decision.

## Rules

- Application code lives under `src/`. Tests live under `src/__tests__/` and use `bun:test`.
- Only `src/config.ts` reads environment variables.
- Dependencies change through `bun add` and `bun remove`, and `just bun-nix` writes `bun.nix` in the same change. Neither lock file is edited by hand.
- No `any` and no `@ts-ignore`. A required cast is narrowed and carries a comment. `(CI: lint-ts)`
- The project is ESM. Exports are named, and no file uses `require`.
- A `biome-ignore` names one rule and gives a reason. `(CI: lint-ts)`
- Every ADR has a `Status`, a one-sentence `Decides` line, and the sections of `_template.md`.
- One ADR settles one decision.
- An ADR of the shared toolchain has a number from 0100 to 0109. An ADR of the own toolchain of a repo starts at 0110.
- An ADR compares its options in a table with one column per decision driver, or says in one sentence why no alternative exists.
- A claim in a comparison links to its source, or it is reasoning.
- Inside this repo, an ADR links only to other ADRs and to its sources.
- The recipes `setup`, `format`, `lint`, `test`, `check`, and `ci` exist, and their names do not change.
