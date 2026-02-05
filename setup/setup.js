#!/usr/bin/env node

// In-project setup runner
// Applies preset configurations to a freshly scaffolded project

import fs from 'fs';
import path from 'path';
import { getOrchestrator } from './utils/orchestrator.js';

const PRESETS = {
  minimal: {
    features: [],
    description: 'Core framework only'
  },
  saas: {
    features: ['auth', 'payments', 'dashboard'],
    description: 'Auth, payments, dashboard'
  },
  ai: {
    features: ['ai-chat', 'agents', 'tools'],
    description: 'AI chat, agents, tools'
  }
};

function parsePresets() {
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--preset' || args[i] === '-p') {
      const value = args[i + 1];
      if (value) {
        return value.split(',').filter(p => PRESETS[p]);
      }
    }
    if (args[i].startsWith('--preset=')) {
      return args[i].split('=')[1].split(',').filter(p => PRESETS[p]);
    }
  }
  return ['minimal'];
}

async function applyPresets(presets) {
  const orchestrator = getOrchestrator();
  const projectRoot = process.cwd();
  const featuresDir = path.join(projectRoot, 'setup', 'features');

  // Collect all features from selected presets
  const features = new Set();
  for (const preset of presets) {
    const config = PRESETS[preset];
    if (config) {
      config.features.forEach(f => features.add(f));
    }
  }

  // Apply each feature
  for (const feature of features) {
    const featureDir = path.join(featuresDir, feature);
    if (fs.existsSync(featureDir)) {
      // Copy feature files to project
      orchestrator.stageDirectory(featureDir, projectRoot);
    }
  }

  // Commit changes
  const result = orchestrator.commit();
  console.log(`Applied ${presets.join(', ')} preset(s): ${result.files.length} files`);
}

const presets = parsePresets();
applyPresets(presets).catch(err => {
  console.error('Setup failed:', err.message);
  process.exit(1);
});
