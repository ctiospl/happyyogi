import fs from 'fs';
import path from 'path';

const STATE_FILE = '.setup-state.json';
const STATE_PATH = path.join(process.cwd(), STATE_FILE);

/**
 * Load existing setup state
 * @returns {object|null} State object or null if not found
 */
export function loadState() {
	try {
		const content = fs.readFileSync(STATE_PATH, 'utf-8');
		return JSON.parse(content);
	} catch (error) {
		if (error.code === 'ENOENT') return null;
		if (error instanceof SyntaxError) {
			console.warn(`Warning: Malformed ${STATE_FILE}, ignoring`);
			return null;
		}
		throw error;
	}
}

/**
 * Save setup state
 * @param {object} config - Setup configuration
 * @param {string[]} createdFiles - Files created during setup
 * @param {object} addedDeps - Dependencies added { name: version }
 */
export function saveState(config, createdFiles, addedDeps) {
	const state = {
		version: '1.0.0',
		installedAt: new Date().toISOString(),
		config,
		files: {
			created: createdFiles
		},
		dependencies: {
			added: addedDeps
		}
	};
	fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, '\t') + '\n');
}

/**
 * Get installed features from state
 * @returns {object|null} Config object or null
 */
export function getInstalledFeatures() {
	const state = loadState();
	return state?.config || null;
}

/**
 * Get list of created files from state
 * @returns {string[]} File paths
 */
export function getCreatedFiles() {
	const state = loadState();
	return state?.files?.created || [];
}

/**
 * Get added dependencies from state
 * @returns {object} Dependencies { name: version }
 */
export function getAddedDependencies() {
	const state = loadState();
	return state?.dependencies?.added || {};
}

/**
 * Remove state file
 */
export function removeState() {
	if (fs.existsSync(STATE_PATH)) {
		fs.unlinkSync(STATE_PATH);
	}
}

/**
 * Check if state file exists
 */
export function hasState() {
	return fs.existsSync(STATE_PATH);
}
