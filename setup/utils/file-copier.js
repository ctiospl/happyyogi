import fs from 'fs';
import path from 'path';

/**
 * Ensure a directory exists, creating it recursively if needed
 */
export function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Copy a file with optional template variable replacements
 * @param {string} src - Source file path
 * @param {string} dest - Destination file path
 * @param {Record<string, string>} [replacements] - Literal string replacements (key -> value)
 */
// Binary file extensions that should be copied without text processing
const BINARY_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.woff', '.woff2', '.ttf', '.eot', '.svg', '.pdf'];

/**
 * Check if path escapes the base directory (path traversal safety)
 */
function isPathOutsideBase(targetPath, basePath) {
  const relativePath = path.relative(basePath, targetPath);
  return relativePath.startsWith('..') || path.isAbsolute(relativePath);
}

export function copyWithReplacements(src, dest, replacements = {}) {
  const resolvedDest = path.resolve(dest);
  const basePath = path.resolve(process.cwd());

  // Secure path traversal check
  if (isPathOutsideBase(resolvedDest, basePath)) {
    throw new Error(`Destination path outside project: ${dest}`);
  }

  ensureDir(path.dirname(resolvedDest));

  const ext = path.extname(src).toLowerCase();
  const isBinary = BINARY_EXTENSIONS.includes(ext);

  if (isBinary) {
    // Binary files: raw copy, no text processing
    fs.copyFileSync(src, dest);
  } else {
    // Text files: apply replacements
    let content = fs.readFileSync(src, 'utf-8');
    for (const [key, value] of Object.entries(replacements)) {
      content = content.replaceAll(key, value);
    }
    fs.writeFileSync(resolvedDest, content);
  }
}

/**
 * Recursively copy all files from a feature directory to destination
 * @param {string} featurePath - Source feature directory
 * @param {string} destPath - Destination directory
 * @param {Record<string, string>} [replacements] - Template variables
 * @param {function(string): boolean} [fileFilter] - Optional filter function (return true to include)
 * @returns {string[]} - List of copied files
 */
export function copyFeatureFiles(featurePath, destPath, replacements = {}, fileFilter = null) {
  const copiedFiles = [];

  function copyDir(srcDir, destDir) {
    ensureDir(destDir);

    const entries = fs.readdirSync(srcDir, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(srcDir, entry.name);
      const destEntryPath = path.join(destDir, entry.name);

      if (entry.isDirectory()) {
        copyDir(srcPath, destEntryPath);
      } else {
        // Skip files that don't pass the filter
        if (fileFilter && !fileFilter(entry.name)) continue;
        copyWithReplacements(srcPath, destEntryPath, replacements);
        copiedFiles.push(destEntryPath);
      }
    }
  }

  if (fs.existsSync(featurePath)) {
    copyDir(featurePath, destPath);
  }

  return copiedFiles;
}

/**
 * Check if a path already exists
 */
export function pathExists(p) {
  return fs.existsSync(p);
}

/**
 * Detect file collisions (dest exists and differs from source)
 * @param {string} featurePath - Source feature directory
 * @param {string} destPath - Destination directory
 * @param {function(string): boolean} [fileFilter] - Optional filter
 * @returns {{ src: string, dest: string }[]} - List of collisions
 */
export function detectCollisions(featurePath, destPath, fileFilter = null) {
  const collisions = [];

  function checkDir(srcDir, destDir) {
    if (!fs.existsSync(srcDir)) return;

    const entries = fs.readdirSync(srcDir, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(srcDir, entry.name);
      const destEntryPath = path.join(destDir, entry.name);

      if (entry.isDirectory()) {
        checkDir(srcPath, destEntryPath);
      } else {
        if (fileFilter && !fileFilter(entry.name)) continue;

        if (fs.existsSync(destEntryPath)) {
          // Compare contents
          const ext = path.extname(srcPath).toLowerCase();
          const isBinary = BINARY_EXTENSIONS.includes(ext);

          if (isBinary) {
            // For binary, compare buffers
            const srcBuf = fs.readFileSync(srcPath);
            const destBuf = fs.readFileSync(destEntryPath);
            if (!srcBuf.equals(destBuf)) {
              collisions.push({ src: srcPath, dest: destEntryPath });
            }
          } else {
            // For text, compare strings
            const srcContent = fs.readFileSync(srcPath, 'utf-8');
            const destContent = fs.readFileSync(destEntryPath, 'utf-8');
            if (srcContent !== destContent) {
              collisions.push({ src: srcPath, dest: destEntryPath });
            }
          }
        }
      }
    }
  }

  checkDir(featurePath, destPath);
  return collisions;
}
