import type { PageServerLoad, Actions } from './$types';
import { getTemplateById, updateTemplate, deleteTemplate, saveDraft, publishTemplate, forkTemplate } from '$lib/server/templates/crud';
import { error, fail, redirect } from '@sveltejs/kit';
import type { TemplateSchema } from '$lib/server/db/schema';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.tenant) {
		throw error(404, 'Tenant not found');
	}

	if (locals.tenantLink?.role !== 'admin') {
		throw error(403, 'Admin access required');
	}

	const template = await getTemplateById(params.id);

	if (!template) {
		throw error(404, 'Template not found');
	}

	// Check tenant ownership (unless it's a core template)
	if (template.tenant_id && template.tenant_id !== locals.tenant.id) {
		throw error(403, 'Access denied');
	}

	return {
		template,
		tenant: locals.tenant
	};
};

export const actions: Actions = {
	save: async ({ request, params, locals }) => {
		if (!locals.tenant || locals.tenantLink?.role !== 'admin') {
			return fail(403, { error: 'Not authorized' });
		}

		const formData = await request.formData();
		const sourceCode = formData.get('source_code') as string;
		const schemaJson = formData.get('schema') as string;
		const sampleDataJson = formData.get('sample_data') as string;
		const name = formData.get('name') as string | null;
		const slug = formData.get('slug') as string | null;

		if (!sourceCode) {
			return fail(400, { error: 'Source code is required' });
		}

		let schema: TemplateSchema = { fields: [] };
		let sampleData: Record<string, unknown> = {};

		try {
			if (schemaJson) schema = JSON.parse(schemaJson);
			if (sampleDataJson) sampleData = JSON.parse(sampleDataJson);
		} catch {
			return fail(400, { error: 'Invalid JSON in schema or sample data' });
		}

		const updateData: Parameters<typeof updateTemplate>[1] = {
			source_code: sourceCode,
			schema,
			sample_data: sampleData
		};

		if (name) updateData.name = name;
		if (slug) updateData.slug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-');

		const template = await updateTemplate(params.id, updateData);

		if (!template) {
			return fail(404, { error: 'Template not found' });
		}

		return {
			success: true,
			template
		};
	},

	saveDraft: async ({ request, params, locals }) => {
		if (!locals.tenant || locals.tenantLink?.role !== 'admin') {
			return fail(403, { error: 'Not authorized' });
		}

		const formData = await request.formData();
		const sourceCode = formData.get('source_code') as string;
		const schemaJson = formData.get('schema') as string;
		const sampleDataJson = formData.get('sample_data') as string;

		if (!sourceCode) {
			return fail(400, { error: 'Source code is required' });
		}

		let schema: TemplateSchema = { fields: [] };
		let sampleData: Record<string, unknown> = {};
		try {
			if (schemaJson) schema = JSON.parse(schemaJson);
			if (sampleDataJson) sampleData = JSON.parse(sampleDataJson);
		} catch {
			return fail(400, { error: 'Invalid JSON in schema or sample data' });
		}

		// Save draft source_code + update schema/sample_data
		await saveDraft(params.id, sourceCode);
		await updateTemplate(params.id, { schema, sample_data: sampleData });

		return { success: true, action: 'draft' };
	},

	publish: async ({ params, locals }) => {
		if (!locals.tenant || locals.tenantLink?.role !== 'admin') {
			return fail(403, { error: 'Not authorized' });
		}

		const template = await publishTemplate(params.id);
		if (!template) {
			return fail(404, { error: 'Template not found' });
		}

		if (template.compile_error) {
			return fail(400, { error: `Publish failed: ${template.compile_error}` });
		}

		return { success: true, action: 'publish', template };
	},

	delete: async ({ params, locals }) => {
		if (!locals.tenant || locals.tenantLink?.role !== 'admin') {
			return fail(403, { error: 'Not authorized' });
		}

		const template = await getTemplateById(params.id);

		if (!template) {
			return fail(404, { error: 'Template not found' });
		}

		// Can't delete core templates
		if (template.is_core) {
			return fail(403, { error: 'Cannot delete core templates' });
		}

		// Check ownership
		if (template.tenant_id !== locals.tenant.id) {
			return fail(403, { error: 'Access denied' });
		}

		await deleteTemplate(params.id);

		throw redirect(302, '/admin/templates');
	},

	fork: async ({ params, locals }) => {
		if (!locals.tenant || locals.tenantLink?.role !== 'admin') {
			return fail(403, { error: 'Not authorized' });
		}

		const template = await getTemplateById(params.id);
		if (!template) {
			return fail(404, { error: 'Template not found' });
		}
		if (template.tenant_id && template.tenant_id !== locals.tenant.id) {
			return fail(403, { error: 'Access denied' });
		}

		const newId = await forkTemplate(params.id, locals.tenant.id);
		throw redirect(302, `/admin/templates/${newId}`);
	}
};
