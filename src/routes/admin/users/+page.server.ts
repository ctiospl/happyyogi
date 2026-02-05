import type { PageServerLoad } from './$types';
import { getUsers, countUsers } from '$lib/server/users';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.tenant) {
		throw error(404, 'Tenant not found');
	}

	if (locals.tenantLink?.role !== 'admin') {
		throw error(403, 'Admin access required');
	}

	const search = url.searchParams.get('search') || undefined;
	const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
	const limit = 25;
	const offset = (page - 1) * limit;

	const [users, total] = await Promise.all([
		getUsers({ tenantId: locals.tenant.id, search, limit, offset }),
		countUsers(locals.tenant.id, search)
	]);

	return {
		users,
		total,
		page,
		limit,
		search: search || '',
		tenant: locals.tenant
	};
};
