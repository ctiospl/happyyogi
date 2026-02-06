import type { PageServerLoad, Actions } from './$types';
import { getPageById, updatePage, updatePageContent, publishPage, unpublishPage, deletePage } from '$lib/server/pages';
import { getTenantTemplates } from '$lib/server/templates/crud';
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

	const templates = await getTenantTemplates(locals.tenant.id);

	return {
		page,
		templates,
		tenant: locals.tenant
	};
};

export const actions: Actions = {
	save: async ({ request, params, locals }) => {
		if (!locals.tenant || locals.tenantLink?.role !== 'admin') {
			return fail(403, { error: 'Not authorized' });
		}

		const formData = await request.formData();
		const html = formData.get('html') as string;
		const css = formData.get('css') as string;
		const json = formData.get('json') as string;
		const contentBlocks = formData.get('contentBlocks') as string;

		try {
			const jsonData = json ? JSON.parse(json) : {};
			const blocksData = contentBlocks ? JSON.parse(contentBlocks) : undefined;
			await updatePageContent(params.id, html || '', css || '', jsonData, blocksData);
			return { success: true, message: 'Page saved' };
		} catch (e) {
			return fail(400, { error: 'Failed to save page' });
		}
	},

	updateMeta: async ({ request, params, locals }) => {
		if (!locals.tenant || locals.tenantLink?.role !== 'admin') {
			return fail(403, { error: 'Not authorized' });
		}

		const formData = await request.formData();
		const title = formData.get('title') as string;
		const slug = formData.get('slug') as string;
		const seo_title = formData.get('seo_title') as string;
		const seo_description = formData.get('seo_description') as string;

		await updatePage(params.id, {
			title,
			slug: slug?.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
			seo_title: seo_title || null,
			seo_description: seo_description || null
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
