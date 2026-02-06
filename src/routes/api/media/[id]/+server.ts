import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getMedia, deleteMedia } from '$lib/server/media';
import { unlink } from 'fs/promises';
import { join } from 'path';

export const DELETE: RequestHandler = async ({ params, locals }) => {
	if (!locals.tenant || locals.tenantLink?.role !== 'admin') {
		throw error(403, 'Admin access required');
	}

	const media = await getMedia(params.id);
	if (!media) throw error(404, 'Media not found');
	if (media.tenant_id !== locals.tenant.id) throw error(403, 'Not your media');

	// Remove files from disk
	try {
		await unlink(join('static', media.storage_key));
		const variants = (typeof media.variants === 'string'
			? JSON.parse(media.variants)
			: media.variants) as Record<string, string>;
		for (const variantUrl of Object.values(variants)) {
			if (variantUrl) {
				await unlink(join('static', variantUrl.replace(/^\//, ''))).catch(() => {});
			}
		}
	} catch {
		// File may already be deleted
	}

	await deleteMedia(media.id);
	return json({ ok: true });
};
