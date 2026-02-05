import fs from 'fs';
import path from 'path';
import { copyFeatureFiles } from '../utils/file-copier.js';

const CODE_FILES_FILTER = (name) => name.endsWith('.ts') || name.endsWith('.svelte');

export function copyGraphicsFiles(graphicsMode) {
  if (graphicsMode === 'none') return;

  if (graphicsMode === 'threlte') {
    // Copy 3D components
    const componentsSrc = path.join(process.cwd(), 'features', 'graphics', 'threlte', 'components', '3d');
    const componentsDest = path.join(process.cwd(), 'src', 'lib', 'components', '3d');
    copyFeatureFiles(componentsSrc, componentsDest, {}, CODE_FILES_FILTER);

    // Copy demo route (optional)
    const routeSrc = path.join(process.cwd(), 'features', 'graphics', 'threlte', 'routes');
    if (fs.existsSync(routeSrc)) {
      const routeDest = path.join(process.cwd(), 'src', 'routes');
      copyFeatureFiles(routeSrc, routeDest, {
        '$lib/components/3d': '$lib/components/3d'
      }, CODE_FILES_FILTER);
    }
  }
}

export function getGraphicsDeps(graphicsMode) {
  if (graphicsMode === 'none') return { dependencies: {}, devDependencies: {} };

  const depsPath = path.join(process.cwd(), 'features', 'graphics', graphicsMode, 'deps.json');
  try {
    return JSON.parse(fs.readFileSync(depsPath, 'utf-8'));
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`Missing deps.json for graphics ${graphicsMode}`);
    }
    throw error;
  }
}

export function getGraphicsEnvVars(graphicsMode) {
  if (graphicsMode === 'none') return {};

  const envPath = path.join(process.cwd(), 'features', 'graphics', graphicsMode, 'env.json');
  try {
    return JSON.parse(fs.readFileSync(envPath, 'utf-8'));
  } catch {
    return {};
  }
}
