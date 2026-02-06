import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getFormById, exportSubmissions } from '$lib/server/forms';

export const GET: RequestHandler = async ({ params, url, locals }) => {
	if (!locals.tenant || locals.tenantLink?.role !== 'admin') {
		throw error(403, 'Admin access required');
	}

	const form = await getFormById(params.id);
	if (!form || form.tenant_id !== locals.tenant.id) {
		throw error(404, 'Form not found');
	}

	const format = (url.searchParams.get('format') ?? 'csv') as 'csv' | 'json';

	const result = await exportSubmissions(form.id, format);

	return new Response(result.data, {
		headers: {
			'Content-Type': result.contentType,
			'Content-Disposition': `attachment; filename="${result.filename}"`
		}
	});
};
