import fs from 'fs';
import path from 'path';
import { copyFeatureFiles } from '../utils/file-copier.js';

// Filter: only copy .ts and .sql files
const CODE_FILES_FILTER = (name) => name.endsWith('.ts') || name.endsWith('.sql');

/**
 * Copy auth files from features to src
 * @param {string} authType - Auth type from setup prompts ('lucia' or 'none')
 */
export function copyAuthFiles(authType) {
  if (authType === 'none') return;

  if (authType !== 'lucia') {
    throw new Error(`Unknown auth type: ${authType}`);
  }

  const srcPath = path.join(process.cwd(), 'features', 'auth', 'lucia');
  const destPath = path.join(process.cwd(), 'src', 'lib', 'server', 'auth');

  copyFeatureFiles(srcPath, destPath, {}, CODE_FILES_FILTER);
}

/**
 * Get dependencies for auth type
 * @param {string} authType - Auth type from setup prompts
 * @returns {object} - { dependencies, devDependencies }
 */
export function getAuthDeps(authType) {
  if (authType === 'none') return { dependencies: {}, devDependencies: {} };

  const depsPath = path.join(process.cwd(), 'features', 'auth', authType, 'deps.json');
  try {
    const depsContent = fs.readFileSync(depsPath, 'utf-8');
    return JSON.parse(depsContent);
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`Missing deps.json for ${authType}: ${depsPath}`);
    }
    if (error instanceof SyntaxError) {
      throw new Error(`Malformed deps.json for ${authType}: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Get env vars for auth type
 * @param {string} authType - Auth type from setup prompts
 * @returns {object} - Env var definitions
 */
export function getAuthEnvVars(authType) {
  if (authType === 'none') return {};

  const envPath = path.join(process.cwd(), 'features', 'auth', authType, 'env.json');
  try {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    return JSON.parse(envContent);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return {}; // env.json is optional for auth
    }
    if (error instanceof SyntaxError) {
      throw new Error(`Malformed env.json for ${authType}: ${error.message}`);
    }
    throw error;
  }
}
