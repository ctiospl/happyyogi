import type { PageServerLoad, Actions } from './$types';
import { getPageById, updatePage, publishPage, unpublishPage, deletePage } from '$lib/server/pages';
import { getTenantTemplates } from '$lib/server/templates/crud';
import { getLayouts } from '$lib/server/layouts';
import { getForms } from '$lib/server/forms';
import { error, fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.tenant) {
		throw error(404, 'Tenant not found');
	}

	if (locals.tenantLink?.role !== 'admin') {
		throw error(403, 'Admin access required');
	}

	const page = await getPageById(params.id);

	if (!page || page.tenant_id !== locals.tenant.id) {
		throw error(404, 'Page not found');
	}

	const [templates, layouts, forms] = await Promise.all([
		getTenantTemplates(locals.tenant.id),
		getLayouts(locals.tenant.id),
		getForms(locals.tenant.id)
	]);

	return {
		page,
		templates,
		layouts,
		forms,
		tenant: locals.tenant
	};
};

export const actions: Actions = {
	updateMeta: async ({ request, params, locals }) => {
		if (!locals.tenant || locals.tenantLink?.role !== 'admin') {
			return fail(403, { error: 'Not authorized' });
		}

		const formData = await request.formData();
		const title = formData.get('title') as string;
		const slug = formData.get('slug') as string;
		const seo_title = formData.get('seo_title') as string;
		const seo_description = formData.get('seo_description') as string;
		const layout_id = formData.get('layout_id') as string;
		const no_layout = formData.get('no_layout') === 'true';

		await updatePage(params.id, {
			title,
			slug: slug?.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
			seo_title: seo_title || null,
			seo_description: seo_description || null,
			layout_id: layout_id || null,
			no_layout
		});

		return { success: true, message: 'Settings saved' };
	},

	saveBlocks: async ({ request, params, locals }) => {
		if (!locals.tenant || locals.tenantLink?.role !== 'admin') {
			return fail(403, { error: 'Not authorized' });
		}

		const formData = await request.formData();
		const blocksJson = formData.get('blocks') as string;

		try {
			const blocks = blocksJson ? JSON.parse(blocksJson) : [];
			await updatePage(params.id, {
				blocks: JSON.stringify(blocks) as any
			});
			return { success: true, message: 'Blocks saved' };
		} catch {
			return fail(400, { error: 'Failed to save blocks' });
		}
	},

	publish: async ({ params, locals }) => {
		if (!locals.tenant || locals.tenantLink?.role !== 'admin') {
			return fail(403, { error: 'Not authorized' });
		}

		await publishPage(params.id);
		return { success: true, message: 'Page published' };
	},

	unpublish: async ({ params, locals }) => {
		if (!locals.tenant || locals.tenantLink?.role !== 'admin') {
			return fail(403, { error: 'Not authorized' });
		}

		await unpublishPage(params.id);
		return { success: true, message: 'Page unpublished' };
	},

	delete: async ({ params, locals }) => {
		if (!locals.tenant || locals.tenantLink?.role !== 'admin') {
			return fail(403, { error: 'Not authorized' });
		}

		await deletePage(params.id);
		throw redirect(302, '/admin/pages');
	}
};
