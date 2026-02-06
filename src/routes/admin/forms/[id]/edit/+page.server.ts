import type { PageServerLoad, Actions } from './$types';
import { getFormById, updateForm, publishForm, deleteForm } from '$lib/server/forms';
import { error, fail, redirect } from '@sveltejs/kit';
import type { FormFieldDef, FormConditionalRule, FormSettings } from '$lib/server/db/schema';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.tenant) throw error(404, 'Tenant not found');
	if (locals.tenantLink?.role !== 'admin') throw error(403, 'Admin access required');

	const form = await getFormById(params.id);
	if (!form || form.tenant_id !== locals.tenant.id) {
		throw error(404, 'Form not found');
	}

	return { form, tenant: locals.tenant };
};

export const actions: Actions = {
	save: async ({ request, params, locals }) => {
		if (!locals.tenant || locals.tenantLink?.role !== 'admin') {
			return fail(403, { error: 'Not authorized' });
		}

		const formData = await request.formData();
		const fieldsJson = formData.get('fields') as string;
		const settingsJson = formData.get('settings') as string;
		const rulesJson = formData.get('conditional_rules') as string;
		const title = formData.get('title') as string;
		const slug = formData.get('slug') as string;

		try {
			const updateData: Record<string, unknown> = {};
			if (fieldsJson) updateData.fields = fieldsJson;
			if (settingsJson) updateData.settings = settingsJson;
			if (rulesJson) updateData.conditional_rules = rulesJson;
			if (title) updateData.title = title;
			if (slug) updateData.slug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-');

			await updateForm(params.id, updateData);
			return { success: true, message: 'Form saved' };
		} catch {
			return fail(400, { error: 'Failed to save form' });
		}
	},

	publish: async ({ params, locals }) => {
		if (!locals.tenant || locals.tenantLink?.role !== 'admin') {
			return fail(403, { error: 'Not authorized' });
		}
		await publishForm(params.id);
		return { success: true, message: 'Form published' };
	},

	unpublish: async ({ params, locals }) => {
		if (!locals.tenant || locals.tenantLink?.role !== 'admin') {
			return fail(403, { error: 'Not authorized' });
		}
		await updateForm(params.id, { status: 'draft' });
		return { success: true, message: 'Form unpublished' };
	},

	delete: async ({ params, locals }) => {
		if (!locals.tenant || locals.tenantLink?.role !== 'admin') {
			return fail(403, { error: 'Not authorized' });
		}
		await deleteForm(params.id);
		throw redirect(302, '/admin/forms');
	}
};
