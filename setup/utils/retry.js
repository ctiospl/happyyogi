// Simple retry wrapper for network operations

const NETWORK_ERROR_CODES = ['ENOTFOUND', 'ECONNREFUSED', 'ETIMEDOUT'];

/**
 * Retry async function on network errors
 * @param {() => Promise<T>} fn - Async function to retry
 * @param {number} maxAttempts - Total attempts (default 3)
 * @param {number} delay - Delay between retries in ms
 * @returns {Promise<T>}
 */
export async function retryAsync(fn, maxAttempts = 3, delay = 1000) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      return await fn();
    } catch (err) {
      const code = err.code || err.cause?.code;
      const isNetworkError = NETWORK_ERROR_CODES.includes(code);
      if (!isNetworkError || i === maxAttempts - 1) throw err;
      await new Promise(r => setTimeout(r, delay));
    }
  }
}
