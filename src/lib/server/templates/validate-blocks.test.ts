import { describe, it, expect } from 'vitest';
import { validateBlocks } from './validate-blocks';

describe('validateBlocks', () => {
	const templates = [
		{ id: 'tpl-1', slug: 'hero' },
		{ id: 'tpl-2', slug: 'cta' }
	] as any[];

	it('accepts valid template_id references', () => {
		expect(
			validateBlocks(
				[{ template_id: 'tpl-1', props: {} }, { template_id: 'tpl-2', props: {} }],
				templates
			)
		).toEqual({ ok: true });
	});

	it('rejects unknown template_id', () => {
		const result = validateBlocks(
			[{ template_id: 'missing', props: {} }],
			templates
		);
		expect(result.ok).toBe(false);
		expect(result.error).toContain('missing');
	});

	it('allows __form__ blocks', () => {
		expect(
			validateBlocks([{ template_id: '__form__', props: {} }], templates)
		).toEqual({ ok: true });
	});

	it('skips blocks without template_id', () => {
		expect(
			validateBlocks([{ template_id: '', props: {} }], templates)
		).toEqual({ ok: true });
	});

	it('passes with empty blocks array', () => {
		expect(validateBlocks([], templates)).toEqual({ ok: true });
	});
});
