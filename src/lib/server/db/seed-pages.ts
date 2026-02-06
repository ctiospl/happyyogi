/**
 * Seed database with structured content from existing hardcoded pages.
 * Populates both content_json (legacy) and blocks (template-backed PageBlock[]).
 */
import { db } from './index';
import type {
	PageContent,
	ContentBlock,
	HeroBlock,
	ServicesGridBlock,
	AboutSnippetBlock,
	TestimonialCarouselBlock,
	CtaBannerBlock,
	InstructorGridBlock,
	ValuesGridBlock,
	StoryBlock
} from '$lib/types';
import type { PageBlock } from '$lib/server/db/schema';
import { homePage } from '$lib/content/pages/home';
import { aboutPage } from '$lib/content/pages/about';
import { seedCoreTemplates } from '$lib/server/templates/seed';
import { getTenantTemplates } from '$lib/server/templates/crud';
import { randomUUID } from 'crypto';

// ============================================
// CONTENT CONVERTERS (ContentBlock[] for content_json)
// ============================================

function convertHomePageToContent(): PageContent {
	const blocks: PageContent['blocks'] = [];
	let order = 0;

	for (const section of homePage.sections) {
		if (section.type === 'hero') {
			blocks.push({
				type: 'hero',
				id: section.id,
				order: order++,
				headline: section.headline,
				subheadline: section.subheadline,
				cta: section.cta,
				secondaryCta: section.secondaryCta,
				location: section.location,
				backgroundImage: '/images/hero-divya-indian.jpg'
			} satisfies HeroBlock);
		} else if (section.type === 'services-grid') {
			blocks.push({
				type: 'services-grid',
				id: section.id,
				order: order++,
				headline: section.headline,
				subheadline: section.subheadline,
				services: [...section.services],
				featureImage: '/images/deepa-teaching.jpg'
			} satisfies ServicesGridBlock);
		} else if (section.type === 'about-snippet') {
			blocks.push({
				type: 'about-snippet',
				id: section.id,
				order: order++,
				headline: section.headline,
				content: section.content,
				highlights: [...section.highlights],
				cta: section.cta,
				image: '/images/vijesh-pose.jpg',
				stats: [{ value: '500+', label: 'Happy Students' }]
			} satisfies AboutSnippetBlock);
		} else if (section.type === 'testimonial-carousel') {
			blocks.push({
				type: 'testimonial-carousel',
				id: section.id,
				order: order++,
				headline: section.headline,
				testimonials: [...section.testimonials]
			} satisfies TestimonialCarouselBlock);
		} else if (section.type === 'cta-banner') {
			blocks.push({
				type: 'cta-banner',
				id: section.id,
				order: order++,
				headline: section.headline,
				subheadline: section.subheadline,
				cta: section.cta,
				secondaryCta: section.secondaryCta,
				backgroundImage: '/images/divya-meditation.jpg',
				showInstructors: true
			} satisfies CtaBannerBlock);
		}
	}

	// Add instructor grid
	blocks.splice(3, 0, {
		type: 'instructor-grid',
		id: 'instructors',
		order: 3,
		heading: 'Meet Your Guides',
		subheading: 'Experienced instructors dedicated to your yoga journey',
		instructors: [
			{ name: 'Deepa Rao', image: '/images/instructors/deepa-rao.webp', specialty: 'Hatha & Vinyasa' },
			{ name: 'Divya Rao', image: '/images/instructors/divya-rao.webp', specialty: 'Prenatal & Restorative' },
			{ name: 'Vijesh Nair', image: '/images/instructors/vijesh-nair.webp', specialty: 'Ashtanga & Inversions' }
		],
		cta: { text: 'Learn More About Us', href: '/about-us' }
	} satisfies InstructorGridBlock);

	blocks.forEach((block, i) => {
		block.order = i;
	});

	return { version: 1, blocks };
}

function convertAboutPageToContent(): PageContent {
	const blocks: PageContent['blocks'] = [];
	let order = 0;

	for (const section of aboutPage.sections) {
		if (section.type === 'story') {
			blocks.push({
				type: 'story',
				id: section.id,
				order: order++,
				heading: section.heading,
				subheading: section.subheading,
				content: [...section.content]
			} satisfies StoryBlock);
		} else if (section.type === 'values-grid') {
			blocks.push({
				type: 'values-grid',
				id: section.id,
				order: order++,
				heading: section.heading,
				values: [...section.values]
			} satisfies ValuesGridBlock);
		} else if (section.type === 'instructor-grid') {
			blocks.push({
				type: 'instructor-grid',
				id: section.id,
				order: order++,
				heading: section.heading,
				subheading: section.subheading,
				instructors: section.instructors.map((i) => ({
					name: i.name,
					slug: i.slug,
					image: i.image,
					specializations: [...i.specializations],
					bio: i.bio,
					credentials: [...i.credentials]
				}))
			} satisfies InstructorGridBlock);
		} else if (section.type === 'cta-banner') {
			blocks.push({
				type: 'cta-banner',
				id: section.id,
				order: order++,
				headline: section.heading,
				subheadline: section.subheadline,
				cta: section.cta
			} satisfies CtaBannerBlock);
		}
	}

	return { version: 1, blocks };
}

// ============================================
// CONTENT → PAGEBLOCK CONVERTER
// ============================================

/**
 * Convert ContentBlock[] to PageBlock[] using template slug → ID mapping.
 * Strips type/id/order from props (those are block-level, not prop-level).
 */
function contentBlocksToPageBlocks(
	contentBlocks: ContentBlock[],
	templateMap: Map<string, string>
): PageBlock[] {
	const pageBlocks: PageBlock[] = [];

	for (const block of contentBlocks) {
		const templateId = templateMap.get(block.type);
		if (!templateId) {
			console.warn(`No template found for block type "${block.type}", skipping`);
			continue;
		}

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

// ============================================
// SEED FUNCTION
// ============================================

/**
 * Get template slug → ID map. Seeds templates first if needed.
 */
async function getTemplateMap(tenantId: string): Promise<Map<string, string>> {
	// Try existing templates first
	const existing = await getTenantTemplates(tenantId);
	if (existing.length > 0) {
		return new Map(existing.map((t) => [t.slug, t.id]));
	}

	// Seed templates if none exist
	const result = await seedCoreTemplates(tenantId);
	return result.templateMap;
}

export async function seedPages(tenantId: string) {
	const templateMap = await getTemplateMap(tenantId);
	const homeContent = convertHomePageToContent();
	const aboutContent = convertAboutPageToContent();

	// Convert to PageBlock[] format
	const homeBlocks = contentBlocksToPageBlocks(homeContent.blocks, templateMap);
	const aboutBlocks = contentBlocksToPageBlocks(aboutContent.blocks, templateMap);

	const existingHome = await db
		.selectFrom('pages')
		.select('id')
		.where('tenant_id', '=', tenantId)
		.where('slug', '=', 'home')
		.where('deleted_at', 'is', null)
		.executeTakeFirst();

	const existingAbout = await db
		.selectFrom('pages')
		.select('id')
		.where('tenant_id', '=', tenantId)
		.where('slug', '=', 'about-us')
		.where('deleted_at', 'is', null)
		.executeTakeFirst();

	const now = new Date();

	if (!existingHome) {
		await db
			.insertInto('pages')
			.values({
				tenant_id: tenantId,
				slug: 'home',
				title: homePage.title,
				content_json: JSON.stringify(homeContent),
				blocks: JSON.stringify(homeBlocks) as any,
				seo_title: homePage.seo.title,
				seo_description: homePage.seo.description,
				status: 'published',
				published_at: now,
				updated_at: now
			})
			.execute();
		console.log(`Seeded home page (${homeBlocks.length} blocks)`);
	} else {
		// Update existing page to add blocks if empty
		await db
			.updateTable('pages')
			.set({ blocks: JSON.stringify(homeBlocks) as any, updated_at: now })
			.where('id', '=', existingHome.id)
			.execute();
		console.log(`Updated home page blocks (${homeBlocks.length} blocks)`);
	}

	if (!existingAbout) {
		await db
			.insertInto('pages')
			.values({
				tenant_id: tenantId,
				slug: 'about-us',
				title: aboutPage.title,
				content_json: JSON.stringify(aboutContent),
				blocks: JSON.stringify(aboutBlocks) as any,
				seo_title: aboutPage.seo.title,
				seo_description: aboutPage.seo.description,
				status: 'published',
				published_at: now,
				updated_at: now
			})
			.execute();
		console.log(`Seeded about page (${aboutBlocks.length} blocks)`);
	} else {
		await db
			.updateTable('pages')
			.set({ blocks: JSON.stringify(aboutBlocks) as any, updated_at: now })
			.where('id', '=', existingAbout.id)
			.execute();
		console.log(`Updated about page blocks (${aboutBlocks.length} blocks)`);
	}
}
