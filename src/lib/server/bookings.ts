import { db } from '$lib/server/db';
import type {
	Booking,
	BookingStatus,
	Payment,
	NewPayment,
	PaymentMethod,
	Waitlist
} from '$lib/server/db/schema';
import { getAvailableCapacity } from './workshops';

export interface BookingWithDetails extends Booking {
	workshop: {
		id: string;
		title: string;
		slug: string;
		venue_name: string | null;
		price_paise: number;
	};
	payments: Payment[];
	user: {
		id: string;
		name: string | null;
		phone: string;
		email: string | null;
	};
}

/**
 * Create a new booking with hold
 */
export async function createBooking(
	tenantId: string,
	userId: string,
	workshopId: string,
	holdMinutes?: number
): Promise<{ booking?: Booking; error?: string }> {
	// Check capacity
	const available = await getAvailableCapacity(workshopId);
	if (available !== null && available <= 0) {
		return { error: 'Workshop is fully booked' };
	}

	// Check for existing booking
	const existing = await db
		.selectFrom('bookings')
		.where('user_id', '=', userId)
		.where('workshop_id', '=', workshopId)
		.where('status', 'in', ['pending', 'confirmed'])
		.selectAll()
		.executeTakeFirst();

	if (existing) {
		return { error: 'You already have a booking for this workshop' };
	}

	// Get workshop for hold duration
	const workshop = await db
		.selectFrom('workshops')
		.where('id', '=', workshopId)
		.select(['booking_hold_minutes'])
		.executeTakeFirst();

	const holdDuration = holdMinutes || workshop?.booking_hold_minutes || 30;
	const holdExpiresAt = new Date(Date.now() + holdDuration * 60 * 1000);

	const [booking] = await db
		.insertInto('bookings')
		.values({
			tenant_id: tenantId,
			user_id: userId,
			workshop_id: workshopId,
			status: 'pending',
			hold_expires_at: holdExpiresAt,
			updated_at: new Date()
		})
		.returningAll()
		.execute();

	return { booking: booking as Booking };
}

/**
 * Get booking by ID with full details
 */
export async function getBookingById(
	bookingId: string
): Promise<BookingWithDetails | null> {
	const booking = await db
		.selectFrom('bookings')
		.innerJoin('workshops', 'workshops.id', 'bookings.workshop_id')
		.innerJoin('users', 'users.id', 'bookings.user_id')
		.where('bookings.id', '=', bookingId)
		.select([
			'bookings.id',
			'bookings.tenant_id',
			'bookings.user_id',
			'bookings.workshop_id',
			'bookings.status',
			'bookings.hold_expires_at',
			'bookings.cancelled_at',
			'bookings.cancellation_reason',
			'bookings.promo_code_id',
			'bookings.discount_amount_paise',
			'bookings.created_at',
			'bookings.updated_at',
			'workshops.title as workshop_title',
			'workshops.slug as workshop_slug',
			'workshops.venue_name as workshop_venue',
			'workshops.price_paise as workshop_price',
			'users.name as user_name',
			'users.phone as user_phone',
			'users.email as user_email'
		])
		.executeTakeFirst();

	if (!booking) return null;

	const payments = await db
		.selectFrom('payments')
		.where('booking_id', '=', bookingId)
		.selectAll()
		.orderBy('created_at', 'desc')
		.execute();

	return {
		id: booking.id,
		tenant_id: booking.tenant_id,
		user_id: booking.user_id,
		workshop_id: booking.workshop_id,
		status: booking.status as BookingStatus,
		hold_expires_at: booking.hold_expires_at,
		cancelled_at: booking.cancelled_at,
		cancellation_reason: booking.cancellation_reason,
		promo_code_id: booking.promo_code_id,
		discount_amount_paise: booking.discount_amount_paise,
		created_at: booking.created_at,
		updated_at: booking.updated_at,
		workshop: {
			id: booking.workshop_id,
			title: booking.workshop_title,
			slug: booking.workshop_slug,
			venue_name: booking.workshop_venue,
			price_paise: booking.workshop_price
		},
		payments: payments as Payment[],
		user: {
			id: booking.user_id,
			name: booking.user_name,
			phone: booking.user_phone,
			email: booking.user_email
		}
	};
}

/**
 * Get user's bookings
 */
export async function getUserBookings(
	userId: string,
	tenantId?: string
): Promise<BookingWithDetails[]> {
	let query = db
		.selectFrom('bookings')
		.innerJoin('workshops', 'workshops.id', 'bookings.workshop_id')
		.innerJoin('users', 'users.id', 'bookings.user_id')
		.where('bookings.user_id', '=', userId);

	if (tenantId) {
		query = query.where('bookings.tenant_id', '=', tenantId);
	}

	const bookings = await query
		.select([
			'bookings.id',
			'bookings.tenant_id',
			'bookings.user_id',
			'bookings.workshop_id',
			'bookings.status',
			'bookings.hold_expires_at',
			'bookings.cancelled_at',
			'bookings.cancellation_reason',
			'bookings.promo_code_id',
			'bookings.discount_amount_paise',
			'bookings.created_at',
			'bookings.updated_at',
			'workshops.title as workshop_title',
			'workshops.slug as workshop_slug',
			'workshops.venue_name as workshop_venue',
			'workshops.price_paise as workshop_price',
			'users.name as user_name',
			'users.phone as user_phone',
			'users.email as user_email'
		])
		.orderBy('bookings.created_at', 'desc')
		.execute();

	// Get payments for all bookings
	const bookingIds = bookings.map((b) => b.id);
	const allPayments =
		bookingIds.length > 0
			? await db
					.selectFrom('payments')
					.where('booking_id', 'in', bookingIds)
					.selectAll()
					.execute()
			: [];

	const paymentMap = new Map<string, Payment[]>();
	for (const payment of allPayments) {
		const existing = paymentMap.get(payment.booking_id) || [];
		existing.push(payment as Payment);
		paymentMap.set(payment.booking_id, existing);
	}

	return bookings.map((b) => ({
		id: b.id,
		tenant_id: b.tenant_id,
		user_id: b.user_id,
		workshop_id: b.workshop_id,
		status: b.status as BookingStatus,
		hold_expires_at: b.hold_expires_at,
		cancelled_at: b.cancelled_at,
		cancellation_reason: b.cancellation_reason,
		promo_code_id: b.promo_code_id,
		discount_amount_paise: b.discount_amount_paise,
		created_at: b.created_at,
		updated_at: b.updated_at,
		workshop: {
			id: b.workshop_id,
			title: b.workshop_title,
			slug: b.workshop_slug,
			venue_name: b.workshop_venue,
			price_paise: b.workshop_price
		},
		payments: paymentMap.get(b.id) || [],
		user: {
			id: b.user_id,
			name: b.user_name,
			phone: b.user_phone,
			email: b.user_email
		}
	}));
}

/**
 * Confirm booking (mark payment as complete)
 */
export async function confirmBooking(bookingId: string): Promise<Booking | null> {
	const [updated] = await db
		.updateTable('bookings')
		.set({
			status: 'confirmed',
			hold_expires_at: null,
			updated_at: new Date()
		})
		.where('id', '=', bookingId)
		.returningAll()
		.execute();

	return (updated as Booking) || null;
}

/**
 * Cancel booking
 */
export async function cancelBooking(
	bookingId: string,
	reason?: string
): Promise<Booking | null> {
	const [updated] = await db
		.updateTable('bookings')
		.set({
			status: 'cancelled',
			cancelled_at: new Date(),
			cancellation_reason: reason || null,
			updated_at: new Date()
		})
		.where('id', '=', bookingId)
		.returningAll()
		.execute();

	return (updated as Booking) || null;
}

/**
 * Create payment record
 */
export async function createPayment(data: NewPayment): Promise<Payment> {
	const [payment] = await db
		.insertInto('payments')
		.values(data)
		.returningAll()
		.execute();

	return payment as Payment;
}

/**
 * Mark payment as completed (admin action)
 */
export async function markPaymentComplete(
	paymentId: string,
	adminId: string,
	method?: PaymentMethod,
	proofUrl?: string
): Promise<Payment | null> {
	const [updated] = await db
		.updateTable('payments')
		.set({
			status: 'completed',
			method: method || 'upi',
			proof_url: proofUrl || null,
			marked_by: adminId,
			marked_at: new Date(),
			updated_at: new Date()
		})
		.where('id', '=', paymentId)
		.returningAll()
		.execute();

	if (updated) {
		// Also confirm the booking
		await confirmBooking(updated.booking_id);
	}

	return (updated as Payment) || null;
}

/**
 * Get all bookings for a workshop (admin)
 */
export async function getWorkshopBookings(workshopId: string): Promise<BookingWithDetails[]> {
	const bookings = await db
		.selectFrom('bookings')
		.innerJoin('workshops', 'workshops.id', 'bookings.workshop_id')
		.innerJoin('users', 'users.id', 'bookings.user_id')
		.where('bookings.workshop_id', '=', workshopId)
		.select([
			'bookings.id',
			'bookings.tenant_id',
			'bookings.user_id',
			'bookings.workshop_id',
			'bookings.status',
			'bookings.hold_expires_at',
			'bookings.cancelled_at',
			'bookings.cancellation_reason',
			'bookings.promo_code_id',
			'bookings.discount_amount_paise',
			'bookings.created_at',
			'bookings.updated_at',
			'workshops.title as workshop_title',
			'workshops.slug as workshop_slug',
			'workshops.venue_name as workshop_venue',
			'workshops.price_paise as workshop_price',
			'users.name as user_name',
			'users.phone as user_phone',
			'users.email as user_email'
		])
		.orderBy('bookings.created_at', 'desc')
		.execute();

	const bookingIds = bookings.map((b) => b.id);
	const allPayments =
		bookingIds.length > 0
			? await db
					.selectFrom('payments')
					.where('booking_id', 'in', bookingIds)
					.selectAll()
					.execute()
			: [];

	const paymentMap = new Map<string, Payment[]>();
	for (const payment of allPayments) {
		const existing = paymentMap.get(payment.booking_id) || [];
		existing.push(payment as Payment);
		paymentMap.set(payment.booking_id, existing);
	}

	return bookings.map((b) => ({
		id: b.id,
		tenant_id: b.tenant_id,
		user_id: b.user_id,
		workshop_id: b.workshop_id,
		status: b.status as BookingStatus,
		hold_expires_at: b.hold_expires_at,
		cancelled_at: b.cancelled_at,
		cancellation_reason: b.cancellation_reason,
		promo_code_id: b.promo_code_id,
		discount_amount_paise: b.discount_amount_paise,
		created_at: b.created_at,
		updated_at: b.updated_at,
		workshop: {
			id: b.workshop_id,
			title: b.workshop_title,
			slug: b.workshop_slug,
			venue_name: b.workshop_venue,
			price_paise: b.workshop_price
		},
		payments: paymentMap.get(b.id) || [],
		user: {
			id: b.user_id,
			name: b.user_name,
			phone: b.user_phone,
			email: b.user_email
		}
	}));
}

/**
 * Add to waitlist
 */
export async function addToWaitlist(
	tenantId: string,
	userId: string,
	workshopId: string
): Promise<{ waitlist?: Waitlist; error?: string }> {
	// Check for existing waitlist entry
	const existing = await db
		.selectFrom('waitlists')
		.where('user_id', '=', userId)
		.where('workshop_id', '=', workshopId)
		.where('status', '=', 'waiting')
		.selectAll()
		.executeTakeFirst();

	if (existing) {
		return { error: 'You are already on the waitlist' };
	}

	// Get next position
	const lastPosition = await db
		.selectFrom('waitlists')
		.where('workshop_id', '=', workshopId)
		.select(db.fn.max('position').as('max_position'))
		.executeTakeFirst();

	const nextPosition = (Number(lastPosition?.max_position) || 0) + 1;

	const [waitlist] = await db
		.insertInto('waitlists')
		.values({
			tenant_id: tenantId,
			user_id: userId,
			workshop_id: workshopId,
			position: nextPosition,
			status: 'waiting'
		})
		.returningAll()
		.execute();

	return { waitlist: waitlist as Waitlist };
}

/**
 * Clean up expired booking holds
 */
export async function cleanupExpiredHolds(): Promise<number> {
	const result = await db
		.updateTable('bookings')
		.set({
			status: 'cancelled',
			cancellation_reason: 'Hold expired',
			cancelled_at: new Date(),
			updated_at: new Date()
		})
		.where('status', '=', 'pending')
		.where('hold_expires_at', '<', new Date())
		.executeTakeFirst();

	return Number(result.numUpdatedRows);
}
