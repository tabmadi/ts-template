# The toolchain, the git hooks, and the checks, per ADR-0100 and ADR-0110. The tabkit module holds every shared
# part, and this file adds the TypeScript parts.
{
  description = "A TypeScript application on Node.js with Biome and a strict tsconfig";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    flake-parts = {
      url = "github:hercules-ci/flake-parts";
      inputs.nixpkgs-lib.follows = "nixpkgs";
    };
    # A new version is a new tag here.
    tabkit = {
      url = "github:tabmadi/tabkit/v0.22.0";
      inputs.nixpkgs.follows = "nixpkgs";
      inputs.flake-parts.follows = "flake-parts";
      # Only the own checks of tabkit read this input, so it adds no second nixpkgs here.
      inputs.nixos-stable.follows = "nixpkgs";
    };
  };

  outputs =
    inputs@{ flake-parts, tabkit, ... }:
    flake-parts.lib.mkFlake { inherit inputs; } {
      # The template scope adds its own checks and outputs. A copy has no template/ folder, so it adds nothing.
      # The bun module of tabkit holds Bun as the installer, bun2nix, the hook for bun.nix, and the check helper.
      imports = [
        tabkit.flakeModules.default
        tabkit.flakeModules.bun
      ]
      ++ inputs.nixpkgs.lib.optional (builtins.pathExists ./template/scope.nix) ./template/scope.nix;

      perSystem =
        { pkgs, config, ... }:
        let
          inherit (config.tabkit.bun) check;
          # Node.js runs the app and the tests, per ADR-0110.
          nodejs = pkgs.nodejs_26;
          # Biome finds its config in .config/ only through this flag, per ADR-0110.
          biomeConfig = "--config-path .config";
        in
        {
          tabkit.packages = [
            nodejs
            pkgs.biome
            pkgs.typescript-language-server
          ];

          # A fix stops the commit, so the engineer reviews the change and stages it.
          tabkit.hooks.biome = {
            name = "biome";
            entry = "${pkgs.biome}/bin/biome check ${biomeConfig} --write --error-on-warnings --no-errors-on-unmatched";
            files = "\\.(ts|tsx|js|jsx)$";
          };

          tabkit.bun.tools = [ nodejs ];

          checks.lint-ts = check "lint-ts" [ pkgs.biome ] ''
            biome ci ${biomeConfig} --error-on-warnings .
            bun run tsc --noEmit
          '';
          checks.test = check "test" [ ] "node node_modules/vitest/vitest.mjs run";
        };
    };
}
