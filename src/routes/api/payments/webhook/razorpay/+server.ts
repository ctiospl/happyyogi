import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { confirmBooking } from '$lib/server/bookings';
import { verifyWebhookSignature, getRazorpayConfig } from '$lib/server/payments/razorpay';
import type { PaymentGatewayConfig } from '$lib/server/db/schema';

interface RazorpayWebhookPayload {
	entity: string;
	account_id: string;
	event: string;
	contains: string[];
	payload: {
		payment?: {
			entity: {
				id: string;
				entity: string;
				amount: number;
				currency: string;
				status: string;
				order_id: string;
				method: string;
				captured: boolean;
				description?: string;
				notes?: Record<string, string>;
				fee?: number;
				tax?: number;
				error_code?: string;
				error_description?: string;
				created_at: number;
			};
		};
		order?: {
			entity: {
				id: string;
				amount: number;
				amount_paid: number;
				amount_due: number;
				currency: string;
				receipt: string;
				status: string;
				notes: Record<string, string>;
			};
		};
	};
	created_at: number;
}

export const POST: RequestHandler = async ({ request }) => {
	const signature = request.headers.get('X-Razorpay-Signature');
	if (!signature) {
		console.error('Razorpay webhook: Missing signature');
		return json({ error: 'Missing signature' }, { status: 400 });
	}

	// Get raw body for signature verification
	const rawBody = await request.text();

	let payload: RazorpayWebhookPayload;
	try {
		payload = JSON.parse(rawBody);
	} catch {
		console.error('Razorpay webhook: Invalid JSON');
		return json({ error: 'Invalid JSON' }, { status: 400 });
	}

	// Extract tenant_id from payment notes
	const tenantId =
		payload.payload.payment?.entity.notes?.tenant_id ||
		payload.payload.order?.entity.notes?.tenant_id;

	if (!tenantId) {
		console.error('Razorpay webhook: Missing tenant_id in notes');
		return json({ error: 'Missing tenant_id' }, { status: 400 });
	}

	// Fetch tenant to get webhook secret
	const tenant = await db
		.selectFrom('tenants')
		.where('id', '=', tenantId)
		.where('deleted_at', 'is', null)
		.selectAll()
		.executeTakeFirst();

	if (!tenant) {
		console.error('Razorpay webhook: Tenant not found:', tenantId);
		return json({ error: 'Tenant not found' }, { status: 404 });
	}

	const paymentGateways = tenant.payment_gateways as PaymentGatewayConfig;
	const razorpayConfig = getRazorpayConfig(paymentGateways);

	if (!razorpayConfig?.webhook_secret) {
		console.error('Razorpay webhook: Webhook secret not configured for tenant:', tenantId);
		return json({ error: 'Webhook secret not configured' }, { status: 400 });
	}

	// Verify signature
	const isValid = verifyWebhookSignature(rawBody, signature, razorpayConfig.webhook_secret);
	if (!isValid) {
		console.error('Razorpay webhook: Invalid signature');
		return json({ error: 'Invalid signature' }, { status: 401 });
	}

	console.log('Razorpay webhook event:', payload.event);

	// Handle payment.captured event
	if (payload.event === 'payment.captured') {
		const paymentEntity = payload.payload.payment?.entity;
		if (!paymentEntity) {
			console.error('Razorpay webhook: Missing payment entity');
			return json({ error: 'Missing payment entity' }, { status: 400 });
		}

		const razorpayOrderId = paymentEntity.order_id;
		const razorpayPaymentId = paymentEntity.id;
		const bookingId = paymentEntity.notes?.booking_id;

		if (!bookingId) {
			console.error('Razorpay webhook: Missing booking_id in notes');
			return json({ error: 'Missing booking_id' }, { status: 400 });
		}

		// Find the payment record by gateway_payment_id (order_id)
		const payment = await db
			.selectFrom('payments')
			.where('gateway_payment_id', '=', razorpayOrderId)
			.where('tenant_id', '=', tenantId)
			.where('booking_id', '=', bookingId)
			.selectAll()
			.executeTakeFirst();

		if (!payment) {
			console.error('Razorpay webhook: Payment not found for order:', razorpayOrderId);
			return json({ error: 'Payment not found' }, { status: 404 });
		}

		if (payment.status === 'completed') {
			// Already processed - idempotent
			console.log('Razorpay webhook: Payment already completed:', razorpayPaymentId);
			return json({ success: true, message: 'Already processed' });
		}

		// Update payment status
		await db
			.updateTable('payments')
			.set({
				status: 'completed',
				gateway_response: {
					order_id: razorpayOrderId,
					payment_id: razorpayPaymentId,
					provider: 'razorpay',
					method: paymentEntity.method,
					fee: paymentEntity.fee,
					tax: paymentEntity.tax,
					captured_at: new Date().toISOString()
				},
				updated_at: new Date()
			})
			.where('id', '=', payment.id)
			.execute();

		// Confirm booking
		const booking = await confirmBooking(bookingId, tenantId);
		if (!booking) {
			console.error('Razorpay webhook: Failed to confirm booking:', bookingId);
			// Payment is already marked complete, but booking confirmation failed
			// This should be investigated manually
		}

		console.log('Razorpay webhook: Payment captured and booking confirmed:', {
			paymentId: razorpayPaymentId,
			bookingId
		});

		return json({ success: true });
	}

	// Handle payment.failed event
	if (payload.event === 'payment.failed') {
		const paymentEntity = payload.payload.payment?.entity;
		if (!paymentEntity) {
			return json({ error: 'Missing payment entity' }, { status: 400 });
		}

		const razorpayOrderId = paymentEntity.order_id;
		const bookingId = paymentEntity.notes?.booking_id;

		if (!bookingId) {
			return json({ error: 'Missing booking_id' }, { status: 400 });
		}

		// Find and update payment
		const payment = await db
			.selectFrom('payments')
			.where('gateway_payment_id', '=', razorpayOrderId)
			.where('tenant_id', '=', tenantId)
			.where('booking_id', '=', bookingId)
			.selectAll()
			.executeTakeFirst();

		if (payment && payment.status === 'pending') {
			await db
				.updateTable('payments')
				.set({
					status: 'failed',
					gateway_response: {
						order_id: razorpayOrderId,
						payment_id: paymentEntity.id,
						provider: 'razorpay',
						error_code: paymentEntity.error_code,
						error_description: paymentEntity.error_description,
						failed_at: new Date().toISOString()
					},
					updated_at: new Date()
				})
				.where('id', '=', payment.id)
				.execute();

			console.log('Razorpay webhook: Payment failed:', {
				paymentId: paymentEntity.id,
				error: paymentEntity.error_description
			});
		}

		return json({ success: true });
	}

	// Handle order.paid event (alternative to payment.captured)
	if (payload.event === 'order.paid') {
		const orderEntity = payload.payload.order?.entity;
		if (!orderEntity) {
			return json({ error: 'Missing order entity' }, { status: 400 });
		}

		const bookingId = orderEntity.notes?.booking_id;
		if (!bookingId) {
			return json({ error: 'Missing booking_id' }, { status: 400 });
		}

		// Check if already processed via payment.captured
		const payment = await db
			.selectFrom('payments')
			.where('gateway_payment_id', '=', orderEntity.id)
			.where('tenant_id', '=', tenantId)
			.selectAll()
			.executeTakeFirst();

		if (payment && payment.status === 'completed') {
			return json({ success: true, message: 'Already processed' });
		}

		// If not already completed, mark as completed
		if (payment && payment.status === 'pending') {
			await db
				.updateTable('payments')
				.set({
					status: 'completed',
					gateway_response: {
						order_id: orderEntity.id,
						provider: 'razorpay',
						order_status: orderEntity.status,
						completed_at: new Date().toISOString()
					},
					updated_at: new Date()
				})
				.where('id', '=', payment.id)
				.execute();

			await confirmBooking(bookingId, tenantId);
		}

		return json({ success: true });
	}

	// Other events - acknowledge but don't process
	console.log('Razorpay webhook: Unhandled event:', payload.event);
	return json({ success: true, message: 'Event acknowledged' });
};
