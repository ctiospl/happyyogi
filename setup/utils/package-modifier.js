import fs from 'fs';
import path from 'path';

const PACKAGE_JSON_PATH = path.join(process.cwd(), 'package.json');

export function readPackageJson() {
	try {
		const content = fs.readFileSync(PACKAGE_JSON_PATH, 'utf-8');
		return JSON.parse(content);
	} catch (error) {
		if (error.code === 'ENOENT') {
			throw new Error('package.json not found in current directory');
		} else if (error instanceof SyntaxError) {
			throw new Error('package.json is malformed: ' + error.message);
		}
		throw error;
	}
}

export function writePackageJson(pkg) {
	fs.writeFileSync(PACKAGE_JSON_PATH, JSON.stringify(pkg, null, '\t') + '\n');
}

export function addDependencies(deps) {
	const pkg = readPackageJson();
	pkg.dependencies = { ...pkg.dependencies, ...deps };
	// Sort dependencies alphabetically
	pkg.dependencies = Object.fromEntries(
		Object.entries(pkg.dependencies).sort(([a], [b]) => a.localeCompare(b))
	);
	writePackageJson(pkg);
}

export function addDevDependencies(deps) {
	const pkg = readPackageJson();
	pkg.devDependencies = { ...pkg.devDependencies, ...deps };
	// Sort dependencies alphabetically
	pkg.devDependencies = Object.fromEntries(
		Object.entries(pkg.devDependencies).sort(([a], [b]) => a.localeCompare(b))
	);
	writePackageJson(pkg);
}

export function removeDependencies(names) {
	const pkg = readPackageJson();
	for (const name of names) {
		delete pkg.dependencies?.[name];
		delete pkg.devDependencies?.[name];
	}
	writePackageJson(pkg);
}
