import type { PageServerLoad, Actions } from './$types';
import {
	getTenantBookings,
	confirmBooking,
	cancelBooking,
	type BookingFilters
} from '$lib/server/bookings';
import { getAllWorkshops } from '$lib/server/workshops';
import { error, fail } from '@sveltejs/kit';
import type { BookingStatus } from '$lib/server/db/schema';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.tenant) {
		throw error(404, 'Tenant not found');
	}

	if (locals.tenantLink?.role !== 'admin') {
		throw error(403, 'Admin access required');
	}

	const status = url.searchParams.get('status') as BookingStatus | null;
	const workshopId = url.searchParams.get('workshop');
	const search = url.searchParams.get('search');
	const dateFrom = url.searchParams.get('dateFrom');
	const dateTo = url.searchParams.get('dateTo');

	const filters: BookingFilters = {};
	if (status) filters.status = status;
	if (workshopId) filters.workshopId = workshopId;
	if (search) filters.search = search;
	if (dateFrom) filters.dateFrom = new Date(dateFrom);
	if (dateTo) filters.dateTo = new Date(dateTo);

	const [bookings, workshops] = await Promise.all([
		getTenantBookings(locals.tenant.id, filters),
		getAllWorkshops(locals.tenant.id)
	]);

	return {
		bookings,
		workshops,
		tenant: locals.tenant,
		filters: {
			status: status || '',
			workshopId: workshopId || '',
			search: search || '',
			dateFrom: dateFrom || '',
			dateTo: dateTo || ''
		}
	};
};

export const actions: Actions = {
	confirm: async ({ request, locals }) => {
		if (!locals.tenant || locals.tenantLink?.role !== 'admin') {
			return fail(403, { error: 'Not authorized' });
		}

		const formData = await request.formData();
		const bookingId = formData.get('bookingId') as string;

		if (!bookingId) {
			return fail(400, { error: 'Booking ID required' });
		}

		const booking = await confirmBooking(bookingId, locals.tenant.id);
		if (!booking) {
			return fail(404, { error: 'Booking not found' });
		}

		return { success: true, message: 'Booking confirmed' };
	},

	cancel: async ({ request, locals }) => {
		if (!locals.tenant || locals.tenantLink?.role !== 'admin') {
			return fail(403, { error: 'Not authorized' });
		}

		const formData = await request.formData();
		const bookingId = formData.get('bookingId') as string;
		const reason = formData.get('reason') as string;

		if (!bookingId) {
			return fail(400, { error: 'Booking ID required' });
		}

		const booking = await cancelBooking(bookingId, locals.tenant.id, reason || 'Cancelled by admin');
		if (!booking) {
			return fail(404, { error: 'Booking not found' });
		}

		return { success: true, message: 'Booking cancelled' };
	}
};
