import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { authenticateWithPassword } from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals }) => {
	// Redirect to dashboard if already logged in as admin
	if (locals.user && (locals.tenantLink?.role === 'admin' || locals.tenantLink?.role === 'superadmin')) {
		throw redirect(302, '/admin');
	}

	return {
		tenant: locals.tenant
	};
};

export const actions: Actions = {
	default: async ({ request, locals, cookies, getClientAddress }) => {
		if (!locals.tenant) {
			return fail(400, { error: 'Tenant not found' });
		}

		const formData = await request.formData();
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;

		if (!email || !password) {
			return fail(400, { error: 'Email and password are required', email });
		}

		const result = await authenticateWithPassword(
			email,
			password,
			cookies,
			locals.tenant.id,
			{
				userAgent: request.headers.get('user-agent') || undefined,
				ip: getClientAddress()
			}
		);

		if (!result.success) {
			return fail(401, { error: result.error, email });
		}

		throw redirect(302, '/admin');
	}
};
