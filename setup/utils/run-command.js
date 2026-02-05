import spawn from 'cross-spawn';

const DEFAULT_TIMEOUT = 5 * 60 * 1000; // 5 minutes

/**
 * Run a command with cross-platform support
 * @param {string} command - Command to run
 * @param {string[]} args - Arguments
 * @param {{ cwd?: string, timeout?: number, stdio?: import('child_process').StdioOptions }} options
 * @returns {Promise<{ code: number, signal?: string }>}
 */
export function runCommand(command, args = [], options = {}) {
  const { cwd, timeout = DEFAULT_TIMEOUT, stdio = 'inherit' } = options;

  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, stdio });

    let timeoutId;
    if (timeout > 0) {
      timeoutId = setTimeout(() => {
        child.kill('SIGTERM');
        reject(new Error(`Command timed out after ${timeout}ms: ${command} ${args.join(' ')}`));
      }, timeout);
    }

    child.on('error', (err) => {
      if (timeoutId) clearTimeout(timeoutId);
      reject(err);
    });

    child.on('close', (code, signal) => {
      if (timeoutId) clearTimeout(timeoutId);
      if (signal === 'SIGTERM') {
        // Already handled by timeout
        return;
      }
      if (code !== 0) {
        reject(new Error(`Command failed with exit code ${code}: ${command} ${args.join(' ')}`));
      } else {
        resolve({ code, signal });
      }
    });
  });
}
