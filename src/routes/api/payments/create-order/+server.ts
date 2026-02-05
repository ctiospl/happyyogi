import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getBookingById, createPayment } from '$lib/server/bookings';
import { getRazorpayConfig, createOrder as createRazorpayOrder } from '$lib/server/payments/razorpay';
import { getCashfreeConfig, createOrder as createCashfreeOrder } from '$lib/server/payments/cashfree';
import type { PaymentGatewayConfig } from '$lib/server/db/schema';

type Gateway = 'razorpay' | 'cashfree' | 'upi_manual';

export const POST: RequestHandler = async ({ request, locals }) => {
	const tenant = locals.tenant;
	if (!tenant) {
		return json({ success: false, error: 'Tenant not found' }, { status: 400 });
	}

	const user = locals.user;
	if (!user) {
		return json({ success: false, error: 'Authentication required' }, { status: 401 });
	}

	let body: { bookingId?: string; gateway?: Gateway };
	try {
		body = await request.json();
	} catch {
		return json({ success: false, error: 'Invalid JSON' }, { status: 400 });
	}

	const { bookingId, gateway } = body;

	if (!bookingId || typeof bookingId !== 'string') {
		return json({ success: false, error: 'bookingId is required' }, { status: 400 });
	}

	if (!gateway || !['razorpay', 'cashfree', 'upi_manual'].includes(gateway)) {
		return json(
			{ success: false, error: 'gateway must be razorpay, cashfree, or upi_manual' },
			{ status: 400 }
		);
	}

	// Fetch booking with details
	const booking = await getBookingById(bookingId);
	if (!booking) {
		return json({ success: false, error: 'Booking not found' }, { status: 404 });
	}

	// Verify booking belongs to tenant
	if (booking.tenant_id !== tenant.id) {
		return json({ success: false, error: 'Booking not found' }, { status: 404 });
	}

	// Verify user owns booking
	if (booking.user_id !== user.id) {
		return json({ success: false, error: 'Unauthorized' }, { status: 403 });
	}

	// Check booking status
	if (booking.status !== 'pending') {
		return json(
			{ success: false, error: `Booking is ${booking.status}, cannot create payment` },
			{ status: 400 }
		);
	}

	// Check hold not expired
	if (booking.hold_expires_at && new Date(booking.hold_expires_at) < new Date()) {
		return json({ success: false, error: 'Booking hold has expired' }, { status: 400 });
	}

	// Calculate amount (price - any discount)
	const discountPaise = booking.discount_amount_paise || 0;
	const amountPaise = booking.workshop.price_paise - discountPaise;

	if (amountPaise <= 0) {
		return json({ success: false, error: 'Invalid payment amount' }, { status: 400 });
	}

	const paymentGateways = tenant.payment_gateways as PaymentGatewayConfig;

	// Handle UPI manual - no order creation needed
	if (gateway === 'upi_manual') {
		const upiConfig = paymentGateways.upi_manual;
		if (!upiConfig?.enabled) {
			return json({ success: false, error: 'UPI manual payments not enabled' }, { status: 400 });
		}

		return json({
			success: true,
			gateway: 'upi_manual',
			upi_id: upiConfig.upi_id,
			qr_image_url: upiConfig.qr_image_url,
			amount_paise: amountPaise,
			currency: tenant.currency
		});
	}

	// Handle Razorpay
	if (gateway === 'razorpay') {
		const razorpayConfig = getRazorpayConfig(paymentGateways);
		if (!razorpayConfig) {
			return json({ success: false, error: 'Razorpay not configured' }, { status: 400 });
		}

		// Create Razorpay order
		const { order, error } = await createRazorpayOrder(razorpayConfig, {
			amount: amountPaise,
			currency: tenant.currency,
			receipt: `booking_${bookingId}`,
			notes: {
				booking_id: bookingId,
				tenant_id: tenant.id,
				user_id: user.id,
				workshop_id: booking.workshop_id
			}
		});

		if (error || !order) {
			console.error('Failed to create Razorpay order:', error);
			return json({ success: false, error: error || 'Failed to create order' }, { status: 500 });
		}

		// Create pending payment record
		await createPayment({
			tenant_id: tenant.id,
			booking_id: bookingId,
			user_id: user.id,
			amount_paise: amountPaise,
			currency: tenant.currency,
			payment_type: 'full',
			method: 'gateway',
			status: 'pending',
			gateway_payment_id: order.id,
			gateway_response: { order_id: order.id, provider: 'razorpay' },
			updated_at: new Date()
		});

		return json({
			success: true,
			gateway: 'razorpay',
			order_id: order.id,
			amount_paise: amountPaise,
			currency: tenant.currency,
			key_id: razorpayConfig.key_id
		});
	}

	// Handle Cashfree
	if (gateway === 'cashfree') {
		const cashfreeConfig = getCashfreeConfig(paymentGateways);
		if (!cashfreeConfig) {
			return json({ success: false, error: 'Cashfree not configured' }, { status: 400 });
		}

		// Generate unique order ID
		const orderId = `order_${bookingId.slice(0, 8)}_${Date.now()}`;

		// Create Cashfree order
		const { order, error } = await createCashfreeOrder(cashfreeConfig, {
			orderId,
			amount: amountPaise,
			currency: tenant.currency,
			customerId: user.id,
			customerName: user.name || undefined,
			customerEmail: user.email || undefined,
			customerPhone: user.phone
		});

		if (error || !order) {
			console.error('Failed to create Cashfree order:', error);
			return json({ success: false, error: error || 'Failed to create order' }, { status: 500 });
		}

		// Create pending payment record
		await createPayment({
			tenant_id: tenant.id,
			booking_id: bookingId,
			user_id: user.id,
			amount_paise: amountPaise,
			currency: tenant.currency,
			payment_type: 'full',
			method: 'gateway',
			status: 'pending',
			gateway_payment_id: order.order_id,
			gateway_response: {
				order_id: order.order_id,
				cf_order_id: order.cf_order_id,
				payment_session_id: order.payment_session_id,
				provider: 'cashfree'
			},
			updated_at: new Date()
		});

		return json({
			success: true,
			gateway: 'cashfree',
			order_id: order.order_id,
			cf_order_id: order.cf_order_id,
			payment_session_id: order.payment_session_id,
			order_amount: order.order_amount,
			order_currency: order.order_currency,
			amount_paise: amountPaise,
			currency: tenant.currency
		});
	}

	return json({ success: false, error: 'Invalid gateway' }, { status: 400 });
};
