import { db } from '$lib/server/db';
import type { NewMedia, Media } from '$lib/server/db/schema';

export async function createMedia(data: NewMedia): Promise<Media> {
	return await db
		.insertInto('media')
		.values(data)
		.returningAll()
		.executeTakeFirstOrThrow();
}

export async function getMedia(id: string): Promise<Media | undefined> {
	return await db
		.selectFrom('media')
		.where('id', '=', id)
		.selectAll()
		.executeTakeFirst();
}

export async function listMedia(
	tenantId: string,
	opts: { limit?: number; offset?: number } = {}
): Promise<Media[]> {
	const { limit = 50, offset = 0 } = opts;
	return await db
		.selectFrom('media')
		.where('tenant_id', '=', tenantId)
		.orderBy('created_at', 'desc')
		.limit(limit)
		.offset(offset)
		.selectAll()
		.execute();
}

export async function deleteMedia(id: string): Promise<void> {
	await db.deleteFrom('media').where('id', '=', id).execute();
}
