/**
 * Convert PageContent blocks to GrapesJS component definitions
 */
import type { PageContent, ContentBlock } from '$lib/types';

// Map block type to GrapesJS component type
const blockTypeMap: Record<string, string> = {
	'hero': 'hero-section',
	'services-grid': 'services-grid-section',
	'about-snippet': 'about-snippet-section',
	'testimonial-carousel': 'testimonial-carousel-section',
	'cta-banner': 'cta-banner-section',
	'instructor-grid': 'instructor-grid-section',
	'values-grid': 'values-grid-section',
	'story': 'story-section'
};

/**
 * Convert a single ContentBlock to GrapesJS component definition
 */
function blockToComponent(block: ContentBlock): object | null {
	const componentType = blockTypeMap[block.type];
	if (!componentType) {
		// Unknown block type - skip or handle as raw HTML
		if (block.type === 'html' && 'html' in block) {
			return {
				tagName: 'div',
				content: block.html
			};
		}
		return null;
	}

	// Build component props based on block type
	const props: Record<string, unknown> = {};

	switch (block.type) {
		case 'hero':
			props.headline = block.headline;
			props.subheadline = block.subheadline;
			props.location = block.location;
			props.backgroundImage = block.backgroundImage;
			props.ctaText = block.cta?.text;
			props.ctaHref = block.cta?.href;
			props.secondaryCtaText = block.secondaryCta?.text;
			props.secondaryCtaHref = block.secondaryCta?.href;
			break;
		case 'services-grid':
			props.headline = block.headline;
			props.subheadline = block.subheadline;
			props.featureImage = block.featureImage;
			// Services array stored in data-props
			break;
		case 'about-snippet':
			props.headline = block.headline;
			props.content = block.content;
			props.image = block.image;
			props.ctaText = block.cta?.text;
			props.ctaHref = block.cta?.href;
			break;
		case 'testimonial-carousel':
			props.headline = block.headline;
			break;
		case 'cta-banner':
			props.headline = block.headline;
			props.subheadline = block.subheadline;
			props.backgroundImage = block.backgroundImage;
			props.ctaText = block.cta?.text;
			props.ctaHref = block.cta?.href;
			props.showInstructors = block.showInstructors;
			break;
		case 'instructor-grid':
			props.heading = block.heading;
			props.subheading = block.subheading;
			break;
		case 'values-grid':
			props.heading = block.heading;
			break;
		case 'story':
			props.heading = block.heading;
			props.subheading = block.subheading;
			props.image = block.image;
			break;
	}

	// Remove undefined values
	Object.keys(props).forEach(key => {
		if (props[key] === undefined) delete props[key];
	});

	return {
		type: componentType,
		// Store full block data for extraction later
		'data-props': { ...block, type: undefined },
		...props
	};
}

/**
 * Convert PageContent to GrapesJS project data format
 */
export function contentToGrapesProject(content: PageContent): object {
	const components = content.blocks
		.map(blockToComponent)
		.filter((c): c is object => c !== null);

	return {
		pages: [
			{
				frames: [
					{
						component: {
							type: 'wrapper',
							components
						}
					}
				]
			}
		],
		styles: [],
		assets: []
	};
}

/**
 * Check if object is PageContent format
 */
export function isPageContent(obj: unknown): obj is PageContent {
	return (
		typeof obj === 'object' &&
		obj !== null &&
		'version' in obj &&
		'blocks' in obj &&
		Array.isArray((obj as PageContent).blocks)
	);
}
