import type { PageServerLoad } from './$types';
import { getPageBySlug } from '$lib/server/pages';
import { error } from '@sveltejs/kit';

// Reserved slugs that shouldn't be handled by this catch-all
const RESERVED_SLUGS = ['api', 'admin', 'workshops', 'bookings', 'auth', 'login', 'forms'];

export const load: PageServerLoad = async ({ params, locals }) => {
	// Skip reserved paths
	if (RESERVED_SLUGS.includes(params.slug)) {
		throw error(404, 'Page not found');
	}

	if (!locals.tenant) {
		throw error(404, 'Tenant not found');
	}

	const page = await getPageBySlug(locals.tenant.id, params.slug);

	if (!page) {
		throw error(404, 'Page not found');
	}

	// Only show published pages (unless admin)
	if (page.status !== 'published' && locals.tenantLink?.role !== 'admin') {
		throw error(404, 'Page not found');
	}

	return {
		page,
		tenant: locals.tenant
	};
};
