import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { ensureDir, copyWithReplacements, copyFeatureFiles, pathExists } from '../utils/file-copier.js';

const TEST_DIR = path.join(process.cwd(), 'test-file-copier');

describe('file-copier', () => {
  beforeEach(() => {
    // Create test directory structure
    fs.mkdirSync(path.join(TEST_DIR, 'src'), { recursive: true });
    fs.writeFileSync(
      path.join(TEST_DIR, 'src', 'template.ts'),
      'const name = "{{PROJECT_NAME}}";'
    );
    fs.writeFileSync(
      path.join(TEST_DIR, 'src', 'plain.ts'),
      'const x = 1;'
    );
  });

  afterEach(() => {
    if (fs.existsSync(TEST_DIR)) {
      fs.rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  it('should create directory if not exists', () => {
    const newDir = path.join(TEST_DIR, 'new', 'nested', 'dir');
    ensureDir(newDir);
    expect(fs.existsSync(newDir)).toBe(true);
  });

  it('should copy file with replacements', () => {
    const src = path.join(TEST_DIR, 'src', 'template.ts');
    const dest = path.join(TEST_DIR, 'dest', 'template.ts');

    // Literal string replacement: key is the exact string to find
    copyWithReplacements(src, dest, { '{{PROJECT_NAME}}': 'my-app' });

    const content = fs.readFileSync(dest, 'utf-8');
    expect(content).toBe('const name = "my-app";');
  });

  it('should copy directory recursively', () => {
    const destDir = path.join(TEST_DIR, 'dest');

    const copied = copyFeatureFiles(
      path.join(TEST_DIR, 'src'),
      destDir,
      { '{{PROJECT_NAME}}': 'test-project' }
    );

    expect(copied.length).toBe(2);
    expect(fs.existsSync(path.join(destDir, 'template.ts'))).toBe(true);
    expect(fs.existsSync(path.join(destDir, 'plain.ts'))).toBe(true);
  });

  it('should check path existence', () => {
    expect(pathExists(TEST_DIR)).toBe(true);
    expect(pathExists(path.join(TEST_DIR, 'nonexistent'))).toBe(false);
  });
});
