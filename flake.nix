# The toolchain, the git hooks, and the checks, per ADR-0100 and ADR-0110. The tabnix module holds every shared
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
      url = "github:tabmadi/tabnix/v0.5.0";
      inputs.nixpkgs.follows = "nixpkgs";
      inputs.flake-parts.follows = "flake-parts";
    };
  };

  outputs =
    inputs@{ flake-parts, tabnix, ... }:
    flake-parts.lib.mkFlake { inherit inputs; } {
      # The template scope adds its own checks and outputs. A copy has no template/ folder, so it adds nothing.
      # The bun module of tabnix holds Bun, bun2nix, the hook for bun.nix, and the check helper.
      imports = [
        tabnix.flakeModules.default
        tabnix.flakeModules.bun
      ]
      ++ inputs.nixpkgs.lib.optional (builtins.pathExists ./template/scope.nix) ./template/scope.nix;

      perSystem =
        { pkgs, config, ... }:
        let
          inherit (config.tabnix.bun) check;
          # Biome finds its config in .config/ only through this flag, per ADR-0110.
          biomeConfig = "--config-path .config";
        in
        {
          tabnix.packages = [
            pkgs.biome
            pkgs.typescript-language-server
          ];

          # A fix stops the commit, so the engineer reviews the change and stages it.
          tabnix.hooks.biome = {
            name = "biome";
            entry = "${pkgs.biome}/bin/biome check ${biomeConfig} --write --error-on-warnings --no-errors-on-unmatched";
            files = "\\.(ts|tsx|js|jsx)$";
          };

          checks.lint-ts = check "lint-ts" [ pkgs.biome ] ''
            biome ci ${biomeConfig} --error-on-warnings .
            bun run tsc --noEmit
          '';
          checks.test = check "test" [ ] "bun test";
        };
    };
}
