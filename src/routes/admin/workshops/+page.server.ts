import type { PageServerLoad, Actions } from './$types';
import { getAllWorkshops, createWorkshop, getInstructors } from '$lib/server/workshops';
import { error, fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.tenant) {
		throw error(404, 'Tenant not found');
	}

	if (locals.tenantLink?.role !== 'admin') {
		throw error(403, 'Admin access required');
	}

	const [workshops, instructors] = await Promise.all([
		getAllWorkshops(locals.tenant.id),
		getInstructors(locals.tenant.id)
	]);

	return {
		workshops,
		instructors,
		tenant: locals.tenant
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

		const workshop = await createWorkshop({
			tenant_id: locals.tenant.id,
			title,
			slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
			status: 'draft',
			mode: 'offline',
			price_paise: 0,
			faqs: '[]',
			updated_at: new Date()
		});

		throw redirect(302, `/admin/workshops/${workshop.id}`);
	}
};
