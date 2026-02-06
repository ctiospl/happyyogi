import type { PageServerLoad, Actions } from './$types';
import { getForms, createForm, deleteForm, getSubmissionCount } from '$lib/server/forms';
import { error, fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.tenant) throw error(404, 'Tenant not found');
	if (locals.tenantLink?.role !== 'admin') throw error(403, 'Admin access required');

	const forms = await getForms(locals.tenant.id);

	// Get submission counts for each form
	const formsWithCounts = await Promise.all(
		forms.map(async (form) => ({
			...form,
			submission_count: await getSubmissionCount(form.id)
		}))
	);

	return { forms: formsWithCounts, tenant: locals.tenant };
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		if (!locals.tenant || locals.tenantLink?.role !== 'admin') {
			return fail(403, { error: 'Not authorized' });
		}

		const formData = await request.formData();
		const title = formData.get('title') as string;
		const slug = formData.get('slug') as string;
		const type = (formData.get('type') as string) || 'standalone';

		if (!title || !slug) {
			return fail(400, { error: 'Title and slug are required' });
		}

		const form = await createForm({
			tenant_id: locals.tenant.id,
			title,
			slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
			type: type as 'standalone' | 'inline',
			status: 'draft',
			updated_at: new Date()
		});

		throw redirect(302, `/admin/forms/${form.id}/edit`);
	},

	delete: async ({ request, locals }) => {
		if (!locals.tenant || locals.tenantLink?.role !== 'admin') {
			return fail(403, { error: 'Not authorized' });
		}

		const formData = await request.formData();
		const id = formData.get('id') as string;
		if (!id) return fail(400, { error: 'Form ID required' });

		await deleteForm(id);
		return { success: true };
	}
};
