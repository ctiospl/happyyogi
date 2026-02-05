import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { error, fail } from '@sveltejs/kit';
import type { PaymentStatus } from '$lib/server/db/schema';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.tenant) {
		throw error(404, 'Tenant not found');
	}

	if (locals.tenantLink?.role !== 'admin' && locals.tenantLink?.role !== 'superadmin') {
		throw error(403, 'Admin access required');
	}

	const statusFilter = (url.searchParams.get('status') as PaymentStatus | 'all') || 'pending';

	let query = db
		.selectFrom('payments')
		.innerJoin('users', 'users.id', 'payments.user_id')
		.innerJoin('bookings', 'bookings.id', 'payments.booking_id')
		.innerJoin('workshops', 'workshops.id', 'bookings.workshop_id')
		.where('payments.tenant_id', '=', locals.tenant.id)
		.select([
			'payments.id',
			'payments.amount_paise',
			'payments.currency',
			'payments.payment_type',
			'payments.method',
			'payments.proof_url',
			'payments.status',
			'payments.created_at',
			'payments.marked_at',
			'payments.marked_by',
			'payments.gateway_payment_id',
			'users.id as user_id',
			'users.name as user_name',
			'users.phone as user_phone',
			'users.email as user_email',
			'bookings.id as booking_id',
			'workshops.id as workshop_id',
			'workshops.title as workshop_title'
		])
		.orderBy('payments.created_at', 'desc');

	if (statusFilter !== 'all') {
		query = query.where('payments.status', '=', statusFilter);
	}

	const payments = await query.execute();

	// Get marker names for marked payments
	const markerIds = payments
		.filter((p) => p.marked_by)
		.map((p) => p.marked_by)
		.filter((id): id is string => id !== null);

	let markers: Record<string, string> = {};
	if (markerIds.length > 0) {
		const markerUsers = await db
			.selectFrom('users')
			.where('id', 'in', markerIds)
			.select(['id', 'name'])
			.execute();
		markers = Object.fromEntries(markerUsers.map((u) => [u.id, u.name || 'Unknown']));
	}

	return {
		payments: payments.map((p) => ({
			...p,
			marked_by_name: p.marked_by ? markers[p.marked_by] : null
		})),
		statusFilter,
		tenant: locals.tenant
	};
};

export const actions: Actions = {
	markPaid: async ({ request, locals }) => {
		if (
			!locals.tenant ||
			(locals.tenantLink?.role !== 'admin' && locals.tenantLink?.role !== 'superadmin')
		) {
			return fail(403, { error: 'Not authorized' });
		}

		if (!locals.user) {
			return fail(401, { error: 'Not authenticated' });
		}

		const formData = await request.formData();
		const paymentId = formData.get('payment_id') as string;
		// Notes field reserved for future use when we add notes column to payments table
		// const notes = formData.get('notes') as string | null;

		if (!paymentId) {
			return fail(400, { error: 'Payment ID required' });
		}

		// Verify payment belongs to tenant
		const payment = await db
			.selectFrom('payments')
			.where('id', '=', paymentId)
			.where('tenant_id', '=', locals.tenant.id)
			.select(['id', 'status', 'booking_id'])
			.executeTakeFirst();

		if (!payment) {
			return fail(404, { error: 'Payment not found' });
		}

		if (payment.status !== 'pending') {
			return fail(400, { error: 'Payment already processed' });
		}

		// Update payment status
		await db
			.updateTable('payments')
			.set({
				status: 'completed',
				marked_by: locals.user.id,
				marked_at: new Date(),
				updated_at: new Date()
			})
			.where('id', '=', paymentId)
			.execute();

		// Check if all payments for booking are complete, update booking status
		const pendingPayments = await db
			.selectFrom('payments')
			.where('booking_id', '=', payment.booking_id)
			.where('status', '=', 'pending')
			.select('id')
			.execute();

		if (pendingPayments.length === 0) {
			await db
				.updateTable('bookings')
				.set({
					status: 'confirmed',
					updated_at: new Date()
				})
				.where('id', '=', payment.booking_id)
				.execute();
		}

		return { success: true };
	}
};
