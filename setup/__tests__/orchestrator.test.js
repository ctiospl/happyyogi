import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { getOrchestrator, resetOrchestrator } from '../utils/orchestrator.js';

const TEST_DIR = path.join(process.cwd(), 'test-orchestrator');

describe('orchestrator', () => {
	beforeEach(() => {
		resetOrchestrator();
		fs.mkdirSync(TEST_DIR, { recursive: true });
	});

	afterEach(() => {
		resetOrchestrator();
		if (fs.existsSync(TEST_DIR)) {
			fs.rmSync(TEST_DIR, { recursive: true, force: true });
		}
	});

	it('should stage and commit files', () => {
		const orch = getOrchestrator();
		const filePath = path.join(TEST_DIR, 'new-file.txt');

		orch.stageFile(filePath, 'hello world');
		expect(fs.existsSync(filePath)).toBe(false);

		const result = orch.commit();

		expect(fs.existsSync(filePath)).toBe(true);
		expect(fs.readFileSync(filePath, 'utf-8')).toBe('hello world');
		expect(result.files).toContain(filePath);
	});

	it('should stage and create directories', () => {
		const orch = getOrchestrator();
		const dirPath = path.join(TEST_DIR, 'new', 'nested', 'dir');

		orch.stageDir(dirPath);
		expect(fs.existsSync(dirPath)).toBe(false);

		orch.commit();

		expect(fs.existsSync(dirPath)).toBe(true);
	});

	it('should rollback created files', () => {
		const orch = getOrchestrator();
		const filePath = path.join(TEST_DIR, 'rollback-test.txt');

		orch.stageFile(filePath, 'will be rolled back');
		orch.commit();

		expect(fs.existsSync(filePath)).toBe(true);

		orch.rollback();

		expect(fs.existsSync(filePath)).toBe(false);
	});

	it('should restore original file on rollback', () => {
		const orch = getOrchestrator();
		const filePath = path.join(TEST_DIR, 'existing.txt');

		// Create original file
		fs.writeFileSync(filePath, 'original content');

		// Stage modification
		orch.stageFile(filePath, 'modified content');
		orch.commit();

		expect(fs.readFileSync(filePath, 'utf-8')).toBe('modified content');

		// Rollback
		orch.rollback();

		expect(fs.readFileSync(filePath, 'utf-8')).toBe('original content');
	});

	it('should stage directory with replacements', () => {
		const orch = getOrchestrator();

		// Create source directory
		const srcDir = path.join(TEST_DIR, 'src');
		fs.mkdirSync(srcDir, { recursive: true });
		fs.writeFileSync(path.join(srcDir, 'template.ts'), 'name = "{{NAME}}"');

		const destDir = path.join(TEST_DIR, 'dest');

		orch.stageDirectory(srcDir, destDir, { NAME: 'my-project' });
		orch.commit();

		const content = fs.readFileSync(path.join(destDir, 'template.ts'), 'utf-8');
		expect(content).toBe('name = "my-project"');
	});
});
