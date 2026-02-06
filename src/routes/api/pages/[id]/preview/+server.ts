import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { PageBlock } from '$lib/server/db/schema';
import { resolvePageBlocks } from '$lib/server/templates/resolve';

/**
 * POST: Preview page blocks — resolves PageBlock[] to ContentBlock[]
 * Used by admin block editor for live preview
 */
export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.tenant || locals.tenantLink?.role !== 'admin') {
		throw error(403, 'Admin access required');
	}

	const { blocks } = (await request.json()) as { blocks: PageBlock[] };

	if (!Array.isArray(blocks)) {
		throw error(400, 'blocks must be an array');
	}

	const { content, extraCss } = await resolvePageBlocks(blocks);

	return json({ content, extraCss });
};
