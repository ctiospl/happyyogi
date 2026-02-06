import { db } from '$lib/server/db';
import type { Layout, NewLayout, LayoutUpdate, LayoutStatus } from '$lib/server/db/schema';

/**
 * Get all layouts for a tenant
 */
export async function getLayouts(tenantId: string, status?: LayoutStatus): Promise<Layout[]> {
	let query = db
		.selectFrom('layouts')
		.where('tenant_id', '=', tenantId);

	if (status) {
		query = query.where('status', '=', status);
	}

	return query.selectAll().orderBy('created_at', 'desc').execute();
}

/**
 * Get a layout by ID
 */
export async function getLayoutById(id: string): Promise<Layout | null> {
	const layout = await db
		.selectFrom('layouts')
		.where('id', '=', id)
		.selectAll()
		.executeTakeFirst();

	return layout ?? null;
}

/**
 * Get the default layout for a tenant
 */
export async function getDefaultLayout(tenantId: string): Promise<Layout | null> {
	const layout = await db
		.selectFrom('layouts')
		.where('tenant_id', '=', tenantId)
		.where('is_default', '=', true)
		.where('status', '=', 'published')
		.selectAll()
		.executeTakeFirst();

	return layout ?? null;
}

/**
 * Get the layout for a specific page (page-specific or tenant default)
 */
export async function getLayoutForPage(page: {
	layout_id: string | null;
	no_layout: boolean;
	tenant_id: string;
}): Promise<Layout | null> {
	if (page.no_layout) return null;

	if (page.layout_id) {
		const layout = await getLayoutById(page.layout_id);
		if (layout && layout.status === 'published') return layout;
	}

	return getDefaultLayout(page.tenant_id);
}

/**
 * Create a new layout
 */
export async function createLayout(data: NewLayout): Promise<Layout> {
	const [layout] = await db
		.insertInto('layouts')
		.values(data)
		.returningAll()
		.execute();

	return layout;
}

/**
 * Update a layout
 */
export async function updateLayout(id: string, data: LayoutUpdate): Promise<Layout | null> {
	const [updated] = await db
		.updateTable('layouts')
		.set({ ...data, updated_at: new Date() })
		.where('id', '=', id)
		.returningAll()
		.execute();

	return updated ?? null;
}

/**
 * Delete a layout
 */
export async function deleteLayout(id: string): Promise<void> {
	await db.deleteFrom('layouts').where('id', '=', id).execute();
}

/**
 * Publish a layout
 */
export async function publishLayout(id: string): Promise<Layout | null> {
	return updateLayout(id, {
		status: 'published',
		published_at: new Date()
	});
}

/**
 * Unpublish a layout
 */
export async function unpublishLayout(id: string): Promise<Layout | null> {
	return updateLayout(id, {
		status: 'draft',
		published_at: null
	});
}

/**
 * Set a layout as the default for a tenant (clears other defaults)
 */
export async function setDefaultLayout(tenantId: string, layoutId: string): Promise<void> {
	// Clear existing defaults
	await db
		.updateTable('layouts')
		.set({ is_default: false, updated_at: new Date() })
		.where('tenant_id', '=', tenantId)
		.where('is_default', '=', true)
		.execute();

	// Set new default
	await db
		.updateTable('layouts')
		.set({ is_default: true, updated_at: new Date() })
		.where('id', '=', layoutId)
		.execute();
}
