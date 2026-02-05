import type { RequestHandler } from '@sveltejs/kit';
import { localStorage } from '$lib/server/storage/local.js';

export const GET: RequestHandler = async ({ params }) => {
	const filePath = params.path;
	if (!filePath) {
		return new Response('Not found', { status: 404 });
	}

	const data = await localStorage.download(filePath);
	if (!data) {
		return new Response('Not found', { status: 404 });
	}

	// Basic content type detection
	const ext = filePath.split('.').pop()?.toLowerCase();
	const contentTypes: Record<string, string> = {
		png: 'image/png',
		jpg: 'image/jpeg',
		jpeg: 'image/jpeg',
		gif: 'image/gif',
		webp: 'image/webp',
		pdf: 'application/pdf',
		json: 'application/json',
		txt: 'text/plain'
	};

	return new Response(data, {
		headers: {
			'Content-Type': contentTypes[ext || ''] || 'application/octet-stream'
		}
	});
};
