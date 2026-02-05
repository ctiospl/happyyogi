import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { compileTemplatePreview } from '$lib/server/templates/crud';

export const POST: RequestHandler = async ({ request, locals }) => {
	// Require admin access
	if (!locals.tenant || locals.tenantLink?.role !== 'admin') {
		throw error(403, 'Admin access required');
	}

	try {
		const body = await request.json();
		const { source_code, schema, sample_data } = body;

		if (!source_code || typeof source_code !== 'string') {
			throw error(400, 'source_code is required');
		}

		const result = await compileTemplatePreview(source_code, schema, sample_data);

		return json(result);
	} catch (err) {
		if (err instanceof Error && 'status' in err) {
			throw err;
		}
		return json({
			success: false,
			error: err instanceof Error ? err.message : 'Unknown error'
		});
	}
};
