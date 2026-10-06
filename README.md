# 🚀 TypeScript Template

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Bun](https://img.shields.io/badge/Bun-1.3-orange.svg)](https://bun.sh/)
[![Biome](https://img.shields.io/badge/Biome-2.5-green.svg)](https://biomejs.dev/)

A modern, production-ready template for TypeScript projects with all the essential tools and configurations you need to
get started quickly! 🎯

## ✨ Features

This template comes pre-configured with:

- 🔥 **Bun Runtime**: Ultra-fast JavaScript runtime and package manager
- 📘 **TypeScript**: Type-safe JavaScript with modern ES features
- 🧹 **Biome**: Fast linter and formatter (Prettier + ESLint replacement)
- 🔧 **Modern Configuration**: ESNext target with strict type checking
- 🚨 **Git Integration**: Pre-configured with Biome VCS integration
- 🪝 **Git Hooks**: Lefthook for automated quality checks
- 📋 **Conventional Commits**: Cocogitto (cog) for commit message validation and changelog generation
- 📝 **GitHub Templates**: CODE_OF_CONDUCT.md, SECURITY.md, and LICENSE included
- ⚡ **mise**: Pinned tool versions and tasks with [mise](https://mise.jdx.dev)
- 🔐 **Secret Scanning**: [gitleaks](https://github.com/gitleaks/gitleaks) on every commit and in CI
- 🤖 **CI**: A GitHub Actions workflow that runs the same `mise run ci` as the pre-push hook

## 🚀 Quick Start

### Prerequisites

- [mise](https://mise.jdx.dev): A multi-language version manager and task runner. It installs every other tool
  (Bun, Biome, Cocogitto, Lefthook, gitleaks) at the versions pinned in [.mise.toml](.mise.toml).

### Installation

1. **Use this template** by clicking the "Use this template" button on GitHub
2. **Clone your new repository**:
   ```bash
   git clone https://github.com/yourusername/your-project-name.git
   cd your-project-name
   ```
3. **Install tools, dependencies, and Git hooks**:
   ```bash
   mise trust     # allow this repo's .mise.toml
   mise install   # install the pinned tools
   mise run setup # install dependencies and Git hooks
   ```

### 🏃‍♂️ Running the Project

```bash
# Start the development server (with watch mode)
mise run dev

# Start the production server
mise run start
```

## 🛠️ Development

### Available Tasks

Tasks live in [.mise.toml](.mise.toml); `mise tasks` lists them. The `package.json` scripts delegate to them, so
`bun run lint` and `mise run lint` are the same.

| Task              | Description                                         |
|-------------------|-----------------------------------------------------|
| `mise run setup`  | Install dependencies and Git hooks                  |
| `mise run start`  | Start the production server                         |
| `mise run dev`    | Start development server with file watching         |
| `mise run test`   | Run the tests                                       |
| `mise run lint`   | Biome (warnings fail), `tsc --noEmit`, and gitleaks |
| `mise run format` | Format code with Biome                              |
| `mise run check`  | Lint and test: run it before you finish             |
| `mise run ci`     | Install the locked dependencies, then check         |

### 🧹 Code Quality

This template uses **Biome** for both linting and formatting:

```bash
# Check for linting issues
mise run lint

# Auto-fix linting issues and format code
mise run format
```

### 🪝 Git Hooks & Conventional Commits

This template includes **Lefthook** for automated Git hooks

#### Automatic Quality Checks

Git hooks will automatically run on:

- **Pre-commit**: Biome fixes and re-stages the staged files, then type-check, test, and scan for secrets
- **Commit-msg**: Validate commit message format
- **Pre-push**: Validate commit history and run `mise run ci`, the same gate as CI

Every hook runs its tools through `mise x`, so hooks work from an editor or a shell without mise activated.

#### Conventional Commits

All commit messages must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```bash
# ✅ Valid commit messages
git commit -m "feat: add user authentication"
git commit -m "fix: resolve memory leak in data processing"
git commit -m "docs: update API documentation"
git commit -m "refactor: simplify error handling logic"

# ❌ Invalid commit messages
git commit -m "add feature"           # Missing type
git commit -m "Fix bug"              # Wrong case
git commit -m "feat!: breaking change" # Use BREAKING CHANGE footer instead
```

**Available commit types:**

- `feat` - New features
- `fix` - Bug fixes
- `docs` - Documentation changes
- `refactor` - Code refactoring
- `perf` - Performance improvements
- `test` - Adding or updating tests
- `build` - Build system changes
- `ci` - CI configuration changes
- `chore` - Other changes (maintenance, etc.)
- `revert` - Reverting previous commits

#### Managing Git Hooks

```bash
# Install hooks (part of `mise run setup`)
mise x -- lefthook install

# Skip hooks for a single commit (use sparingly)
git commit -m "feat: add feature" --no-verify

# Temporarily disable hooks
mise x -- lefthook uninstall

# Re-enable hooks
mise x -- lefthook install
```

### 📁 Project Structure

```
├── src/
│   └── index.ts          # Main application entry point
├── biome.json           # Biome configuration
├── tsconfig.json        # TypeScript configuration
├── package.json         # Project dependencies and scripts
└── README.md            # You are here! 📍
```

## 🔧 Configuration

### TypeScript Configuration

The `tsconfig.json` is configured for modern TypeScript development:

- ESNext target and library
- Strict type checking enabled
- Bun-optimized module resolution
- React JSX support ready

### Biome Configuration

The `biome.json` includes:

- All recommended rules are enabled
- Tab indentation (configurable)
- Git integration
- Import organization

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run the formatter and the gate: `mise run format && mise run check`
5. Commit your changes (`git commit -m 'Add some amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📋 Customization

To customize this template for your project:

1. **Update package.json** with your project details
2. **Modify the server** in `src/index.ts` to fit your needs
3. **Adjust TypeScript/Biome configs** as needed
4. **Update this README** with your project-specific information

## 🔒 Security

Please see [SECURITY.md](SECURITY.md) for our security policy and how to report security vulnerabilities.

## 📄 License

This project is licensed under the Apache License—see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Bun](https://bun.sh/) for the amazing runtime
- [Biome](https://biomejs.dev/) for fast linting and formatting
- [TypeScript](https://www.typescriptlang.org/) for type safety
- [Lefthook](https://github.com/evilmartians/lefthook) for fast and powerful Git hooks management
- [Cocogitto](https://github.com/cocogitto/cocogitto) for conventional commits tooling and changelog generation
- [mise](https://mise.jdx.dev) for tool versions and tasks

---

**Happy coding! 🎉** If you find this template useful, please give it a ⭐️
