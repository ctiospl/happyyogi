/**
 * Template Renderer Service
 *
 * Renders pages using the template system.
 * Uses the template registry for SSR-compatible rendering.
 */

import { db } from '$lib/server/db';
import type { PageBlock, Template } from '$lib/server/db/schema';

// ============================================
// TYPES
// ============================================

export interface PageRenderData {
	id: string;
	slug: string;
	title: string;
	blocks: PageBlock[];
	meta: {
		title?: string;
		description?: string;
		ogImage?: string;
	};
}

export interface BlockRenderData {
	id: string;
	templateSlug: string;
	props: Record<string, unknown>;
}

// ============================================
// DATA FETCHING
// ============================================

/**
 * Fetch a page by slug with its blocks
 */
export async function getPageBySlug(
	tenantId: string,
	slug: string
): Promise<PageRenderData | null> {
	const page = await db
		.selectFrom('pages')
		.select(['id', 'slug', 'title', 'blocks', 'seo_title', 'seo_description', 'og_image_url'])
		.where('tenant_id', '=', tenantId)
		.where('slug', '=', slug)
		.where('status', '=', 'published')
		.where('deleted_at', 'is', null)
		.executeTakeFirst();

	if (!page) return null;

	// Parse blocks if stored as string
	const rawBlocks = page.blocks;
	const blocks: PageBlock[] =
		typeof rawBlocks === 'string'
			? JSON.parse(rawBlocks)
			: Array.isArray(rawBlocks)
				? rawBlocks
				: [];

	return {
		id: page.id,
		slug: page.slug,
		title: page.title,
		blocks,
		meta: {
			title: page.seo_title || page.title,
			description: page.seo_description || undefined,
			ogImage: page.og_image_url || undefined
		}
	};
}

/**
 * Get template metadata by slug
 */
export async function getTemplateBySlug(slug: string): Promise<Template | null> {
	const template = await db
		.selectFrom('templates')
		.selectAll()
		.where('slug', '=', slug)
		.executeTakeFirst();

	return template || null;
}

/**
 * Get all available templates
 */
export async function getAllTemplates(): Promise<Template[]> {
	return db
		.selectFrom('templates')
		.selectAll()
		.orderBy('category')
		.orderBy('name')
		.execute();
}

/**
 * Get templates by category
 */
export async function getTemplatesByCategory(category: string): Promise<Template[]> {
	return db
		.selectFrom('templates')
		.selectAll()
		.where('category', '=', category as 'layout' | 'section' | 'component' | 'custom')
		.orderBy('name')
		.execute();
}

// ============================================
// BLOCK RESOLUTION
// ============================================

/**
 * Resolve blocks by fetching template metadata
 */
export async function resolveBlocks(blocks: PageBlock[]): Promise<BlockRenderData[]> {
	if (blocks.length === 0) return [];

	// Get unique template IDs
	const templateIds = [...new Set(blocks.map((b) => b.template_id))];

	// Fetch all templates in one query
	const templates = await db
		.selectFrom('templates')
		.select(['id', 'slug'])
		.where('id', 'in', templateIds)
		.execute();

	// Create lookup map
	const templateMap = new Map(templates.map((t) => [t.id, t.slug]));

	// Map blocks to render data
	return blocks.map((block) => ({
		id: block.id,
		templateSlug: templateMap.get(block.template_id) || 'unknown',
		props: block.props
	}));
}

// ============================================
// CACHING (Simple in-memory for Phase 1)
// ============================================

const pageCache = new Map<string, { data: PageRenderData; timestamp: number }>();
const CACHE_TTL_MS = 60 * 1000; // 1 minute

/**
 * Get page with caching
 */
export async function getPageCached(
	tenantId: string,
	slug: string
): Promise<PageRenderData | null> {
	const cacheKey = `${tenantId}:${slug}`;
	const cached = pageCache.get(cacheKey);

	if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
		return cached.data;
	}

	const page = await getPageBySlug(tenantId, slug);
	if (page) {
		pageCache.set(cacheKey, { data: page, timestamp: Date.now() });
	}

	return page;
}

/**
 * Invalidate cache for a page
 */
export function invalidatePageCache(tenantId: string, slug: string): void {
	pageCache.delete(`${tenantId}:${slug}`);
}

/**
 * Clear all cache
 */
export function clearPageCache(): void {
	pageCache.clear();
}
