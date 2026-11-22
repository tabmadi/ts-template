# ADR-0104: Formatters and linters

- **Status:** Accepted
- **Decides:** One formatter for each tracked file type, each with a check, and every tool config in `.config/`.

## Context

Two formatters for one file type undo each other's changes. A formatter with no check lets an unformatted file reach the history. A config file at the root hides the files that a person reads.

## Decision drivers

1. **One per type.** Each tracked file type has exactly one formatter.
2. **Checked.** Each formatter has a check in `flake.nix`.
3. **Few tools.** One tool for several file types wins over one tool for each.
4. **No runtime.** A single binary wins over a tool that needs Node.js or Python.
5. **Config in `.config/`.** The tool reads its config from `.config/`, by itself or through a flag.

## Considered options

### JSON, JSONC, TOML, and YAML

| Option | 3 Few tools | 4 No runtime | 5 `.config/` | Verdict |
| --- | --- | --- | --- | --- |
| Biome, Taplo, and yamlfmt | Three tools and three configs | Yes | Biome only through a flag, which it does not support | Rejected on driver 3 |
| Prettier | One tool | Needs Node.js | Yes | Rejected on driver 4 |
| **dprint with its plugins** | **One tool and one config** | **Yes, with WebAssembly plugins from `nixpkgs`** | **Through the wrapper in tabkit** | **Chosen** |

Sources:

- [dprint](https://dprint.dev/plugins/), [Prettier](https://prettier.io/).
- Biome does not support a config in `.config/`: [biomejs/biome#13263](https://github.com/biomejs/biome/issues/13263).

### Markdown

| Option | Lints and formats | 4 No runtime | Maturity | Verdict |
| --- | --- | --- | --- | --- |
| markdownlint-cli2 | Lints, with some fixes | Needs Node.js | Mature, with the reference rule set | Rejected on driver 4 |
| mdformat | Formats only | Needs Python | Mature | Rejected on driver 4 |
| **rumdl** | **Both, with the 53 rules of markdownlint and more** | **Yes** | **Before 1.0, with frequent releases** | **Chosen. It also reads the config of markdownlint, so a move back to markdownlint-cli2 is cheap** |

Sources:

- [rumdl](https://github.com/rvben/rumdl), and its own [comparison with markdownlint](https://rumdl-docs.pages.dev/markdownlint-comparison/).
- [markdownlint-cli2](https://github.com/DavidAnson/markdownlint-cli2).

### Nix

nixfmt is the official formatter of Nix, per RFC 166, and `nixpkgs` enforces it. Its first stable release is 1.0.0. No alternative has that standing, so this repo uses nixfmt.

Sources:

- [RFC 166](https://github.com/NixOS/rfcs/pull/166), [nixfmt](https://github.com/NixOS/nixfmt).

### Workflows

| Option | Finds event text in a `run` script | Noise on a thin workflow | Verdict |
| --- | --- | --- | --- |
| zizmor | Yes | Many audits outside this rule | Rejected. Its other audits are a separate decision |
| **actionlint** | **Yes** | **None on this repo** | **Chosen. The `lint-workflows` check of tabkit runs it** |

Sources:

- [actionlint](https://github.com/rhysd/actionlint), [zizmor](https://docs.zizmor.sh/).

### Custom rules

An ADR can state a rule that no language linter holds, such as a rule across two files.

| Option | Holds a rule across files | Code in this repo | Replaceable | Verdict |
| --- | --- | --- | --- | --- |
| Review only | Not enforced | None | Yes | Rejected. A rule that can be checked is checked |
| A script for each rule | Yes | One script for each rule, and each repo keeps a copy | Yes | Rejected. The copies drift |
| Semgrep or ast-grep rules | One file at a time | A rule file for each rule | Yes | A repo uses one where a single-file pattern holds the rule |
| **tabkit** | **Yes** | **Only `.config/tabkit.toml`** | **Yes. A change to this ADR replaces it** | **Chosen** |

Sources:

- [Semgrep](https://semgrep.dev/docs/), [ast-grep](https://ast-grep.github.io/).

## Decision

| File type | Formatter |
| --- | --- |
| Markdown | `rumdl` |
| Nix | `nixfmt` |
| JSON, JSONC, TOML, and YAML | dprint |
| `justfile` | `just --fmt` |

Each formatter uses two spaces and LF line endings. The repo has no `.editorconfig`: the formatters and their checks are the only rules. `just format` runs every formatter, and a check in `flake.nix` fails on a file that is not formatted. A language repo adds the formatter of its language.

A file that a person reads or runs stays visible at the root: `README.md`, `LICENSE`, `AGENTS.md`, `flake.nix`, and `justfile`. A file that only a tool reads is hidden, with a dot name or in a dot folder.

Every tool config lives in `.config/`. A file that its tool reads only at the root stays there: `.envrc`, `.gitignore`, and `.gitattributes`.

| Tool | How it finds its config in `.config/` |
| --- | --- |
| rumdl | By itself |
| gitleaks | An environment variable that tabkit sets |
| cog | `--config` in every recipe, hook, and workflow |
| dprint | The wrapper in tabkit |
| tabkit | By itself |

The `just` recipes are the only supported way to run a tool. A tool that someone runs by hand without its flag is outside this contract.

## Consequences

- dprint takes its config and plugins only as flags, so tabkit wraps the `dprint` command to add both.
- A rule that tabkit enforces is turned off or reconfigured in `.config/tabkit.toml` in the same commit as the change to its ADR.
- A tool that reads its config only at the root breaks the layout. Such a tool keeps its config at the root, and the ADR of its language names the exception.

## Rules

- A change to an ADR whose rule tabkit enforces also changes `.config/tabkit.toml` in the same commit.
- Every tracked text format has one formatter in the dev shell and a check in `flake.nix`. `(CI: ci)`
- A file that a person reads or runs is visible at the root. Every tool config lives in `.config/`, unless its tool reads it only at the root.
