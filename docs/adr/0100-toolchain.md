# ADR-0100: Toolchain

- **Status:** Accepted
- **Decides:** Nix with flakes pins every tool and runs every check, through the shared tabnix module, and the repo follows `nixpkgs-unstable`.

## Context

A tool choice is worth something only when every machine reproduces it. Four failures matter:

1. A tool resolves from `$PATH`, at whatever version the machine has.
2. Two machines have the same tool version, but the tool links against different system libraries.
3. A check runs only in CI, so every local commit passes it.
4. A pin goes stale because nobody updates it.

A repo can also hold more than one language, ship artifacts, or run its own machines.

## Decision drivers

1. **Exact.** One lock pins each tool and every library under it, on every machine and in CI.
2. **One mechanism.** The same tool pins the dev tools, builds the artifacts, and describes the machines.
3. **Same checks everywhere.** A check runs the same way on a laptop and in CI, from the files that git tracks.
4. **Native.** Linux runs the tools directly, with no container or VM in the daily loop.
5. **Packages.** The package set holds the tools of every language that a project can use.

## Considered options

### The environment

| Option | 1 Exact | 2 One mechanism | 3 Same checks | 4 Native | 5 Packages | Verdict |
| --- | --- | --- | --- | --- | --- | --- |
| A version manager, such as mise or asdf | Versions only. A tool links against the libraries of the machine | Tools only | No sandbox | Yes | Yes | Rejected on driver 1 |
| Dev Containers | Only when the image is built from pins | Tools only | Yes | A container in the daily loop and in the editor | Yes | Rejected on drivers 2 and 4 |
| devbox, Flox, or devenv | Yes, through Nix | Nix underneath, behind a second config | Partly | Yes | The Nix set | Rejected. Each adds a layer with its own config on top of Nix |
| pixi | Yes, through conda-forge | Tools and environments, no machines | No sandbox | Yes | conda-forge | Rejected on drivers 2 and 3 |
| Guix | Yes | Yes | Yes | Linux only | Smaller than the Nix set | Rejected on drivers 4 and 5 |
| **Nix with flakes** | **Yes** | **Packages, images, and machines** | **`nix flake check` in the sandbox** | **Yes** | **The largest set** | **Chosen** |

Sources:

- devbox, Flox, and devenv build on Nix: [devenv](https://devenv.sh/), [Flox](https://flox.dev/), [devbox](https://www.jetify.com/devbox).
- pixi builds on conda-forge: [pixi.sh](https://pixi.sh/).
- The size of each package set: [Repology statistics](https://repology.org/repositories/statistics).

### Flakes

Upstream Nix still marks flakes as experimental, with no date to change that. Determinate Nix treats them as stable. In the 2025 community survey, 78.9 percent of the users of an experimental feature use flakes. A flake gives one lock file and one entry point for checks, so this repo uses flakes, and any Nix with flakes enabled runs it.

Sources:

- The status upstream: [LWN, October 2026](https://lwn.net/Articles/1094226/).
- The position of Determinate Systems: [Experimental does not mean unstable](https://determinate.systems/blog/experimental-does-not-mean-unstable).
- The survey: [Discussion of flakes, from the 2025 NixOS Community Survey Report](https://discourse.nixos.org/t/discussion-of-flakes-from-2025-nixos-community-survey-report/78853).

### The shape of the flake and the shared code

| Option | Merges outputs without glue code | Shares code across repos | Verdict |
| --- | --- | --- | --- |
| A plain flake | No. Each output is written for each system | Only by copy | Rejected |
| flake-utils | It loops over systems only | Only by copy | Rejected |
| A copy of the shared Nix code in each repo | Not applicable | A copy drifts, and a fix reaches no other repo | Rejected |
| **flake-parts, with the tabnix module pinned by a tag** | **Yes, a module system** | **Yes. A fix reaches each repo with a new tag** | **Chosen** |

Sources:

- [flake-parts](https://flake.parts/) and [flake-utils](https://github.com/numtide/flake-utils).

### The channel

| Option | Current tools | Fixes without a release upgrade | Verdict |
| --- | --- | --- | --- |
| The stable release, such as `nixos-26.05` | The versions of the release, older for its six months | Security fixes only | Rejected for dev tools. A machine of NixOS follows a stable release |
| **`nixpkgs-unstable`** | **Yes** | **Every fix, through the lock** | **Chosen. The lock keeps it exact, and the gate decides each update** |

## Decision

`flake.nix` imports the tabnix module, which holds the shared dev shell, git hooks, and checks. The repo adds only its own tools. `flake.lock` pins `nixpkgs` and every other input, so every engineer, CI run, and machine gets the same tools.

`nixpkgs` follows `nixpkgs-unstable`. A repo selects a major line by attribute, and the lock fixes the patch version. A version that `nixpkgs` does not have comes from an overlay in `flake.nix`.

An engineer enters the dev shell with `nix develop`, or with direnv through `.envrc`.

Every check is a derivation under `checks` in `flake.nix`. `nix flake check` builds each one in the Nix sandbox from the files that git tracks. So a local change that git does not track cannot make a check pass.

A repo uses the layers of Nix that its kind needs:

| Kind of repo | Builds its artifacts with Nix | Declares its machines with NixOS |
| --- | --- | --- |
| A library or a tool with no deploy | Not applicable | Not applicable |
| An app that a managed provider runs | When the provider takes an image | No. The provider runs the machine |
| An app on its own machines, with no orchestrator | Yes | Yes |
| An app on an orchestrator | Yes | Only the hosts outside the cluster |

## Consequences

- Every engineer runs Linux, on x86-64 or ARM, and installs Nix with flakes. Linux is the one supported platform, as Zed is the one supported editor. A person on macOS or WSL owns any gap.
- The first `nix develop` downloads every tool. Each later run reuses the store.
- CI downloads every tool on each run unless the workflow has a binary cache.
- A change to a shared hook or check reaches the repo only when the tabnix input moves to a new tag.
- A tool update from `nixpkgs-unstable` can fail the gate. The lock keeps the old version until the update passes.
- Replacing tabnix takes a new ADR and a `flake.nix` without the import.

## Rules

- Linux, on x86-64 and ARM, is the one supported platform. No file works around another one.
- Every tool comes from the dev shell of `flake.nix`, never from a second version manager.
- `flake.lock` is committed. Renovate updates it, and the CI gate decides.
- Every check is a derivation under `checks` in `flake.nix`. `(CI: ci)`
- The shared Nix code comes from the tabnix module at a tag, never from a copy.
