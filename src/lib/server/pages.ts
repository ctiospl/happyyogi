import { db } from '$lib/server/db';
import type { Page, NewPage, PageUpdate, PageStatus } from '$lib/server/db/schema';

export interface PageWithContent extends Page {
	content_json_parsed?: object;
}

/**
 * Get all pages for a tenant
 */
export async function getPages(tenantId: string, status?: PageStatus): Promise<Page[]> {
	let query = db
		.selectFrom('pages')
		.where('tenant_id', '=', tenantId)
		.where('deleted_at', 'is', null);

	if (status) {
		query = query.where('status', '=', status);
	}

	const pages = await query.selectAll().orderBy('created_at', 'desc').execute();
	return pages as Page[];
}

/**
 * Get published pages for public viewing
 */
export async function getPublishedPages(tenantId: string): Promise<Page[]> {
	return getPages(tenantId, 'published');
}

/**
 * Get a page by slug
 */
export async function getPageBySlug(tenantId: string, slug: string): Promise<Page | null> {
	const page = await db
		.selectFrom('pages')
		.where('tenant_id', '=', tenantId)
		.where('slug', '=', slug)
		.where('deleted_at', 'is', null)
		.selectAll()
		.executeTakeFirst();

	return (page as Page) || null;
}

/**
 * Get a page by ID
 */
export async function getPageById(pageId: string): Promise<Page | null> {
	const page = await db
		.selectFrom('pages')
		.where('id', '=', pageId)
		.where('deleted_at', 'is', null)
		.selectAll()
		.executeTakeFirst();

	return (page as Page) || null;
}

/**
 * Create a new page
 */
export async function createPage(data: NewPage): Promise<Page> {
	const [page] = await db
		.insertInto('pages')
		.values(data)
		.returningAll()
		.execute();

	return page as Page;
}

/**
 * Update a page
 */
export async function updatePage(pageId: string, data: PageUpdate): Promise<Page | null> {
	const [updated] = await db
		.updateTable('pages')
		.set({ ...data, updated_at: new Date() })
		.where('id', '=', pageId)
		.returningAll()
		.execute();

	return (updated as Page) || null;
}

/**
 * Update page content from editor
 */
export async function updatePageContent(
	pageId: string,
	html: string,
	css: string,
	grapesJson: object,
	structuredBlocks?: object
): Promise<Page | null> {
	// Combine HTML and CSS for rendering
	const contentHtml = css ? `<style>${css}</style>${html}` : html;

	// Store both GrapesJS project data and structured content blocks
	const contentJson = structuredBlocks
		? { grapes: grapesJson, structured: structuredBlocks }
		: grapesJson;

	return updatePage(pageId, {
		content_html: contentHtml,
		content_json: JSON.stringify(contentJson)
	});
}

/**
 * Publish a page
 */
export async function publishPage(pageId: string): Promise<Page | null> {
	return updatePage(pageId, {
		status: 'published',
		published_at: new Date()
	});
}

/**
 * Unpublish a page
 */
export async function unpublishPage(pageId: string): Promise<Page | null> {
	return updatePage(pageId, {
		status: 'draft',
		published_at: null
	});
}

/**
 * Soft delete a page
 */
export async function deletePage(pageId: string): Promise<void> {
	await db
		.updateTable('pages')
		.set({ deleted_at: new Date(), updated_at: new Date() })
		.where('id', '=', pageId)
		.execute();
}

/**
 * Duplicate a page
 */
export async function duplicatePage(pageId: string, newSlug: string): Promise<Page | null> {
	const original = await getPageById(pageId);
	if (!original) return null;

	return createPage({
		tenant_id: original.tenant_id,
		slug: newSlug,
		title: `${original.title} (Copy)`,
		content_html: original.content_html,
		content_json: original.content_json,
		template: original.template,
		seo_title: original.seo_title,
		seo_description: original.seo_description,
		og_image_url: original.og_image_url,
		status: 'draft',
		updated_at: new Date()
	});
}

/**
 * Check if slug is available
 */
export async function isSlugAvailable(
	tenantId: string,
	slug: string,
	excludePageId?: string
): Promise<boolean> {
	let query = db
		.selectFrom('pages')
		.where('tenant_id', '=', tenantId)
		.where('slug', '=', slug)
		.where('deleted_at', 'is', null);

	if (excludePageId) {
		query = query.where('id', '!=', excludePageId);
	}

	const existing = await query.select('id').executeTakeFirst();
	return !existing;
}
