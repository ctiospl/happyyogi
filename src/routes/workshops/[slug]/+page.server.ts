import type { PageServerLoad } from './$types';
import { getWorkshopBySlug, getAvailableCapacity, isRegistrationOpen } from '$lib/server/workshops';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.tenant) {
		throw error(404, 'Tenant not found');
	}

	const workshop = await getWorkshopBySlug(locals.tenant.id, params.slug);

	if (!workshop) {
		throw error(404, 'Workshop not found');
	}

	// Only show published workshops to non-admins
	if (workshop.status !== 'published' && locals.tenantLink?.role !== 'admin') {
		throw error(404, 'Workshop not found');
	}

	const availableCapacity = await getAvailableCapacity(workshop.id);
	const registrationOpen = isRegistrationOpen(workshop);

	return {
		workshop,
		availableCapacity,
		registrationOpen,
		tenant: locals.tenant,
		user: locals.user
	};
};
