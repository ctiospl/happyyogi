/**
 * Detects package manager from npm_config_user_agent env var
 * @returns {'npm' | 'pnpm' | 'yarn' | 'bun'}
 */
export function detectPackageManager() {
  const ua = process.env.npm_config_user_agent || '';
  if (ua.includes('pnpm')) return 'pnpm';
  if (ua.includes('yarn')) return 'yarn';
  if (ua.includes('bun')) return 'bun';
  return 'npm';
}
