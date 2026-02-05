import fs from 'fs';
import path from 'path';
import { copyFeatureFiles } from '../utils/file-copier.js';

// Map setup.js values to feature folder names
const OTP_TYPE_MAP = {
  'sms-message-central': 'sms-messagecentral',
  'email-zeptomail': 'email-zeptomail'
};

// Filter: only copy .ts files
const CODE_FILES_FILTER = (name) => name.endsWith('.ts');

/**
 * Copy OTP files from features to src
 * @param {string[]} otpChannels - Array of OTP channels from setup prompts
 */
export function copyOtpFiles(otpChannels) {
  if (!otpChannels || otpChannels.length === 0) return;

  for (const channel of otpChannels) {
    const featureDir = OTP_TYPE_MAP[channel];
    if (!featureDir) {
      throw new Error(`Unknown OTP channel: ${channel}`);
    }

    const srcPath = path.join(process.cwd(), 'features', 'otp', featureDir);
    const destPath = path.join(process.cwd(), 'src', 'lib', 'server', 'otp');

    copyFeatureFiles(srcPath, destPath, {}, CODE_FILES_FILTER);
  }
}

/**
 * Get combined dependencies for all selected OTP channels
 * @param {string[]} otpChannels - Array of OTP channels
 * @returns {object} - { dependencies, devDependencies }
 */
export function getOtpDeps(otpChannels) {
  if (!otpChannels || otpChannels.length === 0) {
    return { dependencies: {}, devDependencies: {} };
  }

  const combined = { dependencies: {}, devDependencies: {} };

  for (const channel of otpChannels) {
    const featureDir = OTP_TYPE_MAP[channel];
    if (!featureDir) continue;

    const depsPath = path.join(process.cwd(), 'features', 'otp', featureDir, 'deps.json');
    try {
      const depsContent = fs.readFileSync(depsPath, 'utf-8');
      const deps = JSON.parse(depsContent);
      Object.assign(combined.dependencies, deps.dependencies || {});
      Object.assign(combined.devDependencies, deps.devDependencies || {});
    } catch {
      // deps.json is optional for OTP channels
    }
  }

  return combined;
}

/**
 * Get combined env vars for all selected OTP channels
 * @param {string[]} otpChannels - Array of OTP channels
 * @returns {object} - Env var definitions
 */
export function getOtpEnvVars(otpChannels) {
  if (!otpChannels || otpChannels.length === 0) return {};

  const combined = {};

  for (const channel of otpChannels) {
    const featureDir = OTP_TYPE_MAP[channel];
    if (!featureDir) continue;

    const envPath = path.join(process.cwd(), 'features', 'otp', featureDir, 'env.json');
    try {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      Object.assign(combined, JSON.parse(envContent));
    } catch {
      // env.json is optional
    }
  }

  return combined;
}
