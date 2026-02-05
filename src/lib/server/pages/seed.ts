/**
 * Seed core pages from existing content files
 * Creates pages in DB with structured blocks format
 */

import { createPage, getPageBySlug } from '$lib/server/pages';
import type { PageContent, ContentBlock } from '$lib/types';

// Import existing content
import { homePage } from '$lib/content/pages/home';
import { aboutPage } from '$lib/content/pages/about';
import { servicesPage } from '$lib/content/pages/services';
import { contactPage } from '$lib/content/pages/contact';
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

/**
 * Convert services page to ContentBlock format
 * Services page has a different structure, convert to standard blocks
 */
function convertServicesPageBlocks(): ContentBlock[] {
	const blocks: ContentBlock[] = [];

	// Hero section
	blocks.push({
		id: 'hero',
		type: 'hero',
		order: 0,
		headline: servicesPage.sections.hero.headline,
		subheadline: servicesPage.sections.hero.tagline,
		backgroundImage: servicesPage.sections.hero.backgroundImage
	});

	// Services grid
	blocks.push({
		id: 'services',
		type: 'services-grid',
		order: 1,
		headline: 'What We Offer',
		subheadline: 'Yoga for every body, every lifestyle',
		services: servicesPage.sections.services.map((s) => ({
			title: s.title,
			description: s.description,
			icon: s.icon,
			href: `/services#${s.id}`
		}))
	});

	// CTA banner
	blocks.push({
		id: 'cta',
		type: 'cta-banner',
		order: 2,
		headline: servicesPage.sections.cta.title,
		subheadline: servicesPage.sections.cta.description,
		cta: {
			text: servicesPage.sections.cta.primaryButton.label,
			href: servicesPage.sections.cta.primaryButton.href
		},
		secondaryCta: servicesPage.sections.cta.secondaryButton
			? {
					text: servicesPage.sections.cta.secondaryButton.label,
					href: servicesPage.sections.cta.secondaryButton.href
				}
			: undefined
	});

	return blocks;
}

/**
 * Convert contact page to ContentBlock format
 * Contact page has custom sections, create HTML block
 */
function convertContactPageBlocks(): ContentBlock[] {
	const blocks: ContentBlock[] = [];

	// Hero section
	const heroSection = contactPage.sections.find((s) => s.type === 'hero');
	if (heroSection && 'heading' in heroSection) {
		blocks.push({
			id: 'hero',
			type: 'hero',
			order: 0,
			headline: heroSection.heading as string,
			subheadline: 'subheading' in heroSection ? (heroSection.subheading as string) : undefined
		});
	}

	// Extract contact cards
	const contactCards = contactPage.sections
		.filter((s) => s.type === 'contact-info')
		.flatMap((s) => ('cards' in s ? s.cards : []))
		.filter((card): card is NonNullable<typeof card> => card !== undefined);

	// For contact-specific sections, use HTML block with structured data
	blocks.push({
		id: 'contact-content',
		type: 'html',
		order: 1,
		html: `
<section class="py-16 md:py-24">
  <div class="container mx-auto px-4">
    <div class="grid gap-8 md:grid-cols-3 mb-16">
      ${contactCards
				.map(
					(card) => `
        <div class="rounded-lg border bg-card p-6 text-center">
          <h3 class="text-lg font-semibold mb-4">${card.title}</h3>
          ${card.items.map((item) => `<a href="${item.href}" class="block text-muted-foreground hover:text-primary">${item.value}</a>`).join('')}
        </div>
      `
				)
				.join('')}
    </div>

    <div class="max-w-2xl mx-auto">
      <h2 class="text-2xl font-bold text-center mb-8">Send us a Message</h2>
      <p class="text-center text-muted-foreground mb-8">Fill out the form below and we will get back to you shortly</p>
      <div class="text-center">
        <a href="/contact" class="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 font-medium text-primary-foreground">
          Contact Form
        </a>
      </div>
    </div>
  </div>
</section>
`,
		css: ''
	});

	return blocks;
}

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
// SEED FUNCTION
// ============================================

export interface PageSeedResult {
	created: string[];
	skipped: string[];
	errors: { slug: string; error: string }[];
}

/**
 * Seed core pages for a tenant
 * Skips pages that already exist
 */
export async function seedCorePages(tenantId: string): Promise<PageSeedResult> {
	const result: PageSeedResult = {
		created: [],
		skipped: [],
		errors: []
	};

	for (const def of pageDefinitions) {
		// Check if page exists
		const existing = await getPageBySlug(tenantId, def.slug);
		if (existing) {
			result.skipped.push(def.slug);
			continue;
		}

		try {
			const blocks = def.getBlocks();
			const structuredContent: PageContent = {
				version: 1,
				blocks
			};

			await createPage({
				tenant_id: tenantId,
				slug: def.slug,
				title: def.title,
				content_json: JSON.stringify({ structured: structuredContent }),
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

/**
 * Check if core pages exist for a tenant
 */
export async function hasCorePages(tenantId: string): Promise<boolean> {
	// Check if home page exists (basic check)
	const home = await getPageBySlug(tenantId, 'home');
	return home !== null;
}
