/**
 * Resolve a Layout's regions (PageBlock[]) into rendered content
 * using the same resolvePageBlocks used by pages.
 */

import type { Layout, LayoutRegionName, PageBlock } from '$lib/server/db/schema';
import type { PageContent } from '$lib/types';
import { resolvePageBlocks } from '$lib/server/templates/resolve';

export interface ResolvedRegion {
	content: PageContent;
	extraCss: string;
}

export interface ResolvedLayout {
	id: string;
	name: string;
	regions: Partial<Record<LayoutRegionName, ResolvedRegion>>;
}

const REGION_NAMES: LayoutRegionName[] = ['header', 'footer', 'announcement_bar', 'sidebar'];

/**
 * Resolve all non-empty regions of a layout into renderable content
 */
export async function resolveLayout(layout: Layout): Promise<ResolvedLayout> {
	const regions = (typeof layout.regions === 'string'
		? JSON.parse(layout.regions)
		: layout.regions) as Partial<Record<LayoutRegionName, PageBlock[]>>;

	const resolved: Partial<Record<LayoutRegionName, ResolvedRegion>> = {};

	// Resolve regions in parallel
	const entries = REGION_NAMES
		.filter((name) => regions[name] && regions[name]!.length > 0)
		.map(async (name) => {
			const blocks = regions[name]!;
			const { content, extraCss } = await resolvePageBlocks(blocks);
			return [name, { content, extraCss }] as const;
		});

	const results = await Promise.all(entries);
	for (const [name, data] of results) {
		resolved[name] = data;
	}

	return {
		id: layout.id,
		name: layout.name,
		regions: resolved
	};
}

// ============================================
// CACHE
// ============================================

interface CacheEntry {
	data: ResolvedLayout;
	timestamp: number;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const layoutCache = new Map<string, CacheEntry>();

function cacheKey(tenantId: string, layoutId?: string): string {
	return `${tenantId}:${layoutId || 'default'}`;
}

/**
 * Get resolved layout with caching (5min TTL)
 */
export async function getResolvedLayoutCached(
	tenantId: string,
	layout: Layout
): Promise<ResolvedLayout> {
	const key = cacheKey(tenantId, layout.id);
	const cached = layoutCache.get(key);

	if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
		return cached.data;
	}

	const resolved = await resolveLayout(layout);
	layoutCache.set(key, { data: resolved, timestamp: Date.now() });
	return resolved;
}

/**
 * Invalidate cache for a layout (call on save/publish)
 */
export function invalidateLayoutCache(tenantId: string, layoutId?: string): void {
	if (layoutId) {
		layoutCache.delete(cacheKey(tenantId, layoutId));
	}
	// Also clear default cache since the default may have changed
	layoutCache.delete(cacheKey(tenantId));
}
