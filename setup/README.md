# create-asamkhya

Scaffold new projects from asamkhya-starter-template.

## Usage

```bash
npx github:Asamkhya-com/create-asamkhya my-app
npx github:Asamkhya-com/create-asamkhya my-app --preset saas
npx github:Asamkhya-com/create-asamkhya my-app -p ai --skip-install
```

## Presets

| Preset | Description |
|--------|-------------|
| `minimal` | Core framework only |
| `saas` | Auth, payments, dashboard |
| `ai` | AI chat, agents, tools |

## Options

| Flag | Description |
|------|-------------|
| `-p, --preset <name>` | Preset to use (minimal, saas, ai) |
| `--skip-install` | Skip dependency installation |
| `-f, --force` | Overwrite existing directory |
| `-h, --help` | Show help |
| `-v, --version` | Show version |

## Requirements

- Node.js 18+
- GitHub CLI (`gh`) for private repo access (optional)
