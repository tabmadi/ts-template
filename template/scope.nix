# The template scope, per TPL-0000. The template module of tabkit adds the lint-scope check and the templates output.
{ inputs, ... }:
{
  imports = [ inputs.tabkit.flakeModules.template ];

  tabkit.template = {
    extraVoice = [
      "github\\.com/tabmadi"
      "blueprints"
    ];
    description = "A TypeScript application on Node.js with Biome and a strict tsconfig, and no build step";
    welcomeText = ''
      # A new project

      Follow `Starting a project` in `README.md`.
    '';
  };
}
