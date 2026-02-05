import { describe, test, expect, vi } from 'vitest';
import { retryAsync } from '../utils/retry.js';

describe('retryAsync', () => {
  test('returns result on first success', async () => {
    const fn = vi.fn().mockResolvedValue('success');
    const result = await retryAsync(fn, 3, 10);
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('retries on ENOTFOUND error', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce({ code: 'ENOTFOUND' })
      .mockResolvedValue('success');

    const result = await retryAsync(fn, 3, 10);
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  test('retries on ECONNREFUSED error', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce({ code: 'ECONNREFUSED' })
      .mockResolvedValue('success');

    const result = await retryAsync(fn, 3, 10);
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  test('retries on ETIMEDOUT error', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce({ code: 'ETIMEDOUT' })
      .mockResolvedValue('success');

    const result = await retryAsync(fn, 3, 10);
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  test('retries on error with cause.code', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce({ cause: { code: 'ENOTFOUND' } })
      .mockResolvedValue('success');

    const result = await retryAsync(fn, 3, 10);
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  test('throws immediately on non-network error', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('other error'));

    await expect(retryAsync(fn, 3, 10)).rejects.toThrow('other error');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('throws after max attempts exhausted', async () => {
    const fn = vi.fn().mockRejectedValue({ code: 'ENOTFOUND' });

    await expect(retryAsync(fn, 3, 10)).rejects.toEqual({ code: 'ENOTFOUND' });
    expect(fn).toHaveBeenCalledTimes(3);
  });

  test('respects custom maxAttempts', async () => {
    const fn = vi.fn().mockRejectedValue({ code: 'ENOTFOUND' });

    await expect(retryAsync(fn, 5, 10)).rejects.toEqual({ code: 'ENOTFOUND' });
    expect(fn).toHaveBeenCalledTimes(5);
  });

  test('waits between retries', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce({ code: 'ENOTFOUND' })
      .mockResolvedValue('success');

    const start = Date.now();
    await retryAsync(fn, 3, 50);
    const elapsed = Date.now() - start;

    expect(elapsed).toBeGreaterThanOrEqual(45); // allow some timing variance
  });

  test('uses default values when not specified', async () => {
    const fn = vi.fn().mockResolvedValue('success');
    const result = await retryAsync(fn);
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
