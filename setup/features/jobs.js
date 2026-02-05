import fs from 'fs';
import path from 'path';
import { copyFeatureFiles } from '../utils/file-copier.js';

const CODE_FILES_FILTER = (name) => name.endsWith('.ts');

export function copyJobsFiles(jobsMode) {
  if (jobsMode === 'none') return;

  if (jobsMode === 'bullmq') {
    const srcPath = path.join(process.cwd(), 'features', 'jobs', 'bullmq');
    const destPath = path.join(process.cwd(), 'src', 'lib', 'server', 'queues');
    copyFeatureFiles(srcPath, destPath, {}, CODE_FILES_FILTER);
  }
}

export function getJobsDeps(jobsMode) {
  if (jobsMode === 'none') return { dependencies: {}, devDependencies: {} };

  const depsPath = path.join(process.cwd(), 'features', 'jobs', jobsMode, 'deps.json');
  try {
    return JSON.parse(fs.readFileSync(depsPath, 'utf-8'));
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`Missing deps.json for jobs ${jobsMode}`);
    }
    throw error;
  }
}

export function getJobsEnvVars(jobsMode) {
  if (jobsMode === 'none') return {};

  const envPath = path.join(process.cwd(), 'features', 'jobs', jobsMode, 'env.json');
  try {
    return JSON.parse(fs.readFileSync(envPath, 'utf-8'));
  } catch {
    return {};
  }
}
