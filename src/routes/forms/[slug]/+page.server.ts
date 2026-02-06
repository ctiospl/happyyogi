import type { PageServerLoad, Actions } from './$types';
import { getFormBySlug, createSubmission } from '$lib/server/forms';
import { error, fail } from '@sveltejs/kit';
import type { FormFieldDef } from '$lib/server/db/schema';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.tenant) throw error(404, 'Tenant not found');

	const form = await getFormBySlug(locals.tenant.id, params.slug);
	if (!form || form.status !== 'published') {
		throw error(404, 'Form not found');
	}

	return { form, tenant: locals.tenant };
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (!locals.tenant) return fail(400, { error: 'Invalid request' });

		const formData = await request.formData();
		const formId = formData.get('form_id') as string;
		const rawData = formData.get('form_data') as string;

		if (!formId) return fail(400, { error: 'Form ID required' });

		let data: Record<string, unknown> = {};
		try {
			data = rawData ? JSON.parse(rawData) : {};
		} catch {
			return fail(400, { error: 'Invalid form data' });
		}

		await createSubmission({
			tenant_id: locals.tenant.id,
			form_id: formId,
			data: JSON.stringify(data) as any,
			metadata: JSON.stringify({
				user_agent: request.headers.get('user-agent') ?? '',
				submitted_via: 'standalone'
			}) as any
		});

		return { success: true };
	}
};
