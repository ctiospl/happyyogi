import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { error, fail } from '@sveltejs/kit';
import type { PaymentGatewayConfig } from '$lib/server/db/schema';
import { sql } from 'kysely';

function maskSecret(secret: string | undefined): string {
	if (!secret || secret.length <= 4) return '••••••••';
	return '••••••' + secret.slice(-4);
}

function maskConfig(config: PaymentGatewayConfig): PaymentGatewayConfig {
	return {
		razorpay: config.razorpay
			? {
					enabled: config.razorpay.enabled,
					key_id: config.razorpay.key_id,
					key_secret: config.razorpay.key_secret ? maskSecret(config.razorpay.key_secret) : undefined,
					webhook_secret: config.razorpay.webhook_secret
						? maskSecret(config.razorpay.webhook_secret)
						: undefined
				}
			: undefined,
		cashfree: config.cashfree
			? {
					enabled: config.cashfree.enabled,
					app_id: config.cashfree.app_id,
					secret_key: config.cashfree.secret_key ? maskSecret(config.cashfree.secret_key) : undefined,
					webhook_secret: config.cashfree.webhook_secret
						? maskSecret(config.cashfree.webhook_secret)
						: undefined
				}
			: undefined,
		upi_manual: config.upi_manual
	};
}

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.tenant) {
		throw error(404, 'Tenant not found');
	}

	if (locals.tenantLink?.role !== 'admin' && locals.tenantLink?.role !== 'superadmin') {
		throw error(403, 'Admin access required');
	}

	const tenant = await db
		.selectFrom('tenants')
		.where('id', '=', locals.tenant.id)
		.select(['payment_gateways'])
		.executeTakeFirst();

	const config = (tenant?.payment_gateways as PaymentGatewayConfig) || {};

	return {
		tenant: locals.tenant,
		gatewayConfig: maskConfig(config)
	};
};

export const actions: Actions = {
	save: async ({ request, locals }) => {
		if (!locals.tenant) {
			return fail(404, { error: 'Tenant not found' });
		}

		if (locals.tenantLink?.role !== 'admin' && locals.tenantLink?.role !== 'superadmin') {
			return fail(403, { error: 'Admin access required' });
		}

		const formData = await request.formData();

		// Get existing config to preserve masked secrets
		const existing = await db
			.selectFrom('tenants')
			.where('id', '=', locals.tenant.id)
			.select(['payment_gateways'])
			.executeTakeFirst();

		const existingConfig = (existing?.payment_gateways as PaymentGatewayConfig) || {};

		// Build new config
		const newConfig: PaymentGatewayConfig = {};

		// Razorpay
		const razorpayEnabled = formData.get('razorpay_enabled') === 'on';
		if (razorpayEnabled) {
			const keyId = formData.get('razorpay_key_id') as string;
			const keySecret = formData.get('razorpay_key_secret') as string;
			const webhookSecret = formData.get('razorpay_webhook_secret') as string;

			newConfig.razorpay = {
				enabled: true,
				key_id: keyId || existingConfig.razorpay?.key_id,
				key_secret: keySecret?.startsWith('••')
					? existingConfig.razorpay?.key_secret
					: keySecret || existingConfig.razorpay?.key_secret,
				webhook_secret: webhookSecret?.startsWith('••')
					? existingConfig.razorpay?.webhook_secret
					: webhookSecret || existingConfig.razorpay?.webhook_secret
			};
		} else {
			newConfig.razorpay = { enabled: false };
		}

		// Cashfree
		const cashfreeEnabled = formData.get('cashfree_enabled') === 'on';
		if (cashfreeEnabled) {
			const appId = formData.get('cashfree_app_id') as string;
			const secretKey = formData.get('cashfree_secret_key') as string;
			const webhookSecret = formData.get('cashfree_webhook_secret') as string;

			newConfig.cashfree = {
				enabled: true,
				app_id: appId || existingConfig.cashfree?.app_id,
				secret_key: secretKey?.startsWith('••')
					? existingConfig.cashfree?.secret_key
					: secretKey || existingConfig.cashfree?.secret_key,
				webhook_secret: webhookSecret?.startsWith('••')
					? existingConfig.cashfree?.webhook_secret
					: webhookSecret || existingConfig.cashfree?.webhook_secret
			};
		} else {
			newConfig.cashfree = { enabled: false };
		}

		// UPI Manual
		const upiEnabled = formData.get('upi_enabled') === 'on';
		if (upiEnabled) {
			newConfig.upi_manual = {
				enabled: true,
				upi_id: (formData.get('upi_id') as string) || existingConfig.upi_manual?.upi_id,
				qr_image_url:
					(formData.get('upi_qr_image_url') as string) || existingConfig.upi_manual?.qr_image_url
			};
		} else {
			newConfig.upi_manual = { enabled: false };
		}

		// Save to database
		await db
			.updateTable('tenants')
			.set({
				payment_gateways: sql`${JSON.stringify(newConfig)}::jsonb`,
				updated_at: new Date()
			})
			.where('id', '=', locals.tenant.id)
			.execute();

		return { success: true };
	}
};
