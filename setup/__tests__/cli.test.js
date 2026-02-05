import { describe, test, expect } from 'vitest';
import { exec } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const execAsync = promisify(exec);
const __dirname = dirname(fileURLToPath(import.meta.url));
const cliPath = join(__dirname, '..', 'index.js');

describe('CLI', () => {
  test('--help shows usage', async () => {
    const { stdout } = await execAsync(`node ${cliPath} --help`);
    expect(stdout).toContain('Usage:');
    expect(stdout).toContain('--preset');
    expect(stdout).toContain('--help');
    expect(stdout).toContain('--version');
  });

  test('-h shows usage (short flag)', async () => {
    const { stdout } = await execAsync(`node ${cliPath} -h`);
    expect(stdout).toContain('Usage:');
  });

  test('--version outputs version', async () => {
    const { stdout } = await execAsync(`node ${cliPath} --version`);
    expect(stdout).toMatch(/create-asamkhya v\d+\.\d+\.\d+/);
  });

  test('-v outputs version (short flag)', async () => {
    const { stdout } = await execAsync(`node ${cliPath} -v`);
    expect(stdout).toMatch(/create-asamkhya v\d+\.\d+\.\d+/);
  });

  describe('project name validation', () => {
    test('rejects uppercase letters', async () => {
      await expect(
        execAsync(`node ${cliPath} MyProject --skip-install`)
      ).rejects.toThrow();
    });

    test('rejects names ending with hyphen', async () => {
      await expect(
        execAsync(`node ${cliPath} my-project- --skip-install`)
      ).rejects.toThrow();
    });

    test('rejects names with special characters', async () => {
      await expect(
        execAsync(`node ${cliPath} my_project --skip-install`)
      ).rejects.toThrow();
    });

    test('rejects reserved name node_modules', async () => {
      await expect(
        execAsync(`node ${cliPath} node_modules --skip-install`)
      ).rejects.toThrow();
    });
  });
});
