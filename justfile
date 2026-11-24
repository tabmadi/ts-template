# Every task, per ADR-0103. A recipe that calls a tool runs only inside the dev shell of flake.nix.

set shell := ["bash", "-euo", "pipefail", "-c"]

import? 'template/justfile'

# List the recipes
default:
    @just --list

# Build the dev shell, install the locked dependencies, and install the git hooks
setup:
    nix develop --command bun install --frozen-lockfile

# Run the app and reload on change
dev: in-shell
    node --watch src/index.ts

# Run the app
start: in-shell
    node src/index.ts

# Write bun.nix again from bun.lock. Run it after each dependency change
bun-nix: in-shell
    bun2nix -o bun.nix
    nixfmt bun.nix

# Run Renovate over this repository, per ADR-0102. The renovate workflow calls it
ci-renovate: in-shell
    nix run --inputs-from . nixpkgs#renovate

# Run the tests on Vitest, per ADR-0110
test *args: in-shell
    node node_modules/vitest/vitest.mjs run {{ args }}

# Biome with warnings as errors, and the TypeScript compiler
lint-ts: in-shell
    biome ci --config-path .config --error-on-warnings .
    bun run tsc --noEmit

# Prose, comments, and ADRs, per ADR-0001
lint-prose: in-shell
    tabkit check

# Markdown structure and formatting, per ADR-0001
lint-md: in-shell
    rumdl check .

# Scan the working tree for committed secrets
lint-secrets: in-shell
    gitleaks dir . --no-banner

# JSON, JSONC, TOML, and YAML format, per ADR-0104
lint-data: in-shell
    dprint check

# Nix format, per ADR-0104
lint-nix: in-shell
    nixfmt --check $(git ls-files '*.nix')

# justfile format, per ADR-0104
lint-just:
    just --fmt --check

# Run every linter
lint: lint-ts lint-prose lint-md lint-secrets lint-data lint-nix lint-just

# Apply every formatter and every safe lint fix
format: in-shell
    biome check --config-path .config --write .
    rumdl check --fix .
    nixfmt $(git ls-files '*.nix')
    dprint fmt
    just --fmt

# The fast gate: run it before you finish a change
check: lint test

# Run exactly what CI runs: every check of flake.nix, in the Nix sandbox
ci:
    nix flake check --print-build-logs

# Push what CI built to the binary cache, per ADR-0101. Without NIX_CACHE_URL it does nothing
cache-push: in-shell
    nix-cache-push

# Write the files that follow a dependency change, per ADR-0102
deps-sync: bun-nix

[private]
in-shell:
    @test -n "${IN_NIX_SHELL:-}" || { echo "Enter the dev shell first: run nix develop, or allow direnv." >&2; exit 1; }
