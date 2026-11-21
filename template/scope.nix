# The template scope, per TPL-0000. The template module of tabnix adds the lint-scope check and the templates output.
{ inputs, ... }:
{
  imports = [ inputs.tabnix.flakeModules.template ];

  tabnix.template = {
    description = "A TypeScript application on Bun with Biome and a strict tsconfig, and no build step";
    welcomeText = ''
      # A new project

      Follow `Starting a project` in `README.md`.
    '';
  };
}
