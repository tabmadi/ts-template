# ADR-0105: Editor

- **Status:** Accepted
- **Decides:** Zed is the supported editor, with committed project settings, and no check depends on an editor.

## Context

An editor formats on save and runs language servers. When its formatter or its server differs from the tools of the repo, a saved file differs from the result of `just format`.

A repo can support one editor fully and still let every engineer use another one.

## Decision drivers

1. **The dev shell.** The editor uses the tools of the dev shell of [ADR-0100](0100-toolchain.md), with no extra setup.
2. **Project settings.** The settings of the project are plain files in the repo, apart from the settings of the person.
3. **Open.** The editor is open source.
4. **One setup.** One committed setup fits every engineer.

## Considered options

| Option | 1 The dev shell | 2 Project settings | 3 Open | 4 One setup | Verdict |
| --- | --- | --- | --- | --- | --- |
| VS Code | Through a direnv extension | `.vscode/` mixes the project and the person | The core is open, the build and the store are not | Yes | Rejected on drivers 1 and 2 |
| A JetBrains IDE | Through a plugin | Project files hold personal state | No | Yes | Rejected on drivers 2 and 3 |
| Neovim or Helix | Yes | Yes | Yes | No. Each engineer builds a different setup | Rejected on driver 4 |
| **Zed** | **Through direnv, with no plugin** | **Plain files in `.zed/`** | **Yes** | **Yes** | **Chosen** |

Sources:

- Zed loads the environment of direnv: [Zed docs, environment](https://zed.dev/docs/environment).
- [Zed is open source](https://github.com/zed-industries/zed).

## Decision

`.zed/settings.json` formats on save only with the formatters of the repo, so Zed and `just format` agree. It selects the language servers from the dev shell. It also holds the typing rules: two spaces, a final newline, and no trailing whitespace outside Markdown. `.zed/tasks.json` runs the `just` recipes.

Other editors use the same dev shell with no committed config. `just format` fixes what they get wrong.

## Consequences

- Zed needs direnv, and nix-direnv for a fast reload. Each engineer allows `.envrc` once.
- After a change to `flake.nix`, Zed loads the new tools only when the folder opens again.

## Rules

- The editor formats only with the formatters of the repo. No check depends on the editor.
- `.zed/` holds only settings of the project, never settings of a person.
