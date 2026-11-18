# ADR-0110: TypeScript

- **Status:** Accepted
- **Decides:** Bun runs, installs, and tests the TypeScript code, Biome lints and formats it, and bun2nix gives the checks the locked dependencies.

## Context

The shared toolchain of [ADR-0100](0100-toolchain.md) holds no language. This ADR adds the tools of TypeScript: the runtime, the linter and the formatter, the test runner, and how Nix gets the dependencies of `bun.lock`.

## Decision drivers

1. **No build step.** The runtime runs TypeScript directly.
2. **Few tools.** One tool for each job, and one tool for several jobs where it can.
3. **Stable.** The tool has a stable release.
4. **Pinned.** The tool comes from `nixpkgs`, and a check gets the locked dependencies without network.

## Considered options

### The runtime, the package manager, and the test runner

| Option | 1 No build step | 2 Few tools | Verdict |
| --- | --- | --- | --- |
| Node.js with npm and Vitest | Type stripping only, with limits on TypeScript syntax | Three tools | Rejected on drivers 1 and 2 |
| Deno | Yes | One tool, with its own module and permission model | Rejected. Most npm packages work, but a project meets the differences of its model |
| **Bun** | **Yes** | **One tool: runtime, install, and `bun:test`** | **Chosen** |

Sources:

- [Bun](https://bun.sh/docs), [Deno](https://docs.deno.com/runtime/), [Node.js TypeScript support](https://nodejs.org/api/typescript.html).

### The linter and the formatter

| Option | 2 Few tools | 3 Stable | Verdict |
| --- | --- | --- | --- |
| ESLint and Prettier | Two tools, two configs, and a graph of plugins | Yes | Rejected on driver 2 |
| oxlint and oxfmt | Two tools | oxlint 1.0 since June 2025. oxfmt is in beta | Rejected on driver 3. It stays the next candidate |
| **Biome** | **One tool and one config** | **Yes** | **Chosen** |

Sources:

- [Biome](https://biomejs.dev/), [Oxlint v1.0 stable](https://oxc.rs/blog/2025-06-10-oxlint-stable), [Oxfmt beta](https://oxc.rs/blog/2026-02-24-oxfmt-beta).

### The dependencies in Nix

| Option | 4 Pinned | Verdict |
| --- | --- | --- |
| A fixed-output derivation that runs `bun install` | One hash for all of `node_modules`. Each dependency change breaks the hash | Rejected. The hash tells nothing about what changed |
| **bun2nix, which writes `bun.nix` from `bun.lock`** | **One hash for each package, read from the lock** | **Chosen** |

Sources:

- [bun2nix](https://github.com/nix-community/bun2nix).

## Decision

Bun runs TypeScript directly. There is no build step and no `dist/`. The dev shell takes `bun` from `nixpkgs`, and `packageManager` in `package.json` names the same version.

Biome is both the linter and the formatter, for TypeScript and JavaScript only. It runs with warnings as errors. dprint keeps JSON, per [ADR-0104](0104-formatters-and-linters.md).

| File type | Formatter |
| --- | --- |
| TypeScript and JavaScript | Biome, with tabs |

Biome reads a config in `.config/` only with `--config-path .config`, and only when the config excludes `.config` from its own files. Without that exclusion, Biome reads the same file again as a nested root config and stops. Biome does not support this layout officially. If a release breaks it, the config moves back to the root.

The `package.json` scripts only call the `just` recipes. A new command is a recipe in `justfile`, not a script.

The checks need the dependencies, and the Nix sandbox has no network. So `bun2nix` writes `bun.nix` from `bun.lock`, and `nixfmt` formats it. A hook fails when `bun.nix` does not match `bun.lock`.

Sources:

- Biome does not support a config in `.config/`: [biomejs/biome#13263](https://github.com/biomejs/biome/issues/13263).

## Consequences

- The Bun version is in two places: the dev shell of `flake.nix` and `packageManager` in `package.json`. A change updates both.
- A dependency change also changes `bun.nix`. `just bun-nix` writes it, and the hook fails until it matches `bun.lock`.
- A Bun release can change behaviour that Node.js defines differently. The tests run on Bun, so they catch it.

## Rules

- A Biome rule is disabled by name with a reason in `.config/biome.json`. `(CI: lint-ts)`
- Every Biome call passes `--config-path .config`, and the config excludes `.config` from its files.
- `bun.nix` matches `bun.lock` in every commit.
- The Bun version of `flake.nix` and `packageManager` in `package.json` are the same.
