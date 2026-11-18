# The template scope, per TPL-0000: the checks and outputs that only the template has.
{ self, lib, ... }:
let
  # Every file except this folder. `nix flake new -t` copies the result into a new project.
  projectScope = builtins.path {
    name = "project";
    path = self;
    filter = path: _type: !(lib.hasPrefix "${toString self}/template" path);
  };
in
{
  perSystem =
    { pkgs, ... }:
    {
      checks = {
        # The copied files stay true in every copy, per TPL-0000.
        lint-scope = pkgs.runCommand "lint-scope" { } ''
          cd ${self}
          voice='github\.com/tabmadi|blueprints|this template|the template|made from this|generated (repo|project)|TPL-[0-9]'
          if grep -rniE "$voice" docs AGENTS.md; then
            echo "A project doc speaks as the template or names another repo." >&2
            exit 1
          fi
          if grep -rnE --include='*.md' --exclude-dir=template '\]\((\./|\.\./)*template/' .; then
            echo "A copied file links into template/, and the link breaks in every copy." >&2
            exit 1
          fi
          touch $out
        '';
      };
    };

  flake = {
    templates.default = {
      path = projectScope;
      description = "A TypeScript application on Bun with Biome and a strict tsconfig, and no build step";
      welcomeText = ''
        # A new project

        1. In a new folder, run `git init` and `git add -A`. A flake sees only the files that git tracks.
        2. Change `name` in `package.json` to your own.
        3. Run `nix develop`. It downloads the tools and installs the git hooks.
        4. Run `just setup`. It installs the locked dependencies.
        5. Replace the sample server in `src/` with your own code.
        6. Rewrite `README.md` for this project.
        7. Update the contacts in `.github/SECURITY.md` and the copyright line in `LICENSE`.
        8. Install the Renovate app on the new repository.
      '';
    };
  };
}
