import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { validateProjectName, parseArgs } from '../utils/args.js';

describe('validateProjectName', () => {
  test('rejects empty name', () => {
    expect(validateProjectName('')).toBe('Project name required');
  });

  test('rejects undefined', () => {
    expect(validateProjectName(undefined)).toBe('Project name required');
  });

  test('accepts valid lowercase name', () => {
    expect(validateProjectName('my-app')).toBe(null);
  });

  test('accepts lowercase with numbers', () => {
    expect(validateProjectName('app123')).toBe(null);
  });

  test('accepts name with hyphens', () => {
    expect(validateProjectName('my-cool-app')).toBe(null);
  });

  test('rejects uppercase letters', () => {
    expect(validateProjectName('MyApp')).toBe('Use lowercase, numbers, hyphens only');
  });

  test('rejects underscores', () => {
    expect(validateProjectName('my_app')).toBe('Use lowercase, numbers, hyphens only');
  });

  test('rejects spaces', () => {
    expect(validateProjectName('my app')).toBe('Use lowercase, numbers, hyphens only');
  });

  test('rejects special characters', () => {
    expect(validateProjectName('my@app')).toBe('Use lowercase, numbers, hyphens only');
  });

  test('rejects name starting with hyphen', () => {
    expect(validateProjectName('-myapp')).toBe('Cannot start with hyphen');
  });

  test('rejects name ending with hyphen', () => {
    expect(validateProjectName('myapp-')).toBe('Cannot end with hyphen');
  });

  test('rejects consecutive hyphens', () => {
    expect(validateProjectName('my--app')).toBe('No consecutive hyphens');
  });

  test('rejects reserved name node_modules', () => {
    expect(validateProjectName('node_modules')).toBe('Use lowercase, numbers, hyphens only');
  });

  test('rejects reserved name .git', () => {
    expect(validateProjectName('.git')).toBe('Use lowercase, numbers, hyphens only');
  });

  test('rejects reserved name ..', () => {
    expect(validateProjectName('..')).toBe('Use lowercase, numbers, hyphens only');
  });

  test('rejects reserved name .', () => {
    expect(validateProjectName('.')).toBe('Use lowercase, numbers, hyphens only');
  });

  test('rejects name longer than 214 chars', () => {
    const longName = 'a'.repeat(215);
    expect(validateProjectName(longName)).toBe('Max 214 characters');
  });

  test('accepts name exactly 214 chars', () => {
    const maxName = 'a'.repeat(214);
    expect(validateProjectName(maxName)).toBe(null);
  });
});

describe('parseArgs presets', () => {
  let originalArgv;

  beforeEach(() => {
    originalArgv = process.argv;
  });

  afterEach(() => {
    process.argv = originalArgv;
  });

  test('parses single preset', () => {
    process.argv = ['node', 'index.js', '--preset', 'saas'];
    const { presets } = parseArgs();
    expect(presets).toEqual(['saas']);
  });

  test('parses comma-separated presets', () => {
    process.argv = ['node', 'index.js', '--preset', 'saas,ai'];
    const { presets } = parseArgs();
    expect(presets).toEqual(['saas', 'ai']);
  });

  test('parses multiple --preset flags', () => {
    process.argv = ['node', 'index.js', '--preset', 'saas', '--preset', 'ai'];
    const { presets } = parseArgs();
    expect(presets).toEqual(['saas', 'ai']);
  });

  test('deduplicates presets', () => {
    process.argv = ['node', 'index.js', '--preset', 'saas,saas,ai'];
    const { presets } = parseArgs();
    expect(presets).toEqual(['saas', 'ai']);
  });

  test('filters invalid presets', () => {
    process.argv = ['node', 'index.js', '--preset', 'saas,invalid,ai'];
    const { presets } = parseArgs();
    expect(presets).toEqual(['saas', 'ai']);
  });

  test('returns empty array when no presets', () => {
    process.argv = ['node', 'index.js', 'my-app'];
    const { presets } = parseArgs();
    expect(presets).toEqual([]);
  });
});
