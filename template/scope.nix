# The template scope, per TPL-0000. The template module of tabnix adds the lint-scope check and the templates output.
{ inputs, ... }:
{
  imports = [ inputs.tabnix.flakeModules.template ];

  tabnix.template = {
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
}
