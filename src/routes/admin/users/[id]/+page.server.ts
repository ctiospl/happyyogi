import type { PageServerLoad, Actions } from './$types';
import { getUserById, getUserBookingHistory, updateUserRole } from '$lib/server/users';
import { error, fail } from '@sveltejs/kit';
import type { UserRole } from '$lib/server/db/schema';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.tenant) {
		throw error(404, 'Tenant not found');
	}

	if (locals.tenantLink?.role !== 'admin') {
		throw error(403, 'Admin access required');
	}

	const user = await getUserById(params.id, locals.tenant.id);

	if (!user) {
		throw error(404, 'User not found');
	}

	const bookings = await getUserBookingHistory(params.id, locals.tenant.id);

	return {
		user,
		bookings,
		tenant: locals.tenant
	};
};

export const actions: Actions = {
	updateRole: async ({ request, params, locals }) => {
		if (!locals.tenant || locals.tenantLink?.role !== 'admin') {
			return fail(403, { error: 'Not authorized' });
		}

		const formData = await request.formData();
		const role = formData.get('role') as UserRole;

		if (!role || !['user', 'admin', 'superadmin'].includes(role)) {
			return fail(400, { error: 'Invalid role' });
		}

		// Prevent demoting yourself
		if (params.id === locals.user?.id && role === 'user') {
			return fail(400, { error: 'Cannot remove your own admin access' });
		}

		await updateUserRole(params.id, locals.tenant.id, role);

		return { success: true, message: `Role updated to ${role}` };
	}
};
