import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';

// We'll test the functions with a mock package.json
const TEST_PKG_PATH = path.join(process.cwd(), 'test-package.json');

describe('package-modifier', () => {
	beforeEach(() => {
		// Create test package.json
		const testPkg = {
			name: 'test',
			dependencies: { 'existing-dep': '^1.0.0' },
			devDependencies: { 'existing-dev': '^1.0.0' }
		};
		fs.writeFileSync(TEST_PKG_PATH, JSON.stringify(testPkg, null, 2));
	});

	afterEach(() => {
		if (fs.existsSync(TEST_PKG_PATH)) {
			fs.unlinkSync(TEST_PKG_PATH);
		}
	});

	it('should read package.json', async () => {
		// Use dynamic import to get fresh module
		const { readPackageJson } = await import('../utils/package-modifier.js');
		const pkg = readPackageJson();
		expect(pkg.name).toBe('create-asamkhya');
	});

	it('should add dependencies alphabetically', async () => {
		const { readPackageJson, addDependencies } = await import('../utils/package-modifier.js');
		const before = readPackageJson();
		const originalDeps = { ...before.dependencies };

		addDependencies({ 'new-package': '^2.0.0', 'another-package': '^1.0.0' });

		const after = readPackageJson();
		expect(after.dependencies['new-package']).toBe('^2.0.0');
		expect(after.dependencies['another-package']).toBe('^1.0.0');

		// Verify alphabetical order
		const keys = Object.keys(after.dependencies);
		const sortedKeys = [...keys].sort();
		expect(keys).toEqual(sortedKeys);

		// Cleanup: restore original
		after.dependencies = originalDeps;
		const { writePackageJson } = await import('../utils/package-modifier.js');
		writePackageJson(after);
	});
});
