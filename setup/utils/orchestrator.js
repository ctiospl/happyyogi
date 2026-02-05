import fs from 'fs';
import path from 'path';

/**
 * Escape special regex characters in a string
 * @param {string} str
 * @returns {string}
 */
function escapeRegex(str) {
	return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Setup Orchestrator
 * Manages staging area for changes, commits on success, rollback on failure
 */
class SetupOrchestrator {
	constructor() {
		this.stagedFiles = new Map(); // path -> content
		this.stagedDirs = new Set(); // directories to create
		this.originalFiles = new Map(); // path -> original content (for rollback)
		this.createdFiles = []; // files created during commit
		this.createdDirs = []; // dirs created during commit
	}

	/**
	 * Stage a file to be written
	 * @param {string} filePath - Absolute path
	 * @param {string} content - File content
	 */
	stageFile(filePath, content) {
		// Backup original if exists
		if (fs.existsSync(filePath) && !this.originalFiles.has(filePath)) {
			this.originalFiles.set(filePath, fs.readFileSync(filePath, 'utf-8'));
		}
		this.stagedFiles.set(filePath, content);
	}

	/**
	 * Stage a directory to be created
	 * @param {string} dirPath - Absolute path
	 */
	stageDir(dirPath) {
		this.stagedDirs.add(dirPath);
	}

	/**
	 * Stage multiple files from a source directory
	 * @param {string} srcDir - Source directory
	 * @param {string} destDir - Destination directory
	 * @param {Record<string, string>} [replacements] - Template replacements
	 */
	stageDirectory(srcDir, destDir, replacements = {}) {
		if (!fs.existsSync(srcDir)) return;

		const processDir = (src, dest) => {
			this.stageDir(dest);
			const entries = fs.readdirSync(src, { withFileTypes: true });

			for (const entry of entries) {
				const srcPath = path.join(src, entry.name);
				const destPath = path.join(dest, entry.name);

				if (entry.isDirectory()) {
					processDir(srcPath, destPath);
				} else {
					let content = fs.readFileSync(srcPath, 'utf-8');
					for (const [key, value] of Object.entries(replacements)) {
						content = content.replace(new RegExp(`\\{\\{${escapeRegex(key)}\\}\\}`, 'g'), value);
					}
					this.stageFile(destPath, content);
				}
			}
		};

		processDir(srcDir, destDir);
	}

	/**
	 * Commit all staged changes
	 * @returns {{ files: string[], dirs: string[] }}
	 */
	commit() {
		// Create directories first
		for (const dirPath of this.stagedDirs) {
			if (!fs.existsSync(dirPath)) {
				fs.mkdirSync(dirPath, { recursive: true });
				this.createdDirs.push(dirPath);
			}
		}

		// Write files
		for (const [filePath, content] of this.stagedFiles) {
			const dir = path.dirname(filePath);
			if (!fs.existsSync(dir)) {
				fs.mkdirSync(dir, { recursive: true });
				this.createdDirs.push(dir);
			}
			fs.writeFileSync(filePath, content);
			this.createdFiles.push(filePath);
		}

		const result = {
			files: [...this.createdFiles],
			dirs: [...this.createdDirs]
		};

		// Clear staging area but keep rollback info
		this.stagedFiles.clear();
		this.stagedDirs.clear();

		return result;
	}

	/**
	 * Rollback all committed changes
	 */
	rollback() {
		// Restore original files
		for (const [filePath, content] of this.originalFiles) {
			fs.writeFileSync(filePath, content);
		}

		// Delete created files (that weren't originals)
		for (const filePath of this.createdFiles) {
			if (!this.originalFiles.has(filePath) && fs.existsSync(filePath)) {
				fs.unlinkSync(filePath);
			}
		}

		// Delete created directories (reverse order for nested)
		const sortedDirs = [...this.createdDirs].sort((a, b) => b.length - a.length);
		for (const dirPath of sortedDirs) {
			if (fs.existsSync(dirPath)) {
				try {
					fs.rmdirSync(dirPath); // Only removes empty dirs
				} catch {
					// Directory not empty, skip
				}
			}
		}

		this.clear();
	}

	/**
	 * Clear staging area
	 */
	clear() {
		this.stagedFiles.clear();
		this.stagedDirs.clear();
		this.originalFiles.clear();
		this.createdFiles = [];
		this.createdDirs = [];
	}

	/**
	 * Get count of staged items
	 */
	getStagedCount() {
		return {
			files: this.stagedFiles.size,
			dirs: this.stagedDirs.size
		};
	}
}

// Singleton
let instance = null;

export function getOrchestrator() {
	if (!instance) {
		instance = new SetupOrchestrator();
	}
	return instance;
}

export function resetOrchestrator() {
	if (instance) {
		instance.clear();
	}
	instance = null;
}
