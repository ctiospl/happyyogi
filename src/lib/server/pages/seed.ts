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
import { homePage } from '$lib/content/pages/home';
import { aboutPage } from '$lib/content/pages/about';
import { testimonialsPage } from '$lib/content/pages/testimonials';
import { servicesPage } from '$lib/content/pages/services';
import { contactPage } from '$lib/content/pages/contact';

// ============================================
// CONTENT CONVERTERS
// ============================================

function convertHomePageBlocks(): ContentBlock[] {
	const blocks: ContentBlock[] = [
		{
			id: 'hero',
			type: 'hero',
			order: 0,
			headline: homePage.sections[0].headline,
			subheadline: homePage.sections[0].subheadline,
			backgroundImage: '/images/hero-divya-indian.jpg',
			cta: homePage.sections[0].cta,
			secondaryCta: homePage.sections[0].secondaryCta,
			location: homePage.sections[0].location
		},
		{
			id: 'services',
			type: 'services-grid',
			order: 1,
			headline: homePage.sections[1].headline,
			subheadline: (homePage.sections[1] as any).subheadline,
			featureImage: '/images/deepa-teaching.jpg',
			services: (homePage.sections[1] as any).services
		},
		{
			id: 'about',
			type: 'about-snippet',
			order: 2,
			headline: homePage.sections[2].headline,
			content: (homePage.sections[2] as any).content,
			highlights: (homePage.sections[2] as any).highlights,
			image: '/images/vijesh-pose.jpg',
			stats: [{ value: '500+', label: 'Happy Students' }],
			cta: (homePage.sections[2] as any).cta
		},
		{
			id: 'instructors',
			type: 'instructor-grid',
			order: 3,
			heading: 'Meet Our Teachers',
			subheading: 'Certified practitioners with diverse backgrounds and shared dedication',
			instructors: [
				{
					name: 'Divya Rao',
					image: '/images/instructors/divya-rao.webp',
					specializations: ['Hatha Yoga', 'Ashtanga Vinyasa']
				},
				{
					name: 'Deepa Rao',
					image: '/images/instructors/deepa-rao.webp',
					specializations: ['Ashtanga Vinyasa', 'Iyengar Yoga']
				},
				{
					name: 'Vijesh Nair',
					image: '/images/instructors/vijesh-nair.webp',
					specializations: ['Yoga for Sports', 'Conditioning']
				}
			]
		},
		{
			id: 'testimonials',
			type: 'testimonial-carousel',
			order: 4,
			headline: (homePage.sections[3] as any).headline,
			testimonials: (homePage.sections[3] as any).testimonials
		},
		{
			id: 'cta-banner',
			type: 'cta-banner',
			order: 5,
			headline: homePage.sections[4].headline,
			subheadline: (homePage.sections[4] as any).subheadline,
			backgroundImage: '/images/divya-meditation.jpg',
			showInstructors: true,
			cta: (homePage.sections[4] as any).cta,
			secondaryCta: (homePage.sections[4] as any).secondaryCta
		}
	];
	return blocks;
}

/**
 * Convert about page sections to ContentBlock format
 * Handles field name differences between content files and ContentBlock types
 */
function convertAboutPageBlocks(): ContentBlock[] {
	const storySection = aboutPage.sections[0];
	const valuesSection = aboutPage.sections[1];
	const instructorsSection = aboutPage.sections[2];
	const ctaSection = aboutPage.sections[3];

	return [
		{
			id: 'hero',
			type: 'hero',
			order: 0,
			headline: 'About Us',
			subheadline: 'An Urban Oasis in the Heart of Mumbai',
			backgroundImage: '/images/about-hero.jpg'
		},
		{
			id: storySection.id,
			type: storySection.type,
			order: 1,
			heading: storySection.heading,
			subheading: storySection.subheading,
			content: storySection.content
		},
		{
			id: valuesSection.id,
			type: valuesSection.type,
			order: 2,
			heading: valuesSection.heading,
			values: valuesSection.values
		},
		{
			id: instructorsSection.id,
			type: instructorsSection.type,
			order: 3,
			heading: instructorsSection.heading,
			subheading: instructorsSection.subheading,
			instructors: instructorsSection.instructors
		},
		{
			id: ctaSection.id,
			type: 'cta-banner',
			order: 4,
			headline: ctaSection.heading,
			subheadline: ctaSection.subheadline,
			backgroundImage: '/images/meditation-hands.jpg',
			cta: ctaSection.cta
		}
	] as ContentBlock[];
}

function convertTestimonialsPageBlocks(): ContentBlock[] {
	return [
		{
			id: 'hero',
			type: 'hero',
			order: 0,
			headline: 'Success Stories',
			subheadline:
				'Read inspiring transformation stories from our students. Discover how yoga has changed lives.',
			backgroundImage: '/images/success-stories-hero.jpg'
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
			backgroundImage: '/images/meditation-hands.jpg',
			cta: {
				text: 'Get Started',
				href: '/contact'
			}
		}
	];
}

/**
 * Convert services page to ContentBlock format.
 * Maps hero, services-grid, and cta sections. Schedule table has no template equivalent.
 */
function convertServicesPageBlocks(): ContentBlock[] {
	const { sections } = servicesPage;
	return [
		{
			id: 'hero',
			type: 'hero',
			order: 0,
			headline: sections.hero.headline,
			subheadline: sections.hero.tagline,
			backgroundImage: '/images/services-hero.jpg'
		},
		{
			id: 'services',
			type: 'services-grid',
			order: 1,
			headline: 'Our Services',
			subheadline: sections.hero.tagline,
			services: sections.services.map((s) => ({
				title: s.title,
				description: s.description,
				icon: s.icon,
				href: `/services/${s.id}`
			}))
		},
		{
			id: 'cta',
			type: 'cta-banner',
			order: 2,
			headline: sections.cta.title,
			subheadline: sections.cta.description,
			cta: {
				text: sections.cta.primaryButton.label,
				href: sections.cta.primaryButton.href
			},
			...(sections.cta.secondaryButton
				? {
						secondaryCta: {
							text: sections.cta.secondaryButton.label,
							href: sections.cta.secondaryButton.href
						}
					}
				: {})
		}
	];
}

/**
 * Convert contact page to ContentBlock format.
 * Maps hero and cta. Contact-info, location, form, hours have no template equivalents.
 */
function convertContactPageBlocks(): ContentBlock[] {
	const heroSection = contactPage.sections.find((s) => s.type === 'hero') as
		| { type: 'hero'; heading: string; subheading: string; tagline: string }
		| undefined;
	return [
		{
			id: 'hero',
			type: 'hero',
			order: 0,
			headline: heroSection?.heading ?? 'Contact Us',
			subheadline:
				heroSection?.subheading ??
				'Reach out for class inquiries, workshop registrations, or any questions',
			backgroundImage: '/images/contact-studio.jpg'
		},
		{
			id: 'cta',
			type: 'cta-banner',
			order: 1,
			headline: 'Get in Touch',
			subheadline:
				'Visit us at Sportsmed Mumbai, Parel West, or reach out via phone, email, or Instagram.',
			cta: {
				text: 'Call Us',
				href: 'tel:+919820009173'
			},
			secondaryCta: {
				text: 'Email Us',
				href: 'mailto:info@thehappyyogico.com'
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
	},
	{
		slug: 'services',
		title: 'Our Services',
		seoTitle: servicesPage.seo.title,
		seoDescription: servicesPage.seo.description,
		getBlocks: convertServicesPageBlocks
	},
	{
		slug: 'contact',
		title: 'Contact Us',
		seoTitle: contactPage.seo.title,
		seoDescription: contactPage.seo.description,
		getBlocks: convertContactPageBlocks
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
 * @param force - If true, overwrites existing blocks even if non-empty
 */
export async function seedCorePages(
	tenantId: string,
	{ force = false }: { force?: boolean } = {}
): Promise<PageSeedResult> {
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
				const existingBlocks = parseBlocks(existing.blocks);
				if (force || (existingBlocks.length === 0 && pageBlocks.length > 0)) {
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
