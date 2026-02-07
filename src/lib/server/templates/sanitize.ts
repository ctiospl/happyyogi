/**
 * HTML Sanitization for template output
 *
 * Strips dangerous elements while preserving Svelte hydration markers.
 * Applied to ALL rendered output before serving to clients.
 */

import sanitizeHtml from 'sanitize-html';

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
	// Style tags needed for scoped CSS from templates
	allowVulnerableTags: true,
	allowedTags: sanitizeHtml.defaults.allowedTags.concat([
		'img', 'figure', 'figcaption', 'video', 'source', 'picture',
		'section', 'article', 'aside', 'header', 'footer', 'nav', 'main',
		'details', 'summary', 'mark', 'time', 'svg', 'path', 'circle',
		'rect', 'line', 'polyline', 'polygon', 'g', 'defs', 'use',
		'symbol', 'title', 'desc', 'clipPath', 'mask',
		'button', 'form', 'input', 'label', 'select', 'option', 'textarea',
		'style'
	]),
	allowedAttributes: {
		'*': [
			'class', 'id', 'style', 'data-*', 'role', 'aria-*', 'tabindex',
			'title', 'lang', 'dir', 'hidden'
		],
		a: ['href', 'target', 'rel', 'download'],
		img: ['src', 'alt', 'width', 'height', 'loading', 'decoding', 'srcset', 'sizes'],
		video: ['src', 'poster', 'controls', 'autoplay', 'muted', 'loop', 'width', 'height'],
		source: ['src', 'srcset', 'type', 'media', 'sizes'],
		time: ['datetime'],
		input: ['type', 'name', 'value', 'placeholder', 'required', 'disabled', 'checked'],
		label: ['for'],
		select: ['name', 'required', 'disabled'],
		option: ['value', 'selected', 'disabled'],
		textarea: ['name', 'placeholder', 'required', 'disabled', 'rows', 'cols'],
		button: ['type', 'disabled', 'name', 'value'],
		form: ['action', 'method'],
		svg: ['viewBox', 'width', 'height', 'fill', 'stroke', 'xmlns', 'class'],
		path: ['d', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'class'],
		circle: ['cx', 'cy', 'r', 'fill', 'stroke', 'class'],
		rect: ['x', 'y', 'width', 'height', 'rx', 'ry', 'fill', 'stroke', 'class'],
		line: ['x1', 'y1', 'x2', 'y2', 'stroke', 'stroke-width', 'class'],
		polyline: ['points', 'fill', 'stroke', 'class'],
		polygon: ['points', 'fill', 'stroke', 'class'],
		g: ['transform', 'fill', 'stroke', 'class'],
		use: ['href', 'xlink:href', 'x', 'y', 'width', 'height'],
		symbol: ['id', 'viewBox'],
		clipPath: ['id'],
		mask: ['id']
	},
	// Allow style tags with content (for scoped CSS from templates)
	allowedStyles: {
		'*': {
			// Allow all CSS properties
			'*': [/.*/]
		}
	},
	// Strip <script> tags and event handlers
	disallowedTagsMode: 'discard',
	// Block dangerous schemes
	allowedSchemes: ['http', 'https', 'mailto', 'tel', 'data'],
	allowedSchemesByTag: {
		img: ['http', 'https', 'data'],
		a: ['http', 'https', 'mailto', 'tel']
	},
	exclusiveFilter: () => false,
	transformTags: {
		// Ensure links open safely
		a: sanitizeHtml.simpleTransform('a', {
			rel: 'noopener noreferrer'
		})
	}
};

/**
 * Sanitize rendered HTML output.
 * Strips <script>, on* event attributes, javascript: URLs.
 * Preserves HTML comments for Svelte hydration markers.
 */
export function sanitizeRenderedHtml(input: string): string {
	if (!input) return '';

	// Pre-process: protect Svelte hydration markers
	// They look like <!--[--> and <!--]-->
	const protected_ = input
		.replace(/<!--\[-->/g, '___SVELTE_OPEN___')
		.replace(/<!--\]-->/g, '___SVELTE_CLOSE___');

	let clean = sanitizeHtml(protected_, SANITIZE_OPTIONS);

	// Restore hydration markers
	clean = clean
		.replace(/___SVELTE_OPEN___/g, '<!--[-->')
		.replace(/___SVELTE_CLOSE___/g, '<!--]-->');

	return clean;
}
