import { createHmac, timingSafeEqual } from 'crypto';
import type { PaymentGatewayConfig } from '$lib/server/db/schema';

export interface RazorpayConfig {
	key_id: string;
	key_secret: string;
	webhook_secret?: string;
}

export interface RazorpayOrderResponse {
	id: string;
	entity: string;
	amount: number;
	amount_paid: number;
	amount_due: number;
	currency: string;
	receipt: string;
	status: 'created' | 'attempted' | 'paid';
	notes: Record<string, string>;
	created_at: number;
}

export interface CreateOrderParams {
	amount: number; // in paise
	currency: string;
	receipt: string;
	notes?: Record<string, string>;
}

/**
 * Extract Razorpay config from tenant payment_gateways
 */
export function getRazorpayConfig(paymentGateways: PaymentGatewayConfig): RazorpayConfig | null {
	const razorpay = paymentGateways.razorpay;
	if (!razorpay?.enabled || !razorpay.key_id || !razorpay.key_secret) {
		return null;
	}
	return {
		key_id: razorpay.key_id,
		key_secret: razorpay.key_secret,
		webhook_secret: razorpay.webhook_secret
	};
}

/**
 * Create Razorpay order
 */
export async function createOrder(
	config: RazorpayConfig,
	params: CreateOrderParams
): Promise<{ order?: RazorpayOrderResponse; error?: string }> {
	const { amount, currency, receipt, notes } = params;

	const authHeader = Buffer.from(`${config.key_id}:${config.key_secret}`).toString('base64');

	try {
		const response = await fetch('https://api.razorpay.com/v1/orders', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Basic ${authHeader}`
			},
			body: JSON.stringify({
				amount,
				currency,
				receipt,
				notes: notes || {}
			})
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			console.error('Razorpay order creation failed:', errorData);
			return {
				error: errorData.error?.description || `Razorpay API error: ${response.status}`
			};
		}

		const order = (await response.json()) as RazorpayOrderResponse;
		return { order };
	} catch (err) {
		console.error('Razorpay request failed:', err);
		return { error: 'Failed to connect to Razorpay' };
	}
}

/**
 * Verify Razorpay webhook signature
 * Uses timing-safe comparison to prevent timing attacks
 */
export function verifyWebhookSignature(
	payload: string,
	signature: string,
	secret: string
): boolean {
	if (!signature || !secret) {
		return false;
	}

	try {
		const expectedSignature = createHmac('sha256', secret).update(payload).digest('hex');

		// Use timing-safe comparison
		const sigBuffer = Buffer.from(signature, 'hex');
		const expectedBuffer = Buffer.from(expectedSignature, 'hex');

		if (sigBuffer.length !== expectedBuffer.length) {
			return false;
		}

		return timingSafeEqual(sigBuffer, expectedBuffer);
	} catch {
		return false;
	}
}

/**
 * Verify Razorpay payment signature (for frontend callback)
 * Verifies: razorpay_order_id|razorpay_payment_id
 */
export function verifyPaymentSignature(
	orderId: string,
	paymentId: string,
	signature: string,
	keySecret: string
): boolean {
	if (!orderId || !paymentId || !signature || !keySecret) {
		return false;
	}

	try {
		const payload = `${orderId}|${paymentId}`;
		const expectedSignature = createHmac('sha256', keySecret).update(payload).digest('hex');

		const sigBuffer = Buffer.from(signature, 'hex');
		const expectedBuffer = Buffer.from(expectedSignature, 'hex');

		if (sigBuffer.length !== expectedBuffer.length) {
			return false;
		}

		return timingSafeEqual(sigBuffer, expectedBuffer);
	} catch {
		return false;
	}
}

/**
 * Fetch order details from Razorpay
 */
export async function getOrder(
	config: RazorpayConfig,
	orderId: string
): Promise<{ order?: RazorpayOrderResponse; error?: string }> {
	const authHeader = Buffer.from(`${config.key_id}:${config.key_secret}`).toString('base64');

	try {
		const response = await fetch(`https://api.razorpay.com/v1/orders/${orderId}`, {
			method: 'GET',
			headers: {
				Authorization: `Basic ${authHeader}`
			}
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			return {
				error: errorData.error?.description || `Razorpay API error: ${response.status}`
			};
		}

		const order = (await response.json()) as RazorpayOrderResponse;
		return { order };
	} catch (err) {
		console.error('Razorpay fetch order failed:', err);
		return { error: 'Failed to connect to Razorpay' };
	}
}
