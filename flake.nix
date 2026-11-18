# The toolchain, the git hooks, and the checks, per ADR-0100. The tabnix module holds every shared
# part, and this file adds the TypeScript parts.
{
  description = "A TypeScript application on Bun with Biome and a strict tsconfig";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    flake-parts = {
      url = "github:hercules-ci/flake-parts";
      inputs.nixpkgs-lib.follows = "nixpkgs";
    };
    # A new version is a new tag here.
    tabnix = {
      url = "github:tabmadi/tabnix/v0.2.0";
      inputs.nixpkgs.follows = "nixpkgs";
      inputs.flake-parts.follows = "flake-parts";
    };
    # bun.nix lists every package of bun.lock, so a check installs them without network.
    bun2nix = {
      url = "github:nix-community/bun2nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs =
    inputs@{ flake-parts, tabnix, ... }:
    flake-parts.lib.mkFlake { inherit inputs; } {
      # The template scope adds its own checks and outputs. A copy has no template/ folder, so it adds nothing.
      imports = [
        tabnix.flakeModules.default
      ]
      ++ inputs.nixpkgs.lib.optional (builtins.pathExists ./template/scope.nix) ./template/scope.nix;

      perSystem =
        { pkgs, inputs', ... }:
        let
          bun2nix = inputs'.bun2nix.packages.default;
          # Biome finds its config in .config/ only through this flag, per ADR-0100.
          biomeConfig = "--config-path .config";

          # A check runs on the tracked files with the locked node_modules of bun.lock.
          bunCheck =
            name: command:
            pkgs.stdenv.mkDerivation {
              inherit name;
              src = ./.;
              nativeBuildInputs = [
                bun2nix.hook
                pkgs.biome
              ];
              bunDeps = bun2nix.fetchBunDeps { bunNix = ./bun.nix; };
              dontUseBunBuild = true;
              dontUseBunCheck = true;
              dontUseBunInstall = true;
              dontRunLifecycleScripts = true;
              buildPhase = ''
                export HOME=$TMPDIR
                ${command}
              '';
              installPhase = "touch $out";
            };
        in
        {
          tabnix.packages = [
            pkgs.bun
            pkgs.biome
            pkgs.typescript-language-server
            bun2nix
          ];

          # A fix stops the commit, so the engineer reviews the change and stages it.
          tabnix.hooks.biome = {
            name = "biome";
            entry = "${pkgs.biome}/bin/biome check ${biomeConfig} --write --error-on-warnings --no-errors-on-unmatched";
            files = "\\.(ts|tsx|js|jsx)$";
          };

          # bun.nix follows bun.lock, so a dependency change cannot miss it.
          tabnix.hooks.bun-nix = {
            name = "bun2nix";
            entry = "${pkgs.writeShellScript "bun-nix-check" ''
              ${bun2nix}/bin/bun2nix -o bun.nix
              ${pkgs.nixfmt}/bin/nixfmt bun.nix
              git diff --exit-code -- bun.nix
            ''}";
            files = "(^|/)(bun\\.lock|bun\\.nix)$";
            pass_filenames = false;
          };

          checks.lint-ts = bunCheck "lint-ts" ''
            biome ci ${biomeConfig} --error-on-warnings .
            bun run tsc --noEmit
          '';
          checks.test = bunCheck "test" "bun test";
        };
    };
}
