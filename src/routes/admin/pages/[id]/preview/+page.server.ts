import type { PageServerLoad } from './$types';
import { getPageById } from '$lib/server/pages';
import { resolvePageBlocks } from '$lib/server/templates/resolve';
import { error } from '@sveltejs/kit';
import type { PageBlock } from '$lib/server/db/schema';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.tenant) throw error(404, 'Tenant not found');
	if (locals.tenantLink?.role !== 'admin') throw error(403, 'Admin access required');

	const page = await getPageById(params.id);
	if (!page || page.tenant_id !== locals.tenant.id) throw error(404, 'Page not found');

	let blocks: PageBlock[] = [];
	if (page.blocks) {
		blocks = typeof page.blocks === 'string' ? JSON.parse(page.blocks) : page.blocks;
	}

	const { content, extraCss } = await resolvePageBlocks(blocks);

	return { content, extraCss };
};
