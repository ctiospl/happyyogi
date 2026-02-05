import type { PageServerLoad, Actions } from './$types';
import { getBookingById } from '$lib/server/bookings';
import { error, fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.user) {
		throw error(401, 'Please login to view your booking');
	}

	const booking = await getBookingById(params.id);

	if (!booking) {
		throw error(404, 'Booking not found');
	}

	// Only allow viewing own bookings (unless admin)
	if (booking.user_id !== locals.user.id && locals.tenantLink?.role !== 'admin') {
		throw error(403, 'You do not have permission to view this booking');
	}

	return {
		booking,
		tenant: locals.tenant,
		user: locals.user,
		isAdmin: locals.tenantLink?.role === 'admin'
	};
};

export const actions: Actions = {
	uploadProof: async ({ request, params, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Please login' });
		}

		const booking = await getBookingById(params.id);
		if (!booking || booking.user_id !== locals.user.id) {
			return fail(403, { error: 'Not authorized' });
		}

		const formData = await request.formData();
		const proofUrl = formData.get('proof_url') as string;

		if (!proofUrl) {
			return fail(400, { error: 'Proof URL is required' });
		}

		// Find pending payment for this booking
		const pendingPayment = booking.payments.find((p) => p.status === 'pending');
		if (!pendingPayment) {
			return fail(400, { error: 'No pending payment found' });
		}

		// Update payment with proof URL
		await db
			.updateTable('payments')
			.set({
				proof_url: proofUrl,
				updated_at: new Date()
			})
			.where('id', '=', pendingPayment.id)
			.execute();

		return { success: true, message: 'Payment proof uploaded successfully' };
	},

	cancel: async ({ params, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Please login' });
		}

		const booking = await getBookingById(params.id);
		if (!booking || booking.user_id !== locals.user.id) {
			return fail(403, { error: 'Not authorized' });
		}

		if (booking.status !== 'pending') {
			return fail(400, { error: 'Cannot cancel a confirmed booking. Please contact support.' });
		}

		await db
			.updateTable('bookings')
			.set({
				status: 'cancelled',
				cancelled_at: new Date(),
				cancellation_reason: 'Cancelled by user',
				updated_at: new Date()
			})
			.where('id', '=', params.id)
			.execute();

		return { success: true, cancelled: true };
	}
};
