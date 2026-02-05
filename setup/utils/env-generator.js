import fs from 'fs';
import path from 'path';

/**
 * Environment variable accumulator
 * Collects env vars from features and generates .env.example
 */
class EnvGenerator {
  constructor() {
    this.vars = new Map();
  }

  /**
   * Add environment variables
   * @param {Record<string, {description: string, example: string}>} vars
   * @param {string} [source] - Source feature for collision tracking
   */
  addEnvVars(vars, source = 'unknown') {
    for (const [key, config] of Object.entries(vars)) {
      if (this.vars.has(key)) {
        const existing = this.vars.get(key);
        console.warn(`Warning: ${key} already defined by ${existing._source || 'base'}, overwriting with ${source}`);
      }
      this.vars.set(key, { ...config, _source: source });
    }
  }

  /**
   * Reset accumulated vars
   */
  reset() {
    this.vars.clear();
  }

  /**
   * Generate .env.example content
   * @returns {string}
   */
  generateContent() {
    const lines = ['# Environment Variables', '# Copy this file to .env and fill in values', ''];

    for (const [key, config] of this.vars) {
      if (config.description) {
        lines.push(`# ${config.description}`);
      }
      lines.push(`${key}=${config.example || ''}`);
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Write .env.example file
   * @param {string} [destPath] - Destination path (defaults to .env.example in cwd)
   */
  writeEnvExample(destPath = path.join(process.cwd(), '.env.example')) {
    const content = this.generateContent();
    fs.writeFileSync(destPath, content);
    return destPath;
  }
}

// Singleton instance
let instance = null;

export function getEnvGenerator() {
  if (!instance) {
    instance = new EnvGenerator();
  }
  return instance;
}

// Convenience exports
export function addEnvVars(vars) {
  return getEnvGenerator().addEnvVars(vars);
}

export function generateEnvExample(destPath) {
  return getEnvGenerator().writeEnvExample(destPath);
}

export function resetEnvGenerator() {
  if (instance) {
    instance.reset();
  }
}
