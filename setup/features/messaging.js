import fs from 'fs';
import path from 'path';
import { copyFeatureFiles } from '../utils/file-copier.js';

const CODE_FILES_FILTER = (name) => name.endsWith('.ts') || name.endsWith('.svelte');

export function copyMessagingFiles(messagingChannels) {
  if (!messagingChannels || messagingChannels.length === 0) return;

  for (const channel of messagingChannels) {
    if (channel === 'whatsapp-business-api') {
      const srcPath = path.join(process.cwd(), 'features', 'messaging', 'whatsapp');
      const destPath = path.join(process.cwd(), 'src', 'lib', 'server', 'whatsapp');
      copyFeatureFiles(srcPath, destPath, {}, CODE_FILES_FILTER);

      // Copy webhook route
      const routeSrc = path.join(srcPath, 'routes');
      const routeDest = path.join(process.cwd(), 'src', 'routes');
      if (fs.existsSync(routeSrc)) {
        copyFeatureFiles(routeSrc, routeDest, {
          '$lib/server/whatsapp': '$lib/server/whatsapp'
        }, CODE_FILES_FILTER);
      }
    }
  }
}

export function getMessagingDeps(messagingChannels) {
  if (!messagingChannels || messagingChannels.length === 0) return { dependencies: {}, devDependencies: {} };
  // WhatsApp has no deps (native fetch)
  return { dependencies: {}, devDependencies: {} };
}

export function getMessagingEnvVars(messagingChannels) {
  if (!messagingChannels || messagingChannels.length === 0) return {};

  const combined = {};
  for (const channel of messagingChannels) {
    if (channel === 'whatsapp-business-api') {
      const envPath = path.join(process.cwd(), 'features', 'messaging', 'whatsapp', 'env.json');
      try {
        Object.assign(combined, JSON.parse(fs.readFileSync(envPath, 'utf-8')));
      } catch {}
    }
  }
  return combined;
}
