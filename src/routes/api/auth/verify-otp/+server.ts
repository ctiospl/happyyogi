import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { authenticateWithOtp } from '$lib/server/auth';

export const POST: RequestHandler = async ({ request, cookies, locals, getClientAddress }) => {
	const { phone, code, name, email } = await request.json();

	if (!phone || typeof phone !== 'string') {
		return json({ success: false, error: 'Phone number is required' }, { status: 400 });
	}

	if (!code || typeof code !== 'string') {
		return json({ success: false, error: 'OTP code is required' }, { status: 400 });
	}

	// Get tenant ID from locals (set in hooks)
	const tenantId = locals.tenant?.id || null;

	// Device info for session
	const deviceInfo = {
		userAgent: request.headers.get('user-agent') || undefined,
		ip: getClientAddress()
	};

	const result = await authenticateWithOtp(phone, code, cookies, tenantId, deviceInfo);

	if (!result.success) {
		return json({ success: false, error: result.error }, { status: 400 });
	}

	// If new user and name/email provided, update profile
	if (result.isNewUser && (name || email)) {
		const { updateUserProfile } = await import('$lib/server/auth');
		await updateUserProfile(result.user!.id, {
			name: name || undefined,
			email: email || undefined
		});
	}

	return json({
		success: true,
		isNewUser: result.isNewUser,
		user: {
			id: result.user!.id,
			phone: result.user!.phone,
			name: result.user!.name,
			email: result.user!.email
		}
	});
};
