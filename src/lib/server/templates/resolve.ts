/**
 * Resolve PageBlock[] (DB format) → PageContent (ContentBlock[] for PageRenderer)
 *
 * All templates are rendered through the sandboxed SSR pipeline.
 * No more KNOWN_SECTION_TYPES branching — every template produces HTML.
 */

import type { PageBlock } from '$lib/server/db/schema';
import type { PageContent, ContentBlock } from '$lib/types';
import { getTemplatesByIds } from './crud';
import { getFormById } from '$lib/server/forms';
import { renderInSandbox } from './sandbox';
import { sanitizeRenderedHtml } from './sanitize';

export interface ResolveResult {
	content: PageContent;
	extraCss: string;
}

/**
 * Convert PageBlock[] to PageContent for rendering by PageRenderer.
 * Batch-fetches templates, renders each through sandbox SSR.
 */
export async function resolvePageBlocks(blocks: PageBlock[]): Promise<ResolveResult> {
	if (blocks.length === 0) {
		return { content: { version: 1, blocks: [] }, extraCss: '' };
	}

	const templateIds = [...new Set(blocks.filter(b => b.template_id !== '__form__').map((b) => b.template_id))];
	const templates = await getTemplatesByIds(templateIds);
	const templateMap = new Map(templates.map((t) => [t.id, t]));

	const cssParts: string[] = [];
	const contentBlocks: ContentBlock[] = [];

	for (let i = 0; i < blocks.length; i++) {
		const block = blocks[i];

		// Handle form blocks
		if (block.template_id === '__form__') {
			const formId = block.props.form_id as string;
			if (formId) {
				const form = await getFormById(formId);
				if (form) {
					contentBlocks.push({
						type: 'form',
						id: block.id,
						order: i,
						form_id: form.id,
						fields: form.fields,
						settings: form.settings,
						conditional_rules: form.conditional_rules
					} as ContentBlock);
				}
			}
			continue;
		}

		const template = templateMap.get(block.template_id);
		if (!template) continue;

		// If template has a compiled SSR bundle, render via sandbox
		if (template.compiled_js) {
			const result = await renderInSandbox(
				template.compiled_js,
				{ context: {}, props: block.props }
			);

			if (!result.error) {
				contentBlocks.push({
					type: 'html',
					id: block.id,
					order: i,
					html: sanitizeRenderedHtml(result.html),
					css: result.css || undefined,
					templateId: template.id,
					clientJs: template.compiled_client_js || undefined,
					hydrationProps: block.props
				} as ContentBlock);

				if (result.css) cssParts.push(result.css);
				if (template.compiled_css) cssParts.push(template.compiled_css);
				continue;
			}
			// Fall through to fallback if sandbox errored
			console.warn(`Sandbox render failed for template ${template.slug}:`, result.error);
		}

		// Fallback: pass as html block with empty content
		contentBlocks.push({
			type: 'html',
			id: block.id,
			order: i,
			html: `<!-- Template "${template.slug}" not compiled -->`
		} as ContentBlock);
	}

	return {
		content: { version: 1, blocks: contentBlocks },
		extraCss: cssParts.join('\n')
	};
}
