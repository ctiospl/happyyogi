import crypto from 'crypto';
import type { PaymentGatewayConfig } from '$lib/server/db/schema';

export interface CashfreeConfig {
	app_id: string;
	secret_key: string;
	webhook_secret?: string;
}

/**
 * Extract Cashfree config from tenant payment_gateways
 */
export function getCashfreeConfig(paymentGateways: PaymentGatewayConfig): CashfreeConfig | null {
	const cashfree = paymentGateways.cashfree;
	if (!cashfree?.enabled || !cashfree.app_id || !cashfree.secret_key) {
		return null;
	}
	return {
		app_id: cashfree.app_id,
		secret_key: cashfree.secret_key,
		webhook_secret: cashfree.webhook_secret
	};
}

/**
 * Determine if using sandbox based on app_id pattern
 */
function isSandboxMode(appId: string): boolean {
	return appId.toLowerCase().includes('test') || appId.toLowerCase().includes('sandbox');
}

export interface CustomerDetails {
	customer_id: string;
	customer_name?: string;
	customer_email?: string;
	customer_phone: string;
}

export interface CreateOrderRequest {
	order_id: string;
	order_amount: number;
	order_currency: string;
	customer_details: CustomerDetails;
	order_meta?: {
		return_url?: string;
		notify_url?: string;
	};
}

export interface CashfreeOrderResponse {
	cf_order_id: string;
	order_id: string;
	entity: string;
	order_currency: string;
	order_amount: number;
	order_status: string;
	payment_session_id: string;
	order_expiry_time: string;
	order_note?: string;
	customer_details: CustomerDetails;
	order_meta?: {
		return_url?: string;
		notify_url?: string;
		payment_methods?: string;
	};
	payments?: {
		url: string;
	};
	settlements?: {
		url: string;
	};
	refunds?: {
		url: string;
	};
}

export interface CashfreeWebhookPayload {
	type: string;
	data: {
		order: {
			order_id: string;
			order_amount: number;
			order_currency: string;
			order_status: string;
		};
		payment: {
			cf_payment_id: string;
			payment_status: string;
			payment_amount: number;
			payment_currency: string;
			payment_message?: string;
			payment_time: string;
			payment_method?: {
				card?: Record<string, unknown>;
				upi?: { upi_id?: string };
				netbanking?: { netbanking_bank_name?: string };
			};
		};
		customer_details: CustomerDetails;
	};
	event_time: string;
}

/**
 * Verify Cashfree webhook signature standalone function
 */
export function verifyCashfreeWebhookSignature(
	payload: string,
	signature: string,
	timestamp: string,
	webhookSecret: string
): boolean {
	const data = timestamp + payload;
	const expectedSignature = crypto
		.createHmac('sha256', webhookSecret)
		.update(data)
		.digest('base64');

	try {
		return crypto.timingSafeEqual(
			Buffer.from(signature, 'base64'),
			Buffer.from(expectedSignature, 'base64')
		);
	} catch {
		return false;
	}
}

export interface CreateCashfreeOrderParams {
	orderId: string;
	amount: number; // in paise
	currency: string;
	customerId: string;
	customerName?: string;
	customerEmail?: string;
	customerPhone: string;
	returnUrl?: string;
	notifyUrl?: string;
}

/**
 * Create Cashfree order (functional style matching razorpay.ts)
 */
export async function createOrder(
	config: CashfreeConfig,
	params: CreateCashfreeOrderParams
): Promise<{ order?: CashfreeOrderResponse; error?: string }> {
	const baseUrl = isSandboxMode(config.app_id)
		? 'https://sandbox.cashfree.com/pg'
		: 'https://api.cashfree.com/pg';

	// Cashfree expects amount in rupees (not paise)
	const amountRupees = params.amount / 100;

	try {
		const response = await fetch(`${baseUrl}/orders`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-client-id': config.app_id,
				'x-client-secret': config.secret_key,
				'x-api-version': '2022-09-01'
			},
			body: JSON.stringify({
				order_id: params.orderId,
				order_amount: amountRupees,
				order_currency: params.currency.toUpperCase(),
				customer_details: {
					customer_id: params.customerId,
					customer_name: params.customerName,
					customer_email: params.customerEmail,
					customer_phone: params.customerPhone
				},
				order_meta: {
					return_url: params.returnUrl,
					notify_url: params.notifyUrl
				}
			})
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			console.error('Cashfree order creation failed:', errorData);
			return {
				error: errorData.message || `Cashfree API error: ${response.status}`
			};
		}

		const order = (await response.json()) as CashfreeOrderResponse;
		return { order };
	} catch (err) {
		console.error('Cashfree request failed:', err);
		return { error: 'Failed to connect to Cashfree' };
	}
}

/**
 * Fetch order details from Cashfree
 */
export async function getOrder(
	config: CashfreeConfig,
	orderId: string
): Promise<{ order?: CashfreeOrderResponse; error?: string }> {
	const baseUrl = isSandboxMode(config.app_id)
		? 'https://sandbox.cashfree.com/pg'
		: 'https://api.cashfree.com/pg';

	try {
		const response = await fetch(`${baseUrl}/orders/${orderId}`, {
			method: 'GET',
			headers: {
				'x-client-id': config.app_id,
				'x-client-secret': config.secret_key,
				'x-api-version': '2022-09-01'
			}
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			return {
				error: errorData.message || `Cashfree API error: ${response.status}`
			};
		}

		const order = (await response.json()) as CashfreeOrderResponse;
		return { order };
	} catch (err) {
		console.error('Cashfree fetch order failed:', err);
		return { error: 'Failed to connect to Cashfree' };
	}
}
