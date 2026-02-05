import fs from 'fs';
import path from 'path';
import { copyFeatureFiles } from '../utils/file-copier.js';

// Map setup.js values to feature folder names
const DB_TYPE_MAP = {
  'postgresql-18': 'postgres18',
  'postgresql': 'postgres',
  'mysql': 'mysql',
  'mariadb': 'mariadb',
  'sqlite': 'sqlite'
};

// Filter: only copy .ts and .sql files (not deps.json, env.json)
const CODE_FILES_FILTER = (name) => name.endsWith('.ts') || name.endsWith('.sql');

// Fix import paths after flattening directory structure
const IMPORT_REPLACEMENTS = {
  "../_shared/types.js": "./types.js"
};

/**
 * Copy database files from features to src
 * @param {string} dbType - Database type from setup prompts
 */
export function copyDatabaseFiles(dbType) {
  if (dbType === 'none') return;

  const featureDir = DB_TYPE_MAP[dbType];
  if (!featureDir) {
    throw new Error(`Unknown database type: ${dbType}`);
  }

  const srcPath = path.join(process.cwd(), 'features', 'database', featureDir);
  const destPath = path.join(process.cwd(), 'src', 'lib', 'server', 'db');

  // Copy shared types first
  const sharedSrcPath = path.join(process.cwd(), 'features', 'database', '_shared');
  copyFeatureFiles(sharedSrcPath, destPath, {}, CODE_FILES_FILTER);

  // Copy db-specific files with import path fixes
  copyFeatureFiles(srcPath, destPath, IMPORT_REPLACEMENTS, CODE_FILES_FILTER);
}

/**
 * Get dependencies for database type
 * @param {string} dbType - Database type from setup prompts
 * @returns {object} - { dependencies, devDependencies }
 */
export function getDatabaseDeps(dbType) {
  if (dbType === 'none') return { dependencies: {}, devDependencies: {} };

  const featureDir = DB_TYPE_MAP[dbType];
  if (!featureDir) {
    throw new Error(`Unknown database type: ${dbType}`);
  }

  const depsPath = path.join(process.cwd(), 'features', 'database', featureDir, 'deps.json');
  try {
    const depsContent = fs.readFileSync(depsPath, 'utf-8');
    return JSON.parse(depsContent);
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`Missing deps.json for ${dbType}: ${depsPath}`);
    }
    if (error instanceof SyntaxError) {
      throw new Error(`Malformed deps.json for ${dbType}: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Get env vars for database type
 * @param {string} dbType - Database type from setup prompts
 * @returns {object} - Env var definitions
 */
export function getDatabaseEnvVars(dbType) {
  if (dbType === 'none') return {};

  const featureDir = DB_TYPE_MAP[dbType];
  if (!featureDir) {
    throw new Error(`Unknown database type: ${dbType}`);
  }

  const envPath = path.join(process.cwd(), 'features', 'database', featureDir, 'env.json');
  try {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    return JSON.parse(envContent);
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`Missing env.json for ${dbType}: ${envPath}`);
    }
    if (error instanceof SyntaxError) {
      throw new Error(`Malformed env.json for ${dbType}: ${error.message}`);
    }
    throw error;
  }
}
