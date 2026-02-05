# create-asamkhya CLI Specification

## Overview

A private CLI tool that scaffolds new projects from the asamkhya-starter-template with interactive feature selection.

**Usage:**
```bash
npx github:Asamkhya-com/create-asamkhya my-app
npx github:Asamkhya-com/create-asamkhya my-app --preset saas
npx github:Asamkhya-com/create-asamkhya  # interactive project name
```

## Technical Requirements

- **Runtime**: Node.js 18+ (validated at startup)
- **Package Manager**: Supports npm, pnpm, yarn, bun (auto-detect via npm_config_user_agent)
- **Distribution**: GitHub repo (private, accessed via `npx github:`)
- **Dependencies**: @clack/prompts, giget, cross-spawn
- **Platforms**: macOS, Linux, Windows (via cross-spawn)

## Authentication Requirement

Private repo access requires GitHub authentication:
```bash
# Users must run first:
gh auth login
# Or set GITHUB_TOKEN environment variable
```

---

# Phase 1: Minimal Viable CLI

**Goal**: A working CLI that clones the template and shows success message.

**Demo**: `npx github:Asamkhya-com/create-asamkhya my-test-app` creates a directory with template files.

## Tasks

### 1.1 Initialize package structure
**Description**: Create the npm package with proper bin configuration.

**Files to create**:
- `package.json` with name, version, bin entry, type: module
- `index.js` with shebang `#!/usr/bin/env node`
- `.gitignore`

**package.json**:
```json
{
  "name": "create-asamkhya",
  "version": "0.0.1",
  "type": "module",
  "bin": {
    "create-asamkhya": "./index.js"
  },
  "engines": {
    "node": ">=18"
  }
}
```

**Acceptance criteria**:
- `node index.js` runs without error
- index.js starts with `#!/usr/bin/env node`
- `package.json` has correct bin and type configuration

**Validation**: `node --check index.js` passes

---

### 1.2 Add Node.js version check
**Description**: Validate Node.js version at startup.

**Implementation**:
```js
const nodeVersion = parseInt(process.versions.node.split('.')[0]);
if (nodeVersion < 18) {
  console.error(`Node.js 18+ required. You have v${process.versions.node}`);
  process.exit(1);
}
```

**Acceptance criteria**:
- Node 16 shows error and exits with code 1
- Node 18+ continues normally

**Validation**: Test with nvm to switch versions

---

### 1.3 Add CLI argument parsing
**Description**: Parse project name from command line arguments.

**Implementation**:
```js
const args = process.argv.slice(2);
const projectName = args.find(arg => !arg.startsWith('-'));

function validateProjectName(name) {
  if (!name) return 'Project name required';
  if (!/^[a-z0-9-]+$/.test(name)) return 'Use lowercase, numbers, hyphens only';
  if (name.startsWith('-')) return 'Cannot start with hyphen';
  if (name.length > 214) return 'Max 214 characters';
  return null;
}
```

**Acceptance criteria**:
- `node index.js my-app` captures "my-app" as projectName
- `node index.js` with no args sets projectName to undefined
- `node index.js My_App` rejected (uppercase, underscore)
- `node index.js -my-app` rejected (starts with hyphen)

**Validation**: Test with various inputs

---

### 1.4 Add template download via giget
**Description**: Download template from GitHub without git history.

**Dependencies**: `giget`

**Implementation**:
```js
import { downloadTemplate } from 'giget';

await downloadTemplate('github:Asamkhya-com/asamkhya-starter-template', {
  dir: projectPath,
  force: false  // Don't overwrite existing
});
```

**Acceptance criteria**:
- Running CLI creates directory with template files
- No `.git` directory in output (clean clone)
- Error if directory already exists
- Uses GITHUB_TOKEN for auth if set

**Validation**:
- Run CLI, verify files exist
- `ls -la my-app` shows template files
- `cat my-app/package.json` shows template package.json

---

### 1.5 Add basic error handling
**Description**: Handle common failure cases gracefully.

**Cases to handle**:
- Directory already exists → "Directory 'my-app' already exists. Use --force to overwrite."
- No network → "Network error. Check your connection."
- GitHub auth failed → "GitHub authentication required. Run 'gh auth login' or set GITHUB_TOKEN."
- Invalid project name → Show validation error

**Acceptance criteria**:
- Each error shows clear, actionable message
- Exit code is non-zero on error
- No stack traces shown to user

**Validation**: Manually trigger each error case

---

### 1.6 Add success message with next steps
**Description**: Show user what to do after scaffolding.

**Output**:
```
✓ Created my-app

Next steps:
  cd my-app
  pnpm install
  node setup.js
  pnpm install
  pnpm dev
```

**Acceptance criteria**:
- Message shows after successful clone
- Project name correctly interpolated
- Uses ASCII symbols (no emoji per CLAUDE.md)

**Validation**: Run CLI, verify output

---

## Phase 1 Deliverable

```bash
npx github:Asamkhya-com/create-asamkhya my-app
# Downloads template to ./my-app
# Shows success message with next steps
```

---

# Phase 2: Interactive Prompts

**Goal**: Interactive project name prompt and preset selection.

**Demo**: Running without args prompts for name; `--preset` flag works.

## Tasks

### 2.1 Add @clack/prompts dependency
**Description**: Install and configure the prompts library.

**Dependencies**: `@clack/prompts`

**Acceptance criteria**:
- Package installed
- Can import and use `intro`, `text`, `select`, `isCancel` functions

**Validation**: Simple test script using prompts

---

### 2.2 Add interactive project name prompt
**Description**: If no project name provided, prompt user.

**Implementation**:
```js
import * as p from '@clack/prompts';

if (!projectName) {
  const result = await p.text({
    message: 'Project name?',
    placeholder: 'my-app',
    validate: validateProjectName
  });
  if (p.isCancel(result)) {
    p.cancel('Cancelled');
    process.exit(0);
  }
  projectName = result;
}
```

**Acceptance criteria**:
- `node index.js` (no args) prompts for name
- `node index.js my-app` (with arg) skips prompt
- Validation rejects invalid names inline
- Ctrl+C cancels gracefully

**Validation**: Run both ways, verify behavior

---

### 2.3 Add --preset flag parsing
**Description**: Parse preset flag from arguments.

**Flags**:
- `--preset <name>` or `-p <name>`
- Valid presets: saas, ai-app, 3d, minimal, custom

**Implementation**:
```js
function getFlag(args, long, short) {
  const longIdx = args.indexOf(long);
  const shortIdx = args.indexOf(short);
  const idx = longIdx !== -1 ? longIdx : shortIdx;
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : null;
}

const preset = getFlag(args, '--preset', '-p');
const validPresets = ['saas', 'ai-app', '3d', 'minimal', 'custom'];

if (preset && !validPresets.includes(preset)) {
  console.error(`Invalid preset: ${preset}. Valid: ${validPresets.join(', ')}`);
  process.exit(1);
}
```

**Acceptance criteria**:
- `--preset saas` captured correctly
- `-p saas` works as alias
- Invalid preset shows error with valid options
- No preset = null (will prompt)

**Validation**: Test all flag combinations

---

### 2.4 Add preset selection prompt
**Description**: If no preset flag, prompt user to select.

**Options**:
```js
const presetOptions = [
  { value: 'saas', label: 'SaaS (Recommended)', hint: 'PostgreSQL, Auth, Email OTP, AI, S3, BullMQ' },
  { value: 'ai-app', label: 'AI App', hint: 'PostgreSQL, Auth, Full AI, S3, BullMQ' },
  { value: 'minimal', label: 'Minimal', hint: 'SQLite only' },
  { value: '3d', label: '3D Graphics', hint: 'Threlte only' },
  { value: 'custom', label: 'Custom', hint: 'Interactive feature selection' }
];
```

**Acceptance criteria**:
- Shows select menu with descriptions
- "custom" runs interactive setup.js later
- Selected preset stored for Phase 3

**Validation**: Run CLI, navigate options, verify selection

---

### 2.5 Add intro/outro messaging with spinners
**Description**: Add polished CLI intro, spinners, and outro.

**Implementation**:
```js
p.intro('create-asamkhya');

const spinner = p.spinner();
spinner.start('Downloading template...');
await downloadTemplate(...);
spinner.stop('Template downloaded');

p.outro('Done! Run: cd my-app && pnpm install && node setup.js');
```

**Acceptance criteria**:
- Intro shows on start
- Spinner during download
- Outro shows on success
- ASCII symbols only (no emoji)

**Validation**: Visual inspection of output

---

## Phase 2 Deliverable

```bash
npx github:Asamkhya-com/create-asamkhya
# Prompts for project name
# Prompts for preset
# Downloads template with spinner
# Shows success
```

---

# Phase 3: Integrated Setup Execution

**Goal**: Run setup.js automatically with selected preset.

**Demo**: Full flow from `npx` to ready-to-develop project.

## Tasks

### 3.1 Add cross-platform command execution
**Description**: Utility to run commands cross-platform.

**Dependencies**: `cross-spawn`

**Implementation**:
```js
import spawn from 'cross-spawn';

function runCommand(cmd, args, cwd, timeout = 300000) {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, { cwd, stdio: 'inherit' });

    const timer = setTimeout(() => {
      proc.kill();
      reject(new Error(`Command timed out after ${timeout / 1000}s`));
    }, timeout);

    proc.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });

    proc.on('close', code => {
      clearTimeout(timer);
      code === 0 ? resolve() : reject(new Error(`Exit code ${code}`));
    });
  });
}
```

**Acceptance criteria**:
- Works on Windows, macOS, Linux
- stdio inherits (user sees output)
- Timeout after 5 min (configurable)
- Returns promise

**Validation**: Test on available platform with simple command

---

### 3.2 Add package manager detection
**Description**: Detect which package manager invoked the CLI.

**Implementation**:
```js
function detectPackageManager() {
  const userAgent = process.env.npm_config_user_agent || '';

  if (userAgent.includes('pnpm')) return 'pnpm';
  if (userAgent.includes('yarn')) return 'yarn';
  if (userAgent.includes('bun')) return 'bun';
  return 'npm';
}
```

**Acceptance criteria**:
- `pnpm dlx` returns 'pnpm'
- `npx` returns 'npm'
- `yarn dlx` returns 'yarn'
- `bunx` returns 'bun'

**Validation**: Run via each package manager

---

### 3.3 Add dependency installation step
**Description**: Run package manager install after clone.

**Implementation**:
```js
const pm = detectPackageManager();
spinner.start(`Installing dependencies with ${pm}...`);
await runCommand(pm, ['install'], projectPath, 300000); // 5 min timeout
spinner.stop('Dependencies installed');
```

**Acceptance criteria**:
- Runs detected package manager
- Shows install progress
- 5 minute timeout
- Handles install failures with clear message

**Validation**: Run CLI, verify node_modules created

---

### 3.4 Add setup.js execution with preset
**Description**: Run setup.js with the selected preset.

**Implementation**:
```js
if (preset === 'custom') {
  // Interactive - let user see setup.js prompts
  await runCommand('node', ['setup.js'], projectPath, 120000);
} else {
  // Non-interactive with preset
  spinner.start(`Configuring ${preset} preset...`);
  await runCommand('node', ['setup.js', '--preset', preset], projectPath, 120000);
  spinner.stop('Configuration complete');
}
```

**Acceptance criteria**:
- Preset mode runs non-interactively (setup.js handles this)
- Custom mode runs interactively (no spinner, stdio inherit)
- 2 minute timeout
- Setup failures show clear message

**Validation**: Run with different presets, verify features installed

---

### 3.5 Add second install for feature dependencies
**Description**: Run install again after setup.js adds dependencies.

**Implementation**:
```js
spinner.start('Installing feature dependencies...');
await runCommand(pm, ['install'], projectPath, 300000);
spinner.stop('All dependencies installed');
```

**Acceptance criteria**:
- Runs after setup.js completes
- Only if preset != 'custom' (custom mode user does manually)

**Validation**: Verify all deps in node_modules

---

### 3.6 Add --skip-install flag
**Description**: Option to skip automatic installation.

**Implementation**:
```js
const skipInstall = args.includes('--skip-install');

if (!skipInstall) {
  await installDeps();
  await runSetup();
  await installDeps();
}
```

**Acceptance criteria**:
- `--skip-install` skips both install steps and setup
- Success message shows manual steps when skipped

**Validation**: Run with flag, verify no node_modules

---

### 3.7 Update package.json name field
**Description**: Update project's package.json with user's project name.

**Implementation**:
```js
const pkgPath = path.join(projectPath, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
pkg.name = projectName;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, '\t') + '\n');
```

**Acceptance criteria**:
- package.json name matches project directory name
- Preserves rest of package.json

**Validation**: Check package.json after scaffolding

---

## Phase 3 Deliverable

```bash
npx github:Asamkhya-com/create-asamkhya my-app --preset saas
# Downloads template
# Updates package.json name
# Runs pnpm install
# Runs setup.js --preset saas
# Runs pnpm install again
# Shows "pnpm dev" instruction
```

---

# Phase 4: Polish and Edge Cases

**Goal**: Production-ready CLI with proper error handling and help.

**Demo**: `--help`, `--version`, graceful handling of all edge cases.

## Tasks

### 4.1 Add --help flag
**Description**: Show help text with usage examples.

**Output**:
```
create-asamkhya - Scaffold a new Asamkhya project

Usage:
  npx github:Asamkhya-com/create-asamkhya [project-name] [options]

Options:
  --preset, -p <name>  Use preset: saas, ai-app, 3d, minimal, custom
  --skip-install       Skip dependency installation
  --force              Overwrite existing directory
  --help, -h           Show this help
  --version, -v        Show version

Presets:
  saas      PostgreSQL, Lucia auth, Email OTP, AI minimal, S3, BullMQ
  ai-app    PostgreSQL, Lucia auth, AI full, S3, BullMQ
  minimal   SQLite only
  3d        Threlte 3D graphics only
  custom    Interactive feature selection

Examples:
  npx github:Asamkhya-com/create-asamkhya my-app
  npx github:Asamkhya-com/create-asamkhya my-app --preset saas
  npx github:Asamkhya-com/create-asamkhya my-app -p ai-app --skip-install

Requires: GitHub auth (run 'gh auth login' or set GITHUB_TOKEN)
```

**Acceptance criteria**:
- `--help` and `-h` both work
- Exits with code 0

**Validation**: Run with flag, verify output

---

### 4.2 Add --version flag
**Description**: Show CLI and template versions.

**Implementation**:
```js
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';

const pkgPath = fileURLToPath(new URL('./package.json', import.meta.url));
const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
console.log(`create-asamkhya v${pkg.version}`);
```

**Acceptance criteria**:
- `--version` and `-v` both work
- Shows version from package.json

**Validation**: Run with flag, compare to package.json

---

### 4.3 Add --force flag for overwriting
**Description**: Allow overwriting existing directories.

**Implementation**:
```js
const force = args.includes('--force');

if (fs.existsSync(projectPath)) {
  if (force) {
    fs.rmSync(projectPath, { recursive: true });
  } else {
    console.error(`Directory '${projectName}' exists. Use --force to overwrite.`);
    process.exit(1);
  }
}
```

**Acceptance criteria**:
- Without --force, existing dir is error
- With --force, existing dir is removed first

**Validation**: Test both cases

---

### 4.4 Add SIGINT handler for cleanup
**Description**: Clean up partial work on Ctrl+C.

**Implementation**:
```js
let projectPath = null;

process.on('SIGINT', () => {
  console.log('\nCancelled');
  if (projectPath && fs.existsSync(projectPath)) {
    fs.rmSync(projectPath, { recursive: true });
    console.log(`Cleaned up ${projectPath}`);
  }
  process.exit(130);
});
```

**Acceptance criteria**:
- Ctrl+C during any operation removes partial directory
- Shows "Cancelled" message
- Exit code 130 (standard for SIGINT)

**Validation**: Cancel mid-download, verify no partial dir

---

### 4.5 Add network error retry
**Description**: Offer retry on network failures.

**Implementation**:
```js
async function downloadWithRetry(maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await downloadTemplate(...);
    } catch (error) {
      if (attempt === maxRetries) throw error;

      const retry = await p.confirm({
        message: `Download failed (attempt ${attempt}/${maxRetries}). Retry?`
      });

      if (p.isCancel(retry) || !retry) {
        throw new Error('Download cancelled');
      }
    }
  }
}
```

**Acceptance criteria**:
- Network errors offer retry up to 3 times
- User can decline retry
- Non-network errors fail immediately

**Validation**: Simulate network failure (disconnect wifi)

---

### 4.6 Add GitHub auth check
**Description**: Check for GitHub auth before attempting download.

**Implementation**:
```js
async function checkGitHubAuth() {
  // Check for token
  if (process.env.GITHUB_TOKEN) return true;

  // Check gh CLI auth
  try {
    const result = spawn.sync('gh', ['auth', 'status'], { stdio: 'pipe' });
    return result.status === 0;
  } catch {
    return false;
  }
}

if (!await checkGitHubAuth()) {
  p.log.warn("GitHub auth required for private repo.");
  p.log.info("Run 'gh auth login' or set GITHUB_TOKEN env var.");
  process.exit(1);
}
```

**Acceptance criteria**:
- Checks GITHUB_TOKEN env var
- Falls back to `gh auth status`
- Clear message if neither available

**Validation**: Test with/without auth

---

## Phase 4 Deliverable

Complete, polished CLI with:
- `--help`, `--version`, `--force` flags
- Graceful Ctrl+C handling with cleanup
- Network retry
- Auth validation
- ASCII-only output

---

# Phase 5: Testing, Documentation, and Release

**Goal**: Tested, documented, published CLI.

## Tasks

### 5.1 Extract testable modules
**Description**: Refactor for testability.

**Structure**:
```
create-asamkhya/
├── index.js           # Entry point (thin)
├── lib/
│   ├── args.js        # Argument parsing
│   ├── validate.js    # Validation functions
│   ├── download.js    # Template download
│   ├── setup.js       # Setup execution
│   └── pm.js          # Package manager detection
├── test/
│   ├── args.test.js
│   ├── validate.test.js
│   └── pm.test.js
└── package.json
```

**Acceptance criteria**:
- Each module exports testable functions
- index.js is minimal orchestration only

**Validation**: All imports resolve

---

### 5.2 Add unit tests
**Description**: Test core logic modules.

**Framework**: vitest

**Test cases**:
- args.js: flag parsing, project name extraction
- validate.js: project name validation
- pm.js: package manager detection

**Acceptance criteria**:
- `npm test` runs all tests
- Coverage > 80% for lib/ modules

**Validation**: `npm test` passes

---

### 5.3 Add integration test
**Description**: Test full scaffolding flow.

**Implementation**:
```js
import { test, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

let tempDir;

beforeEach(() => {
  tempDir = mkdtempSync(join(tmpdir(), 'create-asamkhya-test-'));
});

afterEach(() => {
  rmSync(tempDir, { recursive: true });
});

test('scaffolds project with --skip-install', async () => {
  // Run CLI in tempDir
  // Verify key files exist
  // Verify package.json name updated
});
```

**Acceptance criteria**:
- Tests in isolated temp directory
- Cleans up after each test
- Uses --skip-install for speed

**Validation**: `npm test` passes

---

### 5.4 Add README.md
**Description**: Documentation for the CLI.

**Sections**:
- Prerequisites (Node 18+, GitHub auth)
- Installation / Usage
- Options reference
- Presets explanation
- Examples
- Troubleshooting
- Development (for contributors)

**Acceptance criteria**:
- All flags documented
- Clear examples
- Auth setup explained

**Validation**: README renders correctly

---

### 5.5 Create GitHub repo and push
**Description**: Create Asamkhya-com/create-asamkhya repo.

**Commands**:
```bash
gh repo create Asamkhya-com/create-asamkhya --private --source=. --push
```

**Acceptance criteria**:
- Private repo created
- Code pushed to main
- README visible on GitHub

**Validation**: `npx github:Asamkhya-com/create-asamkhya --help` works

---

### 5.6 Add GitHub Actions CI
**Description**: Automated testing on push.

**Workflow** (.github/workflows/ci.yml):
```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      - run: npm install
      - run: npm test
```

**Acceptance criteria**:
- Tests run on every push
- Badge in README

**Validation**: Push triggers workflow, tests pass

---

## Phase 5 Deliverable

Production-ready CLI:
- Tested (unit + integration)
- Documented (README)
- Published (private GitHub repo)
- CI/CD (GitHub Actions)

---

# Summary

| Phase | Goal | Tasks | Key Deliverable |
|-------|------|-------|-----------------|
| 1 | Minimal CLI | 6 | Clone template via `npx` |
| 2 | Interactive | 5 | Prompts for name/preset |
| 3 | Integrated | 7 | Auto-runs setup + install |
| 4 | Polish | 6 | Help, errors, cleanup |
| 5 | Production | 6 | Tests, docs, CI |

**Total tasks: 30**

---

# Unresolved Questions (for user)

1. Should CLI support cloning specific git ref/tag? (e.g., `--ref v1.0.0`)
2. What's the desired behavior if setup.js fails mid-way - keep partial or full cleanup?
3. Should we add `--verbose` flag for debugging output?
