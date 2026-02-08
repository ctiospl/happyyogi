import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getTemplates } from '$lib/server/templates/crud';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.tenant || locals.tenantLink?.role !== 'admin') {
		throw error(403, 'Admin access required');
	}

	const templates = await getTemplates(locals.tenant.id);

	return json(
		templates.map((t) => ({
			slug: t.slug,
			name: t.name,
			category: t.category,
			schema: t.schema
		}))
	);
};
