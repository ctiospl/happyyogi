/**
 * Resolve PageBlock[] (DB format) → PageContent (ContentBlock[] for PageRenderer)
 *
 * PageBlock stores {id, template_id, props}.
 * ContentBlock stores {type, id, ...props} where type = template slug.
 * This module bridges them by batch-fetching templates and mapping.
 */

import type { PageBlock } from '$lib/server/db/schema';
import type { PageContent, ContentBlock } from '$lib/types';
import { getTemplatesByIds, extractStyleBlock, extractHtmlMarkup } from './crud';

/** Known section types that PageRenderer has dedicated components for */
const KNOWN_SECTION_TYPES = new Set([
	'hero', 'services-grid', 'about-snippet', 'instructor-grid',
	'testimonial-carousel', 'cta-banner', 'values-grid', 'story', 'html'
]);

export interface ResolveResult {
	content: PageContent;
	extraCss: string;
}

/**
 * Convert PageBlock[] to PageContent for rendering by PageRenderer.
 * Batch-fetches templates, maps template slug → block type, merges props.
 */
export async function resolvePageBlocks(blocks: PageBlock[]): Promise<ResolveResult> {
	if (blocks.length === 0) {
		return { content: { version: 1, blocks: [] }, extraCss: '' };
	}

	const templateIds = [...new Set(blocks.map((b) => b.template_id))];
	const templates = await getTemplatesByIds(templateIds);
	const templateMap = new Map(templates.map((t) => [t.id, t]));

	const cssParts: string[] = [];
	const contentBlocks: ContentBlock[] = [];

	for (let i = 0; i < blocks.length; i++) {
		const block = blocks[i];
		const template = templateMap.get(block.template_id);
		if (!template) continue;

		// Collect template-specific CSS
		if (template.source_code) {
			const css = extractStyleBlock(template.source_code);
			if (css) cssParts.push(css);
		}

		if (KNOWN_SECTION_TYPES.has(template.slug)) {
			// Known section type — pass props directly to dedicated component
			contentBlocks.push({
				type: template.slug,
				id: block.id,
				order: i,
				...block.props
			} as ContentBlock);
		} else {
			// Unknown type (e.g. layout templates) — pre-render to HTML via AST
			const html = template.source_code
				? extractHtmlMarkup(template.source_code, block.props as Record<string, unknown>)
				: '';
			contentBlocks.push({
				type: 'html',
				id: block.id,
				order: i,
				html
			} as ContentBlock);
		}
	}

	return {
		content: { version: 1, blocks: contentBlocks },
		extraCss: cssParts.join('\n')
	};
}
