import type { PageServerLoad, Actions } from './$types';
import { getWorkshopBySlug, getAvailableCapacity, isRegistrationOpen } from '$lib/server/workshops';
import { createBooking, createPayment } from '$lib/server/bookings';
import { error, redirect, fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.tenant) {
		throw error(404, 'Tenant not found');
	}

	const workshop = await getWorkshopBySlug(locals.tenant.id, params.slug);

	if (!workshop || workshop.status !== 'published') {
		throw error(404, 'Workshop not found');
	}

	const availableCapacity = await getAvailableCapacity(workshop.id);
	const registrationOpen = isRegistrationOpen(workshop);

	if (!registrationOpen) {
		throw redirect(302, `/workshops/${params.slug}?error=registration_closed`);
	}

	if (availableCapacity === 0) {
		throw redirect(302, `/workshops/${params.slug}?error=sold_out`);
	}

	return {
		workshop,
		availableCapacity,
		tenant: locals.tenant,
		user: locals.user
	};
};

export const actions: Actions = {
	default: async ({ params, locals }) => {
		if (!locals.tenant) {
			return fail(400, { error: 'Tenant not found' });
		}

		// Must be logged in
		if (!locals.user) {
			return fail(401, { error: 'Please login to book', requiresLogin: true });
		}

		const workshop = await getWorkshopBySlug(locals.tenant.id, params.slug);
		if (!workshop || workshop.status !== 'published') {
			return fail(404, { error: 'Workshop not found' });
		}

		// Check availability again
		const available = await getAvailableCapacity(workshop.id);
		if (available === 0) {
			return fail(400, { error: 'Workshop is now sold out' });
		}

		// Create booking with hold
		const { booking, error: bookingError } = await createBooking(
			locals.tenant.id,
			locals.user.id,
			workshop.id
		);

		if (bookingError || !booking) {
			return fail(400, { error: bookingError || 'Failed to create booking' });
		}

		// Create pending payment record
		await createPayment({
			tenant_id: locals.tenant.id,
			booking_id: booking.id,
			user_id: locals.user.id,
			amount_paise: workshop.price_paise,
			currency: 'INR',
			payment_type: 'full',
			status: 'pending',
			updated_at: new Date()
		});

		// Redirect to payment/confirmation page
		throw redirect(302, `/bookings/${booking.id}`);
	}
};
