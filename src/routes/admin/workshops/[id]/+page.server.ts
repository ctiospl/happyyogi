import type { PageServerLoad, Actions } from './$types';
import {
	getWorkshopById,
	getInstructors,
	updateWorkshop,
	updateWorkshopSessions,
	publishWorkshop,
	unpublishWorkshop,
	deleteWorkshop
} from '$lib/server/workshops';
import { error, fail, redirect } from '@sveltejs/kit';
import type { WorkshopFaq } from '$lib/server/db/schema';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.tenant) {
		throw error(404, 'Tenant not found');
	}

	if (locals.tenantLink?.role !== 'admin') {
		throw error(403, 'Admin access required');
	}

	const [workshop, instructors] = await Promise.all([
		getWorkshopById(params.id),
		getInstructors(locals.tenant.id)
	]);

	if (!workshop || workshop.tenant_id !== locals.tenant.id) {
		throw error(404, 'Workshop not found');
	}

	return {
		workshop,
		instructors,
		tenant: locals.tenant
	};
};

export const actions: Actions = {
	update: async ({ request, params, locals }) => {
		if (!locals.tenant || locals.tenantLink?.role !== 'admin') {
			return fail(403, { error: 'Not authorized' });
		}

		const formData = await request.formData();

		const title = formData.get('title') as string;
		const slug = formData.get('slug') as string;
		const description = formData.get('description') as string;
		const content_html = formData.get('content_html') as string;
		const instructor_id = formData.get('instructor_id') as string;
		const venue_name = formData.get('venue_name') as string;
		const venue_address = formData.get('venue_address') as string;
		const mode = formData.get('mode') as 'online' | 'offline' | 'hybrid';
		const capacity = formData.get('capacity') as string;
		const price = formData.get('price') as string;
		const deposit = formData.get('deposit') as string;
		const cancellation_policy = formData.get('cancellation_policy') as string;
		const faqsJson = formData.get('faqs') as string;

		if (!title || !slug) {
			return fail(400, { error: 'Title and slug are required' });
		}

		let faqs: WorkshopFaq[] = [];
		try {
			if (faqsJson) {
				faqs = JSON.parse(faqsJson);
			}
		} catch {
			return fail(400, { error: 'Invalid FAQ format' });
		}

		await updateWorkshop(params.id, locals.tenant.id, {
			title,
			slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
			description: description || null,
			content_html: content_html || null,
			instructor_id: instructor_id || null,
			venue_name: venue_name || null,
			venue_address: venue_address || null,
			mode,
			capacity: capacity ? parseInt(capacity, 10) : null,
			price_paise: price ? Math.round(parseFloat(price) * 100) : 0,
			deposit_amount_paise: deposit ? Math.round(parseFloat(deposit) * 100) : null,
			cancellation_policy: cancellation_policy || null,
			faqs: JSON.stringify(faqs)
		});

		return { success: true, message: 'Workshop updated' };
	},

	updateSessions: async ({ request, params, locals }) => {
		if (!locals.tenant || locals.tenantLink?.role !== 'admin') {
			return fail(403, { error: 'Not authorized' });
		}

		const formData = await request.formData();
		const sessionsJson = formData.get('sessions') as string;

		let sessions: Array<{
			title: string | null;
			starts_at: Date;
			ends_at: Date;
			session_order: number;
		}> = [];

		try {
			if (sessionsJson) {
				const parsed = JSON.parse(sessionsJson);
				sessions = parsed.map(
					(
						s: { title?: string; starts_at: string; ends_at: string; session_order?: number },
						i: number
					) => ({
						title: s.title || null,
						starts_at: new Date(s.starts_at),
						ends_at: new Date(s.ends_at),
						session_order: s.session_order ?? i + 1
					})
				);
			}
		} catch {
			return fail(400, { error: 'Invalid sessions format' });
		}

		await updateWorkshopSessions(params.id, locals.tenant.id, sessions);

		return { success: true, message: 'Sessions updated' };
	},

	publish: async ({ params, locals }) => {
		if (!locals.tenant || locals.tenantLink?.role !== 'admin') {
			return fail(403, { error: 'Not authorized' });
		}

		await publishWorkshop(params.id, locals.tenant.id);
		return { success: true, message: 'Workshop published' };
	},

	unpublish: async ({ params, locals }) => {
		if (!locals.tenant || locals.tenantLink?.role !== 'admin') {
			return fail(403, { error: 'Not authorized' });
		}

		await unpublishWorkshop(params.id, locals.tenant.id);
		return { success: true, message: 'Workshop unpublished' };
	},

	delete: async ({ params, locals }) => {
		if (!locals.tenant || locals.tenantLink?.role !== 'admin') {
			return fail(403, { error: 'Not authorized' });
		}

		await deleteWorkshop(params.id, locals.tenant.id);
		throw redirect(302, '/admin/workshops');
	}
};
