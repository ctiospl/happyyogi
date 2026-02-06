/**
 * Seed core pages from existing content files
 * Creates pages in DB with structured blocks format
 */

import { createPage, getPageBySlug, updatePage } from '$lib/server/pages';
import type { PageContent, ContentBlock } from '$lib/types';
import type { PageBlock } from '$lib/server/db/schema';
import { seedCoreTemplates } from '$lib/server/templates/seed';
import { getTenantTemplates } from '$lib/server/templates/crud';
import { randomUUID } from 'crypto';

// Import existing content
// Note: servicesPage and contactPage not imported - their structured versions lose significant content
import { homePage } from '$lib/content/pages/home';
import { aboutPage } from '$lib/content/pages/about';
import { testimonialsPage } from '$lib/content/pages/testimonials';

// ============================================
// CONTENT CONVERTERS
// ============================================

/**
 * Convert home page sections to ContentBlock format
 */
function convertHomePageBlocks(): ContentBlock[] {
	return homePage.sections.map((section, index) => ({
		...section,
		id: section.id || `block-${index}`,
		order: index
	})) as ContentBlock[];
}

/**
 * Convert about page sections to ContentBlock format
 * Handles field name differences between content files and ContentBlock types
 */
function convertAboutPageBlocks(): ContentBlock[] {
	return aboutPage.sections.map((section, index) => {
		const base = {
			id: section.id || `block-${index}`,
			order: index,
			type: section.type
		};

		// Handle cta-banner which uses 'heading' instead of 'headline' in about content
		if (section.type === 'cta-banner' && 'heading' in section) {
			return {
				...base,
				type: 'cta-banner' as const,
				headline: section.heading,
				subheadline: section.subheadline,
				cta: section.cta
			};
		}

		return { ...section, ...base };
	}) as ContentBlock[];
}

// Note: convertServicesPageBlocks and convertContactPageBlocks removed
// Services page loses schedule table, contact page loses form/location/hours
// These pages continue using hardcoded content from their respective .ts files

/**
 * Convert testimonials/success-stories page to ContentBlock format
 */
function convertTestimonialsPageBlocks(): ContentBlock[] {
	return [
		{
			id: 'hero',
			type: 'hero',
			order: 0,
			headline: 'Success Stories',
			subheadline:
				'Read inspiring transformation stories from our students. Discover how yoga has changed lives.'
		},
		{
			id: 'testimonials',
			type: 'testimonial-carousel',
			order: 1,
			headline: 'What Our Students Say',
			testimonials: testimonialsPage.testimonials.map((t) => ({
				quote: t.quote,
				author: t.name,
				role: `${t.role} - ${t.location}`
			}))
		},
		{
			id: 'cta',
			type: 'cta-banner',
			order: 2,
			headline: 'Start Your Journey',
			subheadline: 'Join our community and experience the transformation yourself.',
			cta: {
				text: 'Get Started',
				href: '/contact'
			}
		}
	];
}

// ============================================
// PAGE DEFINITIONS
// ============================================

interface PageDefinition {
	slug: string;
	title: string;
	seoTitle: string;
	seoDescription: string;
	getBlocks: () => ContentBlock[];
}

// Note: 'services' and 'contact' excluded - their structured versions lose significant content
// (schedule table, contact form, location/hours sections). They continue using hardcoded content.
const pageDefinitions: PageDefinition[] = [
	{
		slug: 'home',
		title: 'Home',
		seoTitle: homePage.seo.title,
		seoDescription: homePage.seo.description,
		getBlocks: convertHomePageBlocks
	},
	{
		slug: 'about-us',
		title: 'About Us',
		seoTitle: aboutPage.seo.title,
		seoDescription: aboutPage.seo.description,
		getBlocks: convertAboutPageBlocks
	},
	{
		slug: 'success-stories',
		title: 'Success Stories',
		seoTitle: testimonialsPage.seo.title,
		seoDescription: testimonialsPage.seo.description,
		getBlocks: convertTestimonialsPageBlocks
	}
];

// ============================================
// CONTENT → PAGEBLOCK CONVERTER
// ============================================

function contentBlocksToPageBlocks(
	contentBlocks: ContentBlock[],
	templateMap: Map<string, string>
): PageBlock[] {
	const pageBlocks: PageBlock[] = [];
	for (const block of contentBlocks) {
		const templateId = templateMap.get(block.type);
		if (!templateId) continue;
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { type, id, order, ...props } = block;
		pageBlocks.push({
			id: id || randomUUID(),
			template_id: templateId,
			props: props as Record<string, unknown>
		});
	}
	return pageBlocks;
}

async function getTemplateMap(tenantId: string): Promise<Map<string, string>> {
	const existing = await getTenantTemplates(tenantId);
	if (existing.length > 0) {
		return new Map(existing.map((t) => [t.slug, t.id]));
	}
	const result = await seedCoreTemplates(tenantId);
	return result.templateMap;
}

// ============================================
// SEED FUNCTION
// ============================================

export interface PageSeedResult {
	created: string[];
	updated: string[];
	skipped: string[];
	errors: { slug: string; error: string }[];
}

/**
 * Seed core pages for a tenant.
 * Creates pages with both content_json and blocks (template-backed PageBlock[]).
 * If a page exists but has empty blocks, populates blocks.
 */
export async function seedCorePages(tenantId: string): Promise<PageSeedResult> {
	const result: PageSeedResult = {
		created: [],
		updated: [],
		skipped: [],
		errors: []
	};

	const templateMap = await getTemplateMap(tenantId);

	for (const def of pageDefinitions) {
		const existing = await getPageBySlug(tenantId, def.slug);

		try {
			const contentBlocks = def.getBlocks();
			const structuredContent: PageContent = { version: 1, blocks: contentBlocks };
			const pageBlocks = contentBlocksToPageBlocks(contentBlocks, templateMap);

			if (existing) {
				// Update blocks on existing page if empty
				const existingBlocks = parseBlocks(existing.blocks);
				if (existingBlocks.length === 0 && pageBlocks.length > 0) {
					await updatePage(existing.id, {
						blocks: JSON.stringify(pageBlocks) as any
					});
					result.updated.push(def.slug);
				} else {
					result.skipped.push(def.slug);
				}
				continue;
			}

			await createPage({
				tenant_id: tenantId,
				slug: def.slug,
				title: def.title,
				content_json: JSON.stringify({ structured: structuredContent }),
				blocks: JSON.stringify(pageBlocks) as any,
				seo_title: def.seoTitle,
				seo_description: def.seoDescription,
				status: 'published',
				published_at: new Date(),
				updated_at: new Date()
			});

			result.created.push(def.slug);
		} catch (err) {
			result.errors.push({
				slug: def.slug,
				error: err instanceof Error ? err.message : String(err)
			});
		}
	}

	return result;
}

function parseBlocks(raw: unknown): PageBlock[] {
	if (!raw) return [];
	if (typeof raw === 'string') {
		try { return JSON.parse(raw); } catch { return []; }
	}
	return Array.isArray(raw) ? raw : [];
}

/** Core page slugs that should exist for a tenant */
const CORE_PAGE_SLUGS = pageDefinitions.map((d) => d.slug);

/**
 * Check if all core pages exist for a tenant
 */
export async function hasCorePages(tenantId: string): Promise<boolean> {
	const { db } = await import('$lib/server/db');
	const result = await db
		.selectFrom('pages')
		.where('tenant_id', '=', tenantId)
		.where('slug', 'in', CORE_PAGE_SLUGS)
		.where('deleted_at', 'is', null)
		.select((eb) => eb.fn.countAll().as('count'))
		.executeTakeFirst();
	return Number(result?.count ?? 0) >= CORE_PAGE_SLUGS.length;
}
