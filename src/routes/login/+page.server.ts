import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import {
	sendOtp,
	sendEmailOtp,
	authenticateWithOtp,
	authenticateWithEmailOtp
} from '$lib/server/auth';

/** Validate redirect URL to prevent open redirect attacks */
function safeRedirect(url: string | null): string {
	if (!url) return '/';
	// Only allow relative paths, not protocol-relative or absolute URLs
	if (!url.startsWith('/') || url.startsWith('//')) return '/';
	return url;
}

export const load: PageServerLoad = async ({ locals, url }) => {
	// Redirect if already logged in
	if (locals.user) {
		throw redirect(302, safeRedirect(url.searchParams.get('redirect')));
	}

	return {
		tenant: locals.tenant
	};
};

export const actions: Actions = {
	sendPhoneOtp: async ({ request, locals }) => {
		if (!locals.tenant) {
			return fail(400, { error: 'Tenant not found' });
		}

		const formData = await request.formData();
		const phone = formData.get('phone') as string;

		if (!phone) {
			return fail(400, { error: 'Phone number is required', phone });
		}

		// Basic phone validation
		const cleanPhone = phone.replace(/\s/g, '');
		if (!/^\+?[0-9]{10,15}$/.test(cleanPhone)) {
			return fail(400, { error: 'Invalid phone number format', phone });
		}

		const result = await sendOtp(cleanPhone, 'login');

		if (!result.success) {
			return fail(400, { error: result.error, phone });
		}

		return { success: true, otpSent: true, phone: cleanPhone, method: 'phone' };
	},

	sendEmailOtp: async ({ request, locals }) => {
		if (!locals.tenant) {
			return fail(400, { error: 'Tenant not found' });
		}

		const formData = await request.formData();
		const email = formData.get('email') as string;

		if (!email) {
			return fail(400, { error: 'Email is required', email });
		}

		// Basic email validation
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			return fail(400, { error: 'Invalid email format', email });
		}

		const result = await sendEmailOtp(email.toLowerCase().trim(), 'login');

		if (!result.success) {
			return fail(400, { error: result.error, email });
		}

		return { success: true, otpSent: true, email: email.toLowerCase().trim(), method: 'email' };
	},

	verifyPhoneOtp: async ({ request, locals, cookies, getClientAddress, url }) => {
		if (!locals.tenant) {
			return fail(400, { error: 'Tenant not found' });
		}

		const formData = await request.formData();
		const phone = formData.get('phone') as string;
		const code = formData.get('code') as string;

		if (!phone || !code) {
			return fail(400, { error: 'Phone and OTP code are required', phone });
		}

		const result = await authenticateWithOtp(phone, code, cookies, locals.tenant.id, {
			userAgent: request.headers.get('user-agent') || undefined,
			ip: getClientAddress()
		});

		if (!result.success) {
			return fail(401, { error: result.error, phone, otpSent: true, method: 'phone' });
		}

		const redirectTo = safeRedirect(url.searchParams.get('redirect'));
		throw redirect(302, redirectTo);
	},

	verifyEmailOtp: async ({ request, locals, cookies, getClientAddress, url }) => {
		if (!locals.tenant) {
			return fail(400, { error: 'Tenant not found' });
		}

		const formData = await request.formData();
		const email = formData.get('email') as string;
		const code = formData.get('code') as string;

		if (!email || !code) {
			return fail(400, { error: 'Email and OTP code are required', email });
		}

		const result = await authenticateWithEmailOtp(email, code, cookies, locals.tenant.id, {
			userAgent: request.headers.get('user-agent') || undefined,
			ip: getClientAddress()
		});

		if (!result.success) {
			return fail(401, { error: result.error, email, otpSent: true, method: 'email' });
		}

		const redirectTo = safeRedirect(url.searchParams.get('redirect'));
		throw redirect(302, redirectTo);
	}
};
