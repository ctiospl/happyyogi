import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { PageBlock, LayoutRegionName } from '$lib/server/db/schema';
import { resolvePageBlocks } from '$lib/server/templates/resolve';

/**
 * POST: Preview layout regions — resolves each region's PageBlock[] to ContentBlock[]
 */
export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.tenant || locals.tenantLink?.role !== 'admin') {
		throw error(403, 'Admin access required');
	}

	const { regions } = (await request.json()) as {
		regions: Partial<Record<LayoutRegionName, PageBlock[]>>;
	};

	if (!regions || typeof regions !== 'object') {
		throw error(400, 'regions must be an object');
	}

	const resolved: Record<string, { content: any; extraCss: string }> = {};

	const entries = Object.entries(regions).filter(
		([, blocks]) => Array.isArray(blocks) && blocks.length > 0
	);

	await Promise.all(
		entries.map(async ([name, blocks]) => {
			const { content, extraCss } = await resolvePageBlocks(blocks as PageBlock[]);
			resolved[name] = { content, extraCss };
		})
	);

	return json({
		id: 'preview',
		name: 'Preview',
		regions: resolved
	});
};
