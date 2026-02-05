import fs from 'fs';
import path from 'path';
import { copyFeatureFiles } from '../utils/file-copier.js';

const CODE_FILES_FILTER = (name) => name.endsWith('.ts');

export function copyStorageFiles(storageOptions) {
	if (!storageOptions || storageOptions.length === 0) return;

	const destPath = path.join(process.cwd(), 'src', 'lib', 'server', 'storage');

	// Copy shared types first
	const sharedSrc = path.join(process.cwd(), 'features', 'storage', '_shared');
	copyFeatureFiles(sharedSrc, destPath, {}, CODE_FILES_FILTER);

	for (const option of storageOptions) {
		const srcPath = path.join(process.cwd(), 'features', 'storage', option);
		copyFeatureFiles(srcPath, destPath, {}, CODE_FILES_FILTER);

		// Copy routes if local storage
		if (option === 'local') {
			const routeSrc = path.join(srcPath, 'routes');
			if (fs.existsSync(routeSrc)) {
				const routeDest = path.join(process.cwd(), 'src', 'routes');
				copyFeatureFiles(
					routeSrc,
					routeDest,
					{
						'$lib/server/storage': '$lib/server/storage'
					},
					CODE_FILES_FILTER
				);
			}
		}
	}
}

export function getStorageDeps(storageOptions) {
	if (!storageOptions || storageOptions.length === 0) return { dependencies: {}, devDependencies: {} };

	const combined = { dependencies: {}, devDependencies: {} };

	for (const option of storageOptions) {
		const depsPath = path.join(process.cwd(), 'features', 'storage', option, 'deps.json');
		try {
			const deps = JSON.parse(fs.readFileSync(depsPath, 'utf-8'));
			Object.assign(combined.dependencies, deps.dependencies || {});
			Object.assign(combined.devDependencies, deps.devDependencies || {});
		} catch {}
	}

	return combined;
}

export function getStorageEnvVars(storageOptions) {
	if (!storageOptions || storageOptions.length === 0) return {};

	const combined = {};

	for (const option of storageOptions) {
		const envPath = path.join(process.cwd(), 'features', 'storage', option, 'env.json');
		try {
			Object.assign(combined, JSON.parse(fs.readFileSync(envPath, 'utf-8')));
		} catch {}
	}

	return combined;
}
