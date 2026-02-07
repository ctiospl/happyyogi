import type { PageServerLoad, Actions } from './$types';
import {
	getLayoutById,
	updateLayout,
	publishLayout,
	unpublishLayout,
	deleteLayout
} from '$lib/server/layouts';
import { getTenantTemplates } from '$lib/server/templates/crud';
import { validateBlocks } from '$lib/server/templates/validate-blocks';
import { invalidateLayoutCache } from '$lib/server/layouts/resolve';
import { error, fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.tenant) throw error(404, 'Tenant not found');
	if (locals.tenantLink?.role !== 'admin') throw error(403, 'Admin access required');

	const layout = await getLayoutById(params.id);
	if (!layout || layout.tenant_id !== locals.tenant.id) {
		throw error(404, 'Layout not found');
	}

	const templates = await getTenantTemplates(locals.tenant.id);

	return { layout, templates, tenant: locals.tenant };
};

export const actions: Actions = {
	saveRegions: async ({ request, params, locals }) => {
		if (!locals.tenant || locals.tenantLink?.role !== 'admin') {
			return fail(403, { error: 'Not authorized' });
		}

		const formData = await request.formData();
		const regionsJson = formData.get('regions') as string;

		try {
			const regions = regionsJson ? JSON.parse(regionsJson) : {};
			const templates = await getTenantTemplates(locals.tenant.id);
			const allBlocks = Object.values(regions).flat() as any[];
			const validation = validateBlocks(allBlocks, templates);
			if (!validation.ok) {
				return fail(400, { error: validation.error ?? 'Invalid blocks' });
			}
			await updateLayout(params.id, {
				regions: JSON.stringify(regions) as any
			});
			invalidateLayoutCache(locals.tenant.id, params.id);
			return { success: true, message: 'Regions saved' };
		} catch {
			return fail(400, { error: 'Failed to save regions' });
		}
	},

	updateMeta: async ({ request, params, locals }) => {
		if (!locals.tenant || locals.tenantLink?.role !== 'admin') {
			return fail(403, { error: 'Not authorized' });
		}

		const formData = await request.formData();
		const name = formData.get('name') as string;
		const slug = formData.get('slug') as string;

		await updateLayout(params.id, {
			name,
			slug: slug?.toLowerCase().replace(/[^a-z0-9-]/g, '-')
		});

		return { success: true, message: 'Settings saved' };
	},

	publish: async ({ params, locals }) => {
		if (!locals.tenant || locals.tenantLink?.role !== 'admin') {
			return fail(403, { error: 'Not authorized' });
		}

		await publishLayout(params.id);
		invalidateLayoutCache(locals.tenant.id, params.id);
		return { success: true, message: 'Layout published' };
	},

	unpublish: async ({ params, locals }) => {
		if (!locals.tenant || locals.tenantLink?.role !== 'admin') {
			return fail(403, { error: 'Not authorized' });
		}

		await unpublishLayout(params.id);
		invalidateLayoutCache(locals.tenant.id, params.id);
		return { success: true, message: 'Layout unpublished' };
	},

	delete: async ({ params, locals }) => {
		if (!locals.tenant || locals.tenantLink?.role !== 'admin') {
			return fail(403, { error: 'Not authorized' });
		}

		await deleteLayout(params.id);
		invalidateLayoutCache(locals.tenant.id, params.id);
		throw redirect(302, '/admin/layouts');
	}
};
