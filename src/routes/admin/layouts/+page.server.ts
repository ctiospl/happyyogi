import type { PageServerLoad, Actions } from './$types';
import {
	getLayouts,
	createLayout,
	setDefaultLayout,
	deleteLayout
} from '$lib/server/layouts';
import { seedDefaultLayout } from '$lib/server/layouts/seed';
import { error, fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.tenant) throw error(404, 'Tenant not found');
	if (locals.tenantLink?.role !== 'admin') throw error(403, 'Admin access required');

	const layouts = await getLayouts(locals.tenant.id);

	return { layouts, tenant: locals.tenant };
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		if (!locals.tenant || locals.tenantLink?.role !== 'admin') {
			return fail(403, { error: 'Not authorized' });
		}

		const formData = await request.formData();
		const name = formData.get('name') as string;
		const slug = formData.get('slug') as string;

		if (!name || !slug) {
			return fail(400, { error: 'Name and slug are required' });
		}

		const layout = await createLayout({
			tenant_id: locals.tenant.id,
			name,
			slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
			status: 'draft',
			published_at: null,
			updated_at: new Date()
		});

		throw redirect(302, `/admin/layouts/${layout.id}/edit`);
	},

	seed: async ({ locals }) => {
		if (!locals.tenant || locals.tenantLink?.role !== 'admin') {
			return fail(403, { error: 'Not authorized' });
		}

		const result = await seedDefaultLayout(locals.tenant.id);

		if (result.layoutId) {
			return { success: true, created: result.created, layoutId: result.layoutId };
		}

		return fail(500, { error: 'Failed to seed layout' });
	},

	setDefault: async ({ request, locals }) => {
		if (!locals.tenant || locals.tenantLink?.role !== 'admin') {
			return fail(403, { error: 'Not authorized' });
		}

		const formData = await request.formData();
		const layoutId = formData.get('layoutId') as string;

		if (!layoutId) return fail(400, { error: 'Layout ID required' });

		await setDefaultLayout(locals.tenant.id, layoutId);
		return { success: true, message: 'Default layout updated' };
	},

	delete: async ({ request, locals }) => {
		if (!locals.tenant || locals.tenantLink?.role !== 'admin') {
			return fail(403, { error: 'Not authorized' });
		}

		const formData = await request.formData();
		const layoutId = formData.get('layoutId') as string;

		if (!layoutId) return fail(400, { error: 'Layout ID required' });

		await deleteLayout(layoutId);
		return { success: true, message: 'Layout deleted' };
	}
};
