import fs from 'fs';
import path from 'path';
import { copyFeatureFiles } from '../utils/file-copier.js';

const CODE_FILES_FILTER = (name) => name.endsWith('.ts') || name.endsWith('.svelte') || name.endsWith('.js');

export function copyAiFiles(aiMode) {
  if (aiMode === 'none') return;

  const destPath = path.join(process.cwd(), 'src', 'lib', 'server', 'ai');

  if (aiMode === 'minimal' || aiMode === 'full') {
    // Copy minimal core files
    const minimalSrc = path.join(process.cwd(), 'features', 'ai', 'minimal');
    copyFeatureFiles(minimalSrc, destPath, {}, CODE_FILES_FILTER);

    // Copy minimal routes
    const routeSrc = path.join(minimalSrc, 'routes');
    if (fs.existsSync(routeSrc)) {
      const routeDest = path.join(process.cwd(), 'src', 'routes');
      copyFeatureFiles(routeSrc, routeDest, {
        '$lib/server/ai': '$lib/server/ai'
      }, CODE_FILES_FILTER);
    }
  }

  if (aiMode === 'full') {
    // Copy AI components
    const componentsSrc = path.join(process.cwd(), 'features', 'ai', 'full', 'components');
    const componentsDest = path.join(process.cwd(), 'src', 'lib', 'components');

    if (fs.existsSync(componentsSrc)) {
      copyFeatureFiles(componentsSrc, componentsDest, {}, CODE_FILES_FILTER);
    }
  }
}

export function getAiDeps(aiMode) {
  if (aiMode === 'none') return { dependencies: {}, devDependencies: {} };

  const depsPath = path.join(process.cwd(), 'features', 'ai', aiMode, 'deps.json');
  try {
    return JSON.parse(fs.readFileSync(depsPath, 'utf-8'));
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`Missing deps.json for AI ${aiMode}`);
    }
    throw error;
  }
}

export function getAiEnvVars(aiMode) {
  if (aiMode === 'none') return {};

  const envPath = path.join(process.cwd(), 'features', 'ai', aiMode, 'env.json');
  try {
    return JSON.parse(fs.readFileSync(envPath, 'utf-8'));
  } catch {
    return {};
  }
}
