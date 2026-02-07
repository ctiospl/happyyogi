import { loadPageForRoute } from '$lib/server/pages';
import { getFormBySlug, createSubmission } from '$lib/server/forms';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const pageData = await loadPageForRoute(locals.tenant?.id, 'contact');

	let contactForm = null;
	if (locals.tenant) {
		const form = await getFormBySlug(locals.tenant.id, 'contact');
		if (form && form.status === 'published') {
			contactForm = form;
		}
	}

	return { ...pageData, contactForm };
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
				submitted_via: 'contact-page'
			}) as any
		});

		return { success: true };
	}
};
