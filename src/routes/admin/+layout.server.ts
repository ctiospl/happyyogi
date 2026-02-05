import type { LayoutServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	if (!locals.tenant) {
		throw error(404, 'Tenant not found');
	}

	// Allow login page without auth
	if (url.pathname === '/admin/login') {
		return {
			tenant: locals.tenant,
			user: locals.user,
			isAdmin: false
		};
	}

	// Require auth for all other admin pages
	if (!locals.user) {
		throw redirect(302, '/admin/login');
	}

	if (locals.tenantLink?.role !== 'admin' && locals.tenantLink?.role !== 'superadmin') {
		throw error(403, 'Admin access required');
	}

	// Get admin stats for dashboard
	const [workshopCount, bookingCount, userCount, pendingPayments] = await Promise.all([
		db
			.selectFrom('workshops')
			.where('tenant_id', '=', locals.tenant.id)
			.where('deleted_at', 'is', null)
			.select(db.fn.count('id').as('count'))
			.executeTakeFirst(),
		db
			.selectFrom('bookings')
			.where('tenant_id', '=', locals.tenant.id)
			.select(db.fn.count('id').as('count'))
			.executeTakeFirst(),
		db
			.selectFrom('user_tenant_links')
			.where('tenant_id', '=', locals.tenant.id)
			.select(db.fn.count('id').as('count'))
			.executeTakeFirst(),
		db
			.selectFrom('payments')
			.where('tenant_id', '=', locals.tenant.id)
			.where('status', '=', 'pending')
			.select(db.fn.count('id').as('count'))
			.executeTakeFirst()
	]);

	return {
		tenant: locals.tenant,
		user: locals.user,
		isAdmin: true,
		stats: {
			workshops: Number(workshopCount?.count ?? 0),
			bookings: Number(bookingCount?.count ?? 0),
			users: Number(userCount?.count ?? 0),
			pendingPayments: Number(pendingPayments?.count ?? 0)
		}
	};
};
