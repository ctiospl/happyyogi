import type { getTenantTemplates } from './crud';

type Template = Awaited<ReturnType<typeof getTenantTemplates>>[number];

interface BlockInput {
	template_id: string;
	props?: Record<string, unknown>;
	[key: string]: unknown;
}

interface ValidationResult {
	ok: boolean;
	error?: string;
}

/**
 * Validate page/layout blocks reference existing templates.
 * __form__ is a special built-in block type.
 */
export function validateBlocks(
	blocks: BlockInput[],
	templates: Template[]
): ValidationResult {
	const templateIds = new Set(templates.map((t) => t.id));

	for (const block of blocks) {
		if (!block.template_id) continue; // skip blocks without template_id (raw html, etc)
		if (block.template_id === '__form__') continue;
		if (!templateIds.has(block.template_id)) {
			return { ok: false, error: `Unknown template: ${block.template_id}` };
		}
	}

	return { ok: true };
}
