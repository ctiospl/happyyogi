import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { detectPackageManager } from '../utils/package-manager.js';

describe('detectPackageManager', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  test('detects pnpm from user agent', () => {
    process.env.npm_config_user_agent = 'pnpm/8.6.0 npm/? node/v18.16.0';
    expect(detectPackageManager()).toBe('pnpm');
  });

  test('detects yarn from user agent', () => {
    process.env.npm_config_user_agent = 'yarn/1.22.19 npm/? node/v18.16.0';
    expect(detectPackageManager()).toBe('yarn');
  });

  test('detects bun from user agent', () => {
    process.env.npm_config_user_agent = 'bun/1.0.0';
    expect(detectPackageManager()).toBe('bun');
  });

  test('detects npm from user agent', () => {
    process.env.npm_config_user_agent = 'npm/9.5.1 node/v18.16.0';
    expect(detectPackageManager()).toBe('npm');
  });

  test('defaults to npm when no user agent', () => {
    delete process.env.npm_config_user_agent;
    expect(detectPackageManager()).toBe('npm');
  });

  test('defaults to npm when empty user agent', () => {
    process.env.npm_config_user_agent = '';
    expect(detectPackageManager()).toBe('npm');
  });

  test('pnpm takes priority in mixed user agent', () => {
    process.env.npm_config_user_agent = 'pnpm/8.6.0 yarn/1.22.0 npm/? node/v18.16.0';
    expect(detectPackageManager()).toBe('pnpm');
  });
});
