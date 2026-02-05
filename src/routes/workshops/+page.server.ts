import type { PageServerLoad } from './$types';
import { getPublishedWorkshops } from '$lib/server/workshops';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.tenant) {
		throw error(404, 'Tenant not found');
	}

	const workshops = await getPublishedWorkshops(locals.tenant.id);

	return {
		workshops,
		tenant: locals.tenant
	};
};
