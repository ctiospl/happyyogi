import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { getEnvGenerator, addEnvVars, generateEnvExample, resetEnvGenerator } from '../utils/env-generator.js';

const TEST_ENV_PATH = path.join(process.cwd(), 'test.env.example');

describe('env-generator', () => {
  beforeEach(() => {
    resetEnvGenerator();
  });

  afterEach(() => {
    resetEnvGenerator();
    if (fs.existsSync(TEST_ENV_PATH)) {
      fs.unlinkSync(TEST_ENV_PATH);
    }
  });

  it('should accumulate env vars', () => {
    const gen = getEnvGenerator();

    gen.addEnvVars({
      DATABASE_URL: { description: 'Database connection string', example: 'postgres://...' }
    });

    gen.addEnvVars({
      API_KEY: { description: 'API key', example: 'sk-xxx' }
    });

    expect(gen.vars.size).toBe(2);
  });

  it('should generate env content with comments', () => {
    addEnvVars({
      MY_VAR: { description: 'My variable', example: 'value123' }
    });

    const gen = getEnvGenerator();
    const content = gen.generateContent();

    expect(content).toContain('# My variable');
    expect(content).toContain('MY_VAR=value123');
  });

  it('should write .env.example file', () => {
    addEnvVars({
      TEST_VAR: { description: 'Test var', example: 'test' }
    });

    generateEnvExample(TEST_ENV_PATH);

    expect(fs.existsSync(TEST_ENV_PATH)).toBe(true);
    const content = fs.readFileSync(TEST_ENV_PATH, 'utf-8');
    expect(content).toContain('TEST_VAR=test');
  });

  it('should reset vars', () => {
    const gen = getEnvGenerator();
    gen.addEnvVars({ FOO: { example: 'bar' } });
    expect(gen.vars.size).toBe(1);

    resetEnvGenerator();
    expect(gen.vars.size).toBe(0);
  });
});
