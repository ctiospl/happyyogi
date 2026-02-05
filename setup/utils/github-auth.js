// GitHub auth detection for create-asamkhya CLI
// Checks token env var or gh CLI auth status

import { execSync } from 'child_process';

/**
 * Check if GitHub auth is available
 * @returns {{ authenticated: boolean, method: 'token' | 'gh' | null }}
 */
export function checkGitHubAuth() {
  // Check GITHUB_TOKEN env var first
  if (process.env.GITHUB_TOKEN) {
    return { authenticated: true, method: 'token' };
  }

  // Try gh CLI auth
  try {
    execSync('gh auth status', { stdio: 'ignore' });
    return { authenticated: true, method: 'gh' };
  } catch {
    return { authenticated: false, method: null };
  }
}

/**
 * Get GitHub token from env or gh CLI
 * @returns {string | null}
 */
export function getGitHubToken() {
  if (process.env.GITHUB_TOKEN) {
    return process.env.GITHUB_TOKEN;
  }

  try {
    return execSync('gh auth token', { encoding: 'utf8' }).trim();
  } catch {
    return null;
  }
}
