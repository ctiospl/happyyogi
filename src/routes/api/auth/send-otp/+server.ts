import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { sendOtp } from '$lib/server/auth';

export const POST: RequestHandler = async ({ request }) => {
	const { phone } = await request.json();

	if (!phone || typeof phone !== 'string') {
		return json({ success: false, error: 'Phone number is required' }, { status: 400 });
	}

	// Basic phone validation
	const cleanPhone = phone.replace(/\s/g, '');
	if (!/^\+?[0-9]{10,15}$/.test(cleanPhone)) {
		return json({ success: false, error: 'Invalid phone number format' }, { status: 400 });
	}

	const result = await sendOtp(cleanPhone, 'login');

	if (!result.success) {
		return json({ success: false, error: result.error }, { status: 400 });
	}

	return json({ success: true });
};
