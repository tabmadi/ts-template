# ADR-0102: Dependency updates

- **Status:** Accepted
- **Decides:** Renovate proposes every update to `flake.lock`, the language lock files, and the GitHub Actions, and the CI gate decides.

## Context

A pin that nobody updates goes stale. A stale pin keeps a known bug or a known vulnerability, and a later update has to cross many versions at once.

An update tool proposes a change. The gate of [ADR-0101](0101-source-control-and-ci.md) decides whether it is safe.

## Decision drivers

1. **Every lock.** The tool updates `flake.lock` and its inputs, the lock of each language, and the GitHub Actions.
2. **Grouping.** Small updates of one kind come in one pull request, so the review load stays low.
3. **Schedule.** Updates arrive at a fixed time, not one by one through the week.
4. **No merge by the tool.** A person or the gate merges.

## Considered options

| Option | 1 Every lock | 2 Grouping | 3 Schedule | Verdict |
| --- | --- | --- | --- | --- |
| By hand, with `nix flake update` | Yes, when someone remembers | Not applicable | No | Rejected. The pins go stale |
| Dependabot | `flake.lock` since April 2026, with no update of pinned references in `flake.nix` and no security updates for Nix | Yes | Yes | Rejected on driver 1 |
| **Renovate** | **The nix manager and the lock file maintenance cover `flake.lock`. It also updates the language locks and the Actions** | **Yes** | **Yes** | **Chosen** |

Sources:

- Dependabot version updates for Nix: [GitHub changelog, 2026-04-07](https://github.blog/changelog/2026-04-07-dependabot-version-updates-now-support-the-nix-ecosystem).
- The nix manager of Renovate: [Renovate docs](https://docs.renovatebot.com/modules/manager/nix/).

## Decision

`.github/renovate.json` turns on the nix manager and the weekly lock file maintenance. Every pull request comes before 6 a.m. on Monday. A major version comes alone. Minor and patch updates of the pinned inputs and the Actions come in one pull request.

Renovate opens each pull request, the CI gate decides, and Renovate merges nothing.

## Consequences

- Renovate needs its GitHub app on the repo. Without it, the pins go stale.
- A failing update stays open until someone fixes the code or closes it.

## Rules

- Renovate proposes every update, and it merges nothing.
- `flake.lock` changes only through Renovate or a commit that passes the gate.
