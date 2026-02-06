import type { PageServerLoad, Actions } from './$types';
import { getFormById, getFormSubmissions, getSubmissionCount, deleteSubmission } from '$lib/server/forms';
import { error, fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals, url }) => {
	if (!locals.tenant) throw error(404, 'Tenant not found');
	if (locals.tenantLink?.role !== 'admin') throw error(403, 'Admin access required');

	const form = await getFormById(params.id);
	if (!form || form.tenant_id !== locals.tenant.id) {
		throw error(404, 'Form not found');
	}

	const page = Number(url.searchParams.get('page') ?? '1');
	const limit = 50;
	const offset = (page - 1) * limit;

	const [submissions, total] = await Promise.all([
		getFormSubmissions(form.id, { limit, offset }),
		getSubmissionCount(form.id)
	]);

	return {
		form,
		submissions,
		total,
		page,
		totalPages: Math.ceil(total / limit),
		tenant: locals.tenant
	};
};

export const actions: Actions = {
	delete: async ({ request, locals }) => {
		if (!locals.tenant || locals.tenantLink?.role !== 'admin') {
			return fail(403, { error: 'Not authorized' });
		}

		const formData = await request.formData();
		const id = formData.get('id') as string;
		if (!id) return fail(400, { error: 'Submission ID required' });

		await deleteSubmission(id);
		return { success: true };
	}
};
