import { describe, it, expect } from 'vitest';
import { validateSchema } from './validate-schema';

describe('validateSchema', () => {
	it('accepts valid schema', () => {
		expect(
			validateSchema({ fields: [{ key: 'title', type: 'text', label: 'Title' }, { key: 'cta', type: 'text', label: 'CTA' }] })
		).toEqual({ ok: true });
	});

	it('rejects duplicate keys', () => {
		const result = validateSchema({
			fields: [
				{ key: 'a', type: 'text', label: 'A' },
				{ key: 'a', type: 'text', label: 'B' }
			]
		});
		expect(result.ok).toBe(false);
		expect(result.error).toContain('Duplicate');
	});

	it('rejects empty key', () => {
		const result = validateSchema({ fields: [{ key: '', type: 'text', label: 'X' }] });
		expect(result.ok).toBe(false);
	});

	it('rejects invalid key characters', () => {
		const result = validateSchema({ fields: [{ key: '123abc', type: 'text', label: 'X' }] });
		expect(result.ok).toBe(false);
		expect(result.error).toContain('Invalid key');
	});

	it('accepts underscore-prefixed keys', () => {
		expect(
			validateSchema({ fields: [{ key: '_internal', type: 'text', label: 'X' }] })
		).toEqual({ ok: true });
	});

	it('passes with empty fields', () => {
		expect(validateSchema({ fields: [] })).toEqual({ ok: true });
	});
});
