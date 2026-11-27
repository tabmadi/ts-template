# Network egress

This guide sets up a developer machine or a server for each egress level of tabkit: `direct`, `proxy`, `internal`, and `airgap`. A platform adds a guide for its cluster.

## Choose the level

| Level | Use it when | What you set up |
| --- | --- | --- |
| `direct` | The machine reaches the internet | Nothing |
| `proxy` | The machine reaches the internet only through an HTTP proxy | The egress file and the daemons |
| `internal` | The machine reaches only internal services | The egress file and the internal mirrors |
| `airgap` | The site has no network to the outside | The internal mirrors, filled from a bundle |

Each level keeps the steps of the level before it.

## The egress file

`/etc/tabkit/egress.env` holds the settings of the machine. The dev shell loads it. The Nix daemon and Docker load it through a systemd drop-in.

```sh
TABKIT_EGRESS=proxy
HTTP_PROXY=http://proxy.example.net:3128
HTTPS_PROXY=http://proxy.example.net:3128
http_proxy=http://proxy.example.net:3128
https_proxy=http://proxy.example.net:3128
NO_PROXY=forge.internal,registry.internal,cache.internal
no_proxy=forge.internal,registry.internal,cache.internal
```

List the internal services of the site in `NO_PROXY`. tabkit adds loopback, the private ranges, and the cluster domains.

A proxy URL with a password stays out of Git. Percent encode its special characters. Set the mode of the file to `0600`.

## Set up a machine with NixOS

Import the module of tabkit and set the level:

```nix
{
  imports = [ tabkit.nixosModules.egress ];
  tabkit.egress = {
    enable = true;
    level = "proxy";
    proxy = "http://proxy.example.net:3128";
    noProxy = [ "forge.internal" "registry.internal" "cache.internal" ];
  };
}
```

The module writes the egress file. It loads the file into the Nix daemon, Docker, and each unit in `units`.

A proxy URL with a password goes into a file outside the Nix store. Name that file in `environmentFile`.

## Set up a machine without NixOS

1. Write `/etc/tabkit/egress.env` as above.
2. Add a drop-in for the Nix daemon and for Docker:

   ```ini
   # /etc/systemd/system/nix-daemon.service.d/tabkit-egress.conf
   # /etc/systemd/system/docker.service.d/tabkit-egress.conf
   [Service]
   EnvironmentFile=-/etc/tabkit/egress.env
   ```

3. Run `sudo systemctl daemon-reload`, then restart `nix-daemon` and `docker`.
4. Enter the dev shell with `nix develop`.

A platform template runs `just egress-setup`. It checks these steps and writes each file that needs root.

## A proxy that inspects TLS

Install the CA of the proxy on each machine. On NixOS, set `caFile` of the module. On another Linux, add the CA to the system store of the distribution. Restart the Nix daemon and Docker after the change.

## The internal level

The machine reads three internal mirrors:

| Mirror | Serves | Set |
| --- | --- | --- |
| A Nix cache, such as the `nix-cache` module of tabkit | Every Nix path, with every language package and Helm chart | `substituters` and `trustedPublicKeys` of the module |
| A registry, such as zot | Every image, under a path of its upstream host | `registryMirror` of the module, or `TABKIT_REGISTRY_MIRROR` in the file |
| A forge, such as Forgejo | The Git repositories and the CI actions | The remote of the repository |

At the `internal` level, the internal caches are the only Nix substituters. Without NixOS, set them in `/etc/nix/nix.conf`:

```text
substituters = https://cache.internal
trusted-public-keys = cache.internal-1:<public key>
```

Use `substituters`, not `extra-substituters`. Then a missing path fails, and Nix never asks the public cache.

## The airgap level

A bundle carries the mirrors across the gap. Make it on a machine with access, and load it inside the site.

On a machine with access, in a clone of the repository:

```sh
nix build .#devShells.x86_64-linux.default
nix copy --to "file://$PWD/bundle/nix?secret-key=/path/to/site.key" .#devShells.x86_64-linux.default
nix flake archive --to "file://$PWD/bundle/nix?secret-key=/path/to/site.key"
git bundle create bundle/repo.bundle --all
```

Inside the site:

```sh
nix copy --from "file://$PWD/bundle/nix" --all
git clone bundle/repo.bundle project
```

The machines of the site trust the public half of `site.key` in `trusted-public-keys`.

A platform template runs `tabkit-ops bundle export` and `tabkit-ops bundle import`. They also carry each image of the platform.

## Services that need the internet

Some tools need the internet for their purpose. At `internal` and `airgap`, they run on the side with access, or the site replaces them.

| Service | At `internal` and `airgap` |
| --- | --- |
| Renovate | Runs on the side with access. Its merged updates go into the next bundle |
| A vulnerability database | An imported snapshot, refreshed with each bundle |
| Public ACME certificates | The site CA |
| Public DNS checks | Run on the side with access only |

## Verify

1. Run `nix develop --command just ci` with a cold store. A cached path can hide a missing mirror.
2. Check the logs of the proxy. Public requests go through it, and internal requests go direct.
3. At `internal` and `airgap`, run `nix config show substituters`. It lists only the internal caches.
