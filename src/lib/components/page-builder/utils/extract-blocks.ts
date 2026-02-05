/**
 * Extract structured content blocks from GrapesJS project data
 */
import type { PageContent, ContentBlock } from '$lib/types';

interface GrapesComponent {
	type?: string;
	attributes?: Record<string, string>;
	'data-props'?: Record<string, unknown>;
	components?: GrapesComponent[];
}

interface GrapesProjectData {
	pages?: Array<{
		frames?: Array<{
			component?: GrapesComponent;
		}>;
	}>;
	components?: GrapesComponent[];
}

const BLOCK_TYPE_MAP: Record<string, ContentBlock['type']> = {
	'hero': 'hero',
	'services-grid': 'services-grid',
	'about-snippet': 'about-snippet',
	'testimonial-carousel': 'testimonial-carousel',
	'cta-banner': 'cta-banner',
	'instructor-grid': 'instructor-grid',
	'values-grid': 'values-grid',
	'story': 'story'
};

/**
 * Extract structured content blocks from GrapesJS project data
 */
export function extractBlocks(projectData: GrapesProjectData): PageContent {
	const blocks: ContentBlock[] = [];
	let order = 0;

	// Helper to recursively find components with data-block-type
	function walkComponents(components: GrapesComponent[] | undefined) {
		if (!components) return;

		for (const comp of components) {
			const blockType = comp.attributes?.['data-block-type'];

			if (blockType && BLOCK_TYPE_MAP[blockType]) {
				const type = BLOCK_TYPE_MAP[blockType];
				const props = comp['data-props'] || {};

				blocks.push({
					type,
					order: order++,
					id: `block-${order}`,
					...props
				} as ContentBlock);
			}

			// Recurse into children
			if (comp.components) {
				walkComponents(comp.components);
			}
		}
	}

	// Try to extract from pages array (newer GrapesJS format)
	if (projectData.pages && projectData.pages.length > 0) {
		for (const page of projectData.pages) {
			if (page.frames) {
				for (const frame of page.frames) {
					if (frame.component?.components) {
						walkComponents(frame.component.components);
					}
				}
			}
		}
	}

	// Fallback: try components array directly (older format)
	if (projectData.components) {
		walkComponents(projectData.components);
	}

	return {
		version: 1,
		blocks
	};
}

/**
 * Check if project data contains any structured blocks
 */
export function hasStructuredBlocks(projectData: GrapesProjectData): boolean {
	const content = extractBlocks(projectData);
	return content.blocks.length > 0;
}

/**
 * Merge extracted blocks with existing PageContent
 */
export function mergeBlocks(existing: PageContent, extracted: PageContent): PageContent {
	// Simple merge: replace all blocks with extracted ones
	return {
		version: Math.max(existing.version, extracted.version),
		blocks: extracted.blocks
	};
}
