// CLI argument parsing utilities

const VALID_PRESETS = ['minimal', 'saas', 'ai'];

/**
 * Parse preset values (comma-separated or single)
 * @param {string} value
 * @returns {string[]}
 */
function parsePresetValue(value) {
  return value.split(',').map(p => p.trim()).filter(p => VALID_PRESETS.includes(p));
}

/**
 * Parse process.argv into structured args
 * @returns {{ projectName: string | undefined, presets: string[], skipInstall: boolean, showVersion: boolean, showHelp: boolean, force: boolean, flags: string[] }}
 */
export function parseArgs() {
  const args = process.argv.slice(2);
  const projectName = args.find(arg => !arg.startsWith('-'));

  const presets = [];
  const flags = [];
  const skipInstall = args.includes('--skip-install') || args.includes('--no-install');
  const showVersion = args.includes('--version') || args.includes('-v');
  const showHelp = args.includes('--help') || args.includes('-h');
  const force = args.includes('--force') || args.includes('-f');

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--preset' || arg === '-p') {
      const value = args[i + 1];
      if (value && !value.startsWith('-')) {
        presets.push(...parsePresetValue(value));
        i++; // skip next arg
      }
    } else if (arg.startsWith('--preset=')) {
      presets.push(...parsePresetValue(arg.split('=')[1]));
    } else if (arg.startsWith('-p=')) {
      presets.push(...parsePresetValue(arg.split('=')[1]));
    } else if (arg.startsWith('-') && arg !== projectName) {
      flags.push(arg);
    }
  }

  // Deduplicate presets
  const uniquePresets = [...new Set(presets)];

  return { projectName, presets: uniquePresets, skipInstall, showVersion, showHelp, force, flags };
}

/**
 * Validate project name for npm package naming rules
 * @param {string | undefined} name
 * @returns {string | null} Error message or null if valid
 */
const RESERVED_NAMES = ['node_modules', 'favicon.ico', '.git', '..', '.'];

export function validateProjectName(name) {
  if (!name) return 'Project name required';
  if (!/^[a-z0-9-]+$/.test(name)) return 'Use lowercase, numbers, hyphens only';
  if (name.startsWith('-')) return 'Cannot start with hyphen';
  if (name.endsWith('-')) return 'Cannot end with hyphen';
  if (name.includes('--')) return 'No consecutive hyphens';
  if (RESERVED_NAMES.includes(name)) return 'Reserved name';
  if (name.length > 214) return 'Max 214 characters';
  return null;
}
