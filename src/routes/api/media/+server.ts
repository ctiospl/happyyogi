import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listMedia } from '$lib/server/media';

export const GET: RequestHandler = async ({ locals, url }) => {
	if (!locals.tenant || locals.tenantLink?.role !== 'admin') {
		throw error(403, 'Admin access required');
	}

	const limit = Math.min(Number(url.searchParams.get('limit')) || 50, 100);
	const offset = Number(url.searchParams.get('offset')) || 0;

	const media = await listMedia(locals.tenant.id, { limit, offset });
	return json({ media });
};
