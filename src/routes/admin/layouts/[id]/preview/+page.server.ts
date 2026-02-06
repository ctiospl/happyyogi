import type { PageServerLoad } from './$types';
import { getLayoutById } from '$lib/server/layouts';
import { resolveLayout } from '$lib/server/layouts/resolve';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.tenant) throw error(404, 'Tenant not found');
	if (locals.tenantLink?.role !== 'admin') throw error(403, 'Admin access required');

	const layout = await getLayoutById(params.id);
	if (!layout || layout.tenant_id !== locals.tenant.id) {
		throw error(404, 'Layout not found');
	}

	const resolved = await resolveLayout(layout);
	return { layout: resolved };
};
