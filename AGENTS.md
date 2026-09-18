# Agent guide

Tool-agnostic guide for any coding agent (Codex, Cursor, Claude Code, or another) working in this repo. `AGENTS.md` is the one standard: an agent either reads it or it does not — the repo carries no per-tool shim files (`CLAUDE.md`, `.cursor/rules/`, etc.). A tool that ignores `AGENTS.md` is a limitation of that tool, not something the repo works around.

## The one rule that outranks this file

**Humans are the first developers. [README.md](README.md) outranks this file.** It is the human-facing description of what this template provides and how to use it. This file holds only agent-specific operational hints: how to navigate, build, and run the repo.

## What this repo is

A TypeScript application template on the Bun runtime, with Biome for lint and format and a strict ESNext `tsconfig`. The sample code is a demonstration seam, not a feature set.

- **Everything here is inherited wholesale** by every project generated from it. A dependency added here is a dependency every generated project carries, so add one only when the template itself needs it.
- Application code lives under `src/`; tests sit beside it in `src/__tests__/`.
- `src/config.ts` is the pattern for configuration: a `convict` schema with defaults and environment variable bindings, validated once at startup. Extend it rather than reading `process.env` from scattered call sites.
- **This repo pins tools with `proto` ([.prototools](.prototools)), not `mise`** — it is the one template in the set that does. Do not migrate it as a side effect of another change.

## Working in the repo

- Tasks are `package.json` scripts, run with `bun run <script>`: `start`, `dev`, `test`, `lint`, `format`. `bun install` installs dependencies and `prepare` installs the git hooks.
- Tools are pinned and installed by `proto`; a shell with proto inactive resolves a bare tool call (`bun`, `biome`, `cog`, …) from `PATH`, at an unpinned version.
- `bun.lock` is committed and authoritative. Change dependencies with `bun add` / `bun remove`, never by hand-editing the lock file.
- Bun runs TypeScript directly — there is no build step and no `dist/`. `bun run dev` watches and reloads.
- Before finishing a change, run `bun run lint`, which is Biome plus `tsc --noEmit`; `bun run format` applies Biome's fixes.

## Conventions

- **Biome is the arbiter** for both lint and format, configured in [biome.json](biome.json). Run `bun run format`; never hand-format to match a preference the formatter will undo.
- **The `tsconfig` is strict on purpose.** Fix the type, do not reach for `any` or `@ts-ignore`; if a cast is genuinely required, narrow it and comment why.
- Use `bun:test` for tests, with one file per module under `src/__tests__/`.
- Prefer named exports and explicit module paths. The project is ESM (`"type": "module"`) — no `require`.

## Commits

- **Conventional Commits, enforced.** `cog verify` runs on `commit-msg` and `cog check` on `pre-push`, so a malformed message is rejected locally before CI sees it.
- Commit messages are a title only — no body, no footer.
- Never push unless asked to.
