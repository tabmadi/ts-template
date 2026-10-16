# Agent guide

This guide is for any coding agent that works in this repo. `AGENTS.md` is the one standard, and the repo has no per-tool files such as `CLAUDE.md`.

**Humans are the first developers. The ADRs, `docs/`, and `README.md` rank above this file.** This file holds only operational hints.

## Read first

- [ADR-0000](docs/adr/0000-foundations.md): the layout and the TypeScript conventions.
- [docs/adr/README.md](docs/adr/README.md): the ADR index. To check a convention, grep the `Rules` sections first.

## Write in Simple English

Every text follows the Simple English profile in [ADR-0001](docs/adr/0001-documentation-conventions.md#simple-english): docs, ADRs, comments, commit titles, and task descriptions.

- Use common words. One idea per sentence, at most 25 words.
- In prose, use only period, comma, colon, and the possessive apostrophe. No em dash, semicolon, parentheses, or `?`.
- No emoji, no contractions, and no `e.g.` or `etc.`
- No chronology, intensifiers, hedges, or planned work. State what is true now.

## Working in the repo

- Run every command as `mise run <task>`. A bare `bun` or `biome` call resolves from `PATH` at an unpinned version.
- Biome owns lint and format. Run `mise run format`, and never format by hand.
- Bun runs TypeScript directly. There is no build step.
- The Bun version is in `.mise.toml` and in `packageManager` in `package.json`. Change both together.
- Everything here is inherited by every generated project. Add a dependency only when the template itself needs it.
- Before you finish a change, run `mise run check`.
- Commit messages are a Conventional Commits title only, with no body. Never push unless asked to.
