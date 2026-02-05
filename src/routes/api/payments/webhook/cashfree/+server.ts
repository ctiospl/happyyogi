import type { RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { confirmBooking } from '$lib/server/bookings';
import { verifyCashfreeWebhookSignature, type CashfreeWebhookPayload } from '$lib/server/payments/cashfree';
import type { PaymentGatewayConfig } from '$lib/server/db/schema';

/**
 * Cashfree webhook handler
 * Receives payment notifications and updates booking/payment status
 */
export const POST: RequestHandler = async ({ request }) => {
	try {
		const rawBody = await request.text();
		const signature = request.headers.get('x-webhook-signature');
		const timestamp = request.headers.get('x-webhook-timestamp');

		if (!signature || !timestamp) {
			console.warn('Missing Cashfree webhook signature or timestamp');
			return new Response('Missing signature', { status: 400 });
		}

		let payload: CashfreeWebhookPayload;
		try {
			payload = JSON.parse(rawBody);
		} catch {
			console.error('Invalid JSON in Cashfree webhook');
			return new Response('Invalid JSON', { status: 400 });
		}

		// Extract order_id to find tenant
		const orderId = payload.data?.order?.order_id;
		if (!orderId) {
			console.error('No order_id in Cashfree webhook payload');
			return new Response('Missing order_id', { status: 400 });
		}

		// Find payment by gateway_payment_id (we store orderId there on creation)
		const payment = await db
			.selectFrom('payments')
			.innerJoin('tenants', 'tenants.id', 'payments.tenant_id')
			.where('payments.gateway_payment_id', '=', orderId)
			.select([
				'payments.id as payment_id',
				'payments.booking_id',
				'payments.tenant_id',
				'payments.status as payment_status',
				'tenants.payment_gateways'
			])
			.executeTakeFirst();

		if (!payment) {
			console.error(`Payment not found for Cashfree order: ${orderId}`);
			// Return 200 to prevent retries for unknown orders
			return new Response('Order not found', { status: 200 });
		}

		// Verify signature using tenant's webhook secret
		const gatewayConfig = payment.payment_gateways as PaymentGatewayConfig;
		const webhookSecret = gatewayConfig.cashfree?.webhook_secret;

		if (webhookSecret) {
			const isValid = verifyCashfreeWebhookSignature(rawBody, signature, timestamp, webhookSecret);
			if (!isValid) {
				console.warn(`Invalid Cashfree webhook signature for order: ${orderId}`);
				return new Response('Invalid signature', { status: 403 });
			}
		} else {
			console.warn('No Cashfree webhook secret configured, skipping verification');
		}

		// Process based on event type
		const eventType = payload.type;
		const paymentStatus = payload.data?.payment?.payment_status;

		console.log(`Cashfree webhook: ${eventType}, payment_status: ${paymentStatus}, order: ${orderId}`);

		if (eventType === 'PAYMENT_SUCCESS_WEBHOOK' || paymentStatus === 'SUCCESS') {
			// Payment successful - update payment and confirm booking
			if (payment.payment_status !== 'completed') {
				const cfPaymentId = payload.data?.payment?.cf_payment_id;

				await db
					.updateTable('payments')
					.set({
						status: 'completed',
						method: 'gateway',
						gateway_response: payload.data as unknown as Record<string, unknown>,
						gateway_payment_id: cfPaymentId ? `${orderId}:${cfPaymentId}` : orderId,
						updated_at: new Date()
					})
					.where('id', '=', payment.payment_id)
					.execute();

				// Confirm the booking
				await confirmBooking(payment.booking_id, payment.tenant_id);

				console.log(`Payment ${payment.payment_id} completed, booking ${payment.booking_id} confirmed`);
			}
		} else if (eventType === 'PAYMENT_FAILED_WEBHOOK' || paymentStatus === 'FAILED') {
			// Payment failed
			await db
				.updateTable('payments')
				.set({
					status: 'failed',
					gateway_response: payload.data as unknown as Record<string, unknown>,
					updated_at: new Date()
				})
				.where('id', '=', payment.payment_id)
				.execute();

			console.log(`Payment ${payment.payment_id} failed for order ${orderId}`);
		}
		// Other event types (USER_DROPPED, etc.) are logged but not acted upon

		return new Response('OK', { status: 200 });
	} catch (error) {
		console.error('Cashfree webhook error:', error);
		// Always return 200 to acknowledge receipt
		return new Response('OK', { status: 200 });
	}
};
