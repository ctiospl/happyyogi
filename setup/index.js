#!/usr/bin/env node

// create-asamkhya CLI entry point
// Scaffolds new projects from asamkhya-starter-template

import { createRequire } from 'module';
import * as p from '@clack/prompts';
import { parseArgs, validateProjectName } from './utils/args.js';
import checkNodeVersion from './utils/version-check.js';
import { downloadProjectTemplate } from './utils/template.js';
import { updatePackageName } from './utils/update-package.js';
import { runCommand } from './utils/run-command.js';
import { detectPackageManager } from './utils/package-manager.js';
import { retryAsync } from './utils/retry.js';
import { checkGitHubAuth } from './utils/github-auth.js';

const require = createRequire(import.meta.url);
const pkg = require('./package.json');

async function main() {
  let { projectName, presets, skipInstall, showVersion, showHelp, force, flags } = parseArgs();

  if (showVersion) {
    console.log(`create-asamkhya v${pkg.version}`);
    process.exit(0);
  }

  if (showHelp) {
    console.log(`
Usage: npx create-asamkhya [project-name] [options]

Options:
  -p, --preset <names> Presets to use (minimal, saas, ai) - comma-separated
  --skip-install       Skip dependency installation
  -f, --force          Overwrite existing directory
  -h, --help           Show this help
  -v, --version        Show version
`);
    process.exit(0);
  }

  process.on('SIGINT', () => {
    p.cancel('Operation cancelled');
    process.exit(0);
  });

  checkNodeVersion();

  p.intro('create-asamkhya');

  if (!projectName) {
    projectName = await p.text({
      message: 'Project name:',
      placeholder: 'my-awesome-project',
      validate: validateProjectName
    });

    if (p.isCancel(projectName)) {
      p.cancel('Operation cancelled.');
      process.exit(0);
    }
  } else {
    const error = validateProjectName(projectName);
    if (error) {
      p.cancel(`${error}\nUsage: npx create-asamkhya <project-name>`);
      process.exit(1);
    }
  }

  if (presets.length === 0) {
    const selected = await p.multiselect({
      message: 'Select presets (space to toggle, enter to confirm):',
      options: [
        { value: 'minimal', label: 'Minimal', hint: 'Core framework only' },
        { value: 'saas', label: 'SaaS', hint: 'Auth, payments, dashboard' },
        { value: 'ai', label: 'AI', hint: 'AI chat, agents, tools' }
      ],
      required: true
    });

    if (p.isCancel(selected)) {
      p.cancel('Operation cancelled.');
      process.exit(0);
    }
    presets = selected;
  }

  if (flags.length) console.log(`Flags: ${flags.join(', ')}`);

  // Check GitHub auth before download
  const authStatus = checkGitHubAuth();
  if (!authStatus.authenticated) {
    p.log.warn('No GitHub auth detected - download may fail for private repos');
    p.log.info('Run "gh auth login" or set GITHUB_TOKEN to authenticate');
  }

  const spin = p.spinner();
  spin.start('Downloading template...');

  try {
    await retryAsync(() => downloadProjectTemplate(projectName, { force }));
    updatePackageName(projectName, projectName);
    spin.stop('Template downloaded');

    if (!skipInstall) {
      const pm = detectPackageManager();
      spin.start(`Installing dependencies with ${pm}...`);
      await runCommand(pm, ['install'], { cwd: projectName });
      spin.stop('Dependencies installed');

      spin.start('Running setup...');
      await runCommand('node', ['setup/setup.js', '--preset', presets.join(',')], { cwd: projectName });
      spin.stop('Setup complete');

      spin.start('Installing feature dependencies...');
      await runCommand(pm, ['install'], { cwd: projectName });
      spin.stop('Feature dependencies installed');
    }
  } catch (err) {
    spin.stop('Download failed');

    // Directory already exists
    if (err.code === 'EEXIST' || err.message?.includes('already exists')) {
      p.cancel(`Directory "${projectName}" already exists`);
      process.exit(1);
    }

    // Network errors
    if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED' || err.cause?.code === 'ENOTFOUND') {
      p.cancel('Network error - check your internet connection');
      process.exit(1);
    }

    // Auth errors (GitHub rate limit, private repo, etc)
    if (err.statusCode === 401 || err.statusCode === 403 || err.message?.includes('401') || err.message?.includes('403')) {
      p.cancel('Authentication failed - check GitHub access');
      process.exit(1);
    }

    // Generic fetch/download errors
    if (err.message?.includes('fetch') || err.message?.includes('download')) {
      p.cancel('Failed to download template');
      process.exit(1);
    }

    // Missing directory (e.g., partial download failure)
    if (err.code === 'ENOENT' || err.message?.includes('ENOENT')) {
      p.cancel('Setup failed - project directory not found');
      process.exit(1);
    }

    // Fallback for unknown errors
    p.cancel(err.message || 'Unknown error occurred');
    process.exit(1);
  }

  const pmForSteps = detectPackageManager();
  const nextSteps = skipInstall
    ? `cd ${projectName}\n${pmForSteps} install\n${pmForSteps} run dev`
    : `cd ${projectName}\n${pmForSteps} run dev`;
  p.note(nextSteps, 'Next steps');
  p.outro(`Project created: ${projectName}`);
}

main().catch((err) => {
  console.error(`Error: ${err.message || 'Unknown error'}`);
  process.exit(1);
});
