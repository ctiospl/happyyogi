import type { PageServerLoad, Actions } from './$types';
import { getPages, createPage } from '$lib/server/pages';
import { seedCorePages, hasCorePages } from '$lib/server/pages/seed';
import { error, fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.tenant) {
		throw error(404, 'Tenant not found');
	}

	if (locals.tenantLink?.role !== 'admin') {
		throw error(403, 'Admin access required');
	}

	const pages = await getPages(locals.tenant.id);
	const hasCore = await hasCorePages(locals.tenant.id);

	return {
		pages,
		tenant: locals.tenant,
		hasCorePages: hasCore
	};
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		if (!locals.tenant || locals.tenantLink?.role !== 'admin') {
			return fail(403, { error: 'Not authorized' });
		}

		const formData = await request.formData();
		const title = formData.get('title') as string;
		const slug = formData.get('slug') as string;

		if (!title || !slug) {
			return fail(400, { error: 'Title and slug are required' });
		}

		const page = await createPage({
			tenant_id: locals.tenant.id,
			title,
			slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
			status: 'draft',
			updated_at: new Date()
		});

		throw redirect(302, `/admin/pages/${page.id}/edit`);
	},

	seed: async ({ locals, request }) => {
		if (!locals.tenant || locals.tenantLink?.role !== 'admin') {
			return fail(403, { error: 'Not authorized' });
		}

		const formData = await request.formData();
		const force = formData.get('force') === 'true';
		const result = await seedCorePages(locals.tenant.id, { force });

		if (result.errors.length > 0) {
			return fail(500, {
				error: `Seeding failed for: ${result.errors.map((e) => e.slug).join(', ')}`,
				seedResult: result
			});
		}

		return {
			success: true,
			seedResult: result
		};
	}
};
