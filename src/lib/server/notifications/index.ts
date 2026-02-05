import { sendEmail } from './email';
import {
	bookingConfirmationEmail,
	paymentReminderEmail,
	paymentConfirmedEmail,
	contactFormEmail
} from './templates';
import type { BookingWithDetails } from '$lib/server/bookings';
import { db } from '$lib/server/db';

export { sendEmail } from './email';

/**
 * Send booking confirmation email
 */
export async function sendBookingConfirmation(booking: BookingWithDetails) {
	if (!booking.user.email) {
		console.log(`[Notification] No email for user ${booking.user.id}, skipping booking confirmation`);
		return { success: false, error: 'No email address' };
	}

	const { subject, htmlBody, textBody } = bookingConfirmationEmail(booking);
	return sendEmail({
		to: booking.user.email,
		subject,
		htmlBody,
		textBody
	});
}

/**
 * Send payment reminder email
 */
export async function sendPaymentReminder(booking: BookingWithDetails) {
	if (!booking.user.email) {
		console.log(`[Notification] No email for user ${booking.user.id}, skipping payment reminder`);
		return { success: false, error: 'No email address' };
	}

	const { subject, htmlBody, textBody } = paymentReminderEmail(booking);
	return sendEmail({
		to: booking.user.email,
		subject,
		htmlBody,
		textBody
	});
}

/**
 * Send payment confirmed email
 */
export async function sendPaymentConfirmed(booking: BookingWithDetails) {
	if (!booking.user.email) {
		console.log(`[Notification] No email for user ${booking.user.id}, skipping payment confirmed`);
		return { success: false, error: 'No email address' };
	}

	const { subject, htmlBody, textBody } = paymentConfirmedEmail(booking);
	return sendEmail({
		to: booking.user.email,
		subject,
		htmlBody,
		textBody
	});
}

/**
 * Send contact form submission to admin
 */
export async function sendContactFormNotification(submission: {
	name: string;
	email: string | null;
	phone: string | null;
	message: string;
}) {
	const adminEmail = process.env.ADMIN_EMAIL || 'admin@happyyogi.in';
	const { subject, htmlBody, textBody } = contactFormEmail(submission);
	return sendEmail({
		to: adminEmail,
		subject,
		htmlBody,
		textBody
	});
}

/**
 * Log notification to audit log
 */
export async function logNotification(
	tenantId: string | null,
	_userId: string | null,
	type: string,
	details: Record<string, unknown>
) {
	await db
		.insertInto('audit_logs')
		.values({
			tenant_id: tenantId,
			actor_id: null,
			action: `notification.${type}`,
			resource_type: 'notification',
			resource_id: null,
			new_values: JSON.stringify(details)
		})
		.execute();
}
