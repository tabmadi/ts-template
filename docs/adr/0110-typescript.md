# ADR-0110: TypeScript

- **Status:** Accepted
- **Decides:** Node.js runs and tests the TypeScript code, Bun only installs, Biome lints and formats it, and bun2nix gives the checks the locked dependencies.

## Context

The shared toolchain of [ADR-0100](0100-toolchain.md) holds no language. This ADR adds the tools of TypeScript: the runtime, the package manager and the test runner, the linter and the formatter, and how Nix gets the dependencies of `bun.lock`.

## Decision drivers

1. **No build step.** The runtime runs TypeScript directly.
2. **Complete runtime.** The runtime implements the standard modules that a server needs, including TLS.
3. **Fast loop.** Install and tests take seconds.
4. **Stable.** The tool has a stable release.
5. **Pinned.** The tool comes from `nixpkgs`, and a check gets the locked dependencies without network.

## Considered options

### The runtime

| Option | 1 No build step | 2 Complete runtime | Verdict |
| --- | --- | --- | --- |
| Bun | Yes | No. A Bun HTTPS server does not expose the client certificate of a request | Rejected on driver 2 |
| Deno | Yes | Yes | Rejected. Nix has no mature builder for `deno.lock` |
| **Node.js 26, the Active LTS line since October 2026** | **Yes. It strips the types, so the code uses only erasable syntax** | **Yes** | **Chosen** |

Sources:

- [Node.js TypeScript support](https://nodejs.org/api/typescript.html), [Bun](https://bun.sh/docs).
- Nix tools for Deno are community projects, and the builder of `nixpkgs` was reverted once: [Packaging Deno applications](https://discourse.nixos.org/t/packaging-deno-applications/15441).

### The package manager and the test runner

| Option | 3 Fast loop | Verdict |
| --- | --- | --- |
| npm or pnpm, with Vitest | Slower install | Rejected on driver 3 |
| Bun, with `bun:test` | Yes | Rejected. Tests would run on another runtime than the app |
| **Bun as the installer, with Vitest on Node.js** | **Yes** | **Chosen. Tests run on the runtime of the app** |

Sources:

- [Bun install](https://bun.sh/docs/cli/install), [Vitest](https://vitest.dev/guide/).

### The linter and the formatter

| Option | 4 Stable | Verdict |
| --- | --- | --- |
| ESLint and Prettier | Yes, but two tools, two configs, and a graph of plugins | Rejected. One tool covers both jobs |
| oxlint and oxfmt | oxlint 1.0 since June 2025. oxfmt is in beta | Rejected on driver 4 |
| **Biome** | **Yes** | **Chosen** |

Sources:

- [Biome](https://biomejs.dev/), [Oxlint v1.0 stable](https://oxc.rs/blog/2025-06-10-oxlint-stable), [Oxfmt beta](https://oxc.rs/blog/2026-02-24-oxfmt-beta).

### The dependencies in Nix

| Option | 5 Pinned | Verdict |
| --- | --- | --- |
| A fixed-output derivation that runs `bun install` | One hash for all of `node_modules` | Rejected. The hash tells nothing about what changed |
| **bun2nix, which writes `bun.nix` from `bun.lock`** | **One hash for each package** | **Chosen** |

Sources:

- [bun2nix](https://github.com/nix-community/bun2nix).

## Decision

Node.js runs TypeScript directly. It strips the types, so there is no build step and no `dist/`. The code uses only syntax that Node.js can strip, and `erasableSyntaxOnly` in `tsconfig.json` makes `tsc` enforce it. Vitest runs the tests on Node.js, with at most two workers. Bun only installs the dependencies.

The dev shell takes Bun from tabkit and `nodejs_26` from `nixpkgs`. `packageManager` in `package.json` names the same Bun version.

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

- `enum`, `namespace`, and parameter properties are not available. A union of string literals or a plain object replaces each.
- The Bun version is in two places: the dev shell of `flake.nix` and `packageManager` in `package.json`. A change updates both.
- Vitest uses more memory than `bun:test`. The limit of two workers keeps the suite small.
- A dependency change also changes `bun.nix`. `just bun-nix` writes it, and the hook fails until it matches `bun.lock`.

## Rules

- Node.js runs the app and the tests. Bun only installs.
- The code uses only TypeScript syntax that Node.js can strip. `(CI: lint-ts)`
- Vitest runs with at most two workers.
- A Biome rule is disabled by name with a reason in `.config/biome.json`. `(CI: lint-ts)`
- Every Biome call passes `--config-path .config`, and the config excludes `.config` from its files.
- `bun.nix` matches `bun.lock` in every commit.
- The Bun version of `flake.nix` and `packageManager` in `package.json` are the same. `(CI: ci)`
