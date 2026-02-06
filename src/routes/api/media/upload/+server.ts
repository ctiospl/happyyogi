import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createMedia } from '$lib/server/media';
import sharp from 'sharp';
import { randomUUID } from 'crypto';
import { mkdir } from 'fs/promises';
import { join } from 'path';

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.tenant || locals.tenantLink?.role !== 'admin') {
		throw error(403, 'Admin access required');
	}

	const tenantId = locals.tenant.id;
	const formData = await request.formData();
	const file = formData.get('file') as File | null;
	const altText = (formData.get('alt_text') as string) || null;

	if (!file) throw error(400, 'file is required');
	if (!ALLOWED_TYPES.has(file.type)) throw error(400, 'Unsupported file type');
	if (file.size > MAX_SIZE) throw error(400, 'File too large (max 10MB)');

	const buffer = Buffer.from(await file.arrayBuffer());
	const id = randomUUID();
	const ext = file.type.split('/')[1].replace('jpeg', 'jpg');
	const filename = `${id}.${ext}`;
	const webpFilename = `${id}.webp`;

	const uploadDir = join('static', 'uploads', tenantId);
	await mkdir(uploadDir, { recursive: true });

	// Resize large images, save original format
	const image = sharp(buffer);
	const meta = await image.metadata();
	const resized = (meta.width && meta.width > 2000) ? image.resize(2000) : image;
	await resized.clone().toFile(join(uploadDir, filename));

	// Generate webp variant
	await resized.clone().webp({ quality: 80 }).toFile(join(uploadDir, webpFilename));

	const url = `/uploads/${tenantId}/${filename}`;
	const webpUrl = `/uploads/${tenantId}/${webpFilename}`;

	const media = await createMedia({
		tenant_id: tenantId,
		filename,
		original_filename: file.name,
		mime_type: file.type,
		size_bytes: file.size,
		storage_key: `uploads/${tenantId}/${filename}`,
		url,
		variants: JSON.stringify({ webp: webpUrl }) as any,
		alt_text: altText,
		uploaded_by: locals.user?.id ?? null
	});

	return json({ id: media.id, url: media.url, variants: { webp: webpUrl } });
};
