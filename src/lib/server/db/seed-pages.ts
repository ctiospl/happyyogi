/**
 * Seed database with structured content from existing hardcoded pages
 */
import { db } from './index';
import type { PageContent, HeroBlock, ServicesGridBlock, AboutSnippetBlock, TestimonialCarouselBlock, CtaBannerBlock, InstructorGridBlock, ValuesGridBlock, StoryBlock } from '$lib/types';
import { homePage } from '$lib/content/pages/home';
import { aboutPage } from '$lib/content/pages/about';

// Map existing content structure to PageContent blocks
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

	// Add instructor grid (hardcoded in the component currently)
	blocks.splice(3, 0, {
		type: 'instructor-grid',
		id: 'instructors',
		order: 3,
		heading: 'Meet Your Guides',
		subheading: 'Experienced instructors dedicated to your yoga journey',
		instructors: [
			{
				name: 'Deepa Rao',
				image: '/images/instructors/deepa-rao.webp',
				specialty: 'Hatha & Vinyasa'
			},
			{
				name: 'Divya Rao',
				image: '/images/instructors/divya-rao.webp',
				specialty: 'Prenatal & Restorative'
			},
			{
				name: 'Vijesh Nair',
				image: '/images/instructors/vijesh-nair.webp',
				specialty: 'Ashtanga & Inversions'
			}
		],
		cta: { text: 'Learn More About Us', href: '/about-us' }
	} satisfies InstructorGridBlock);

	// Reorder after splice
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

export async function seedPages(tenantId: string) {
	const homeContent = convertHomePageToContent();
	const aboutContent = convertAboutPageToContent();

	// Check if pages exist
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
				seo_title: homePage.seo.title,
				seo_description: homePage.seo.description,
				status: 'published',
				published_at: now,
				updated_at: now
			})
			.execute();
		console.log('Seeded home page');
	} else {
		console.log('Home page already exists, skipping');
	}

	if (!existingAbout) {
		await db
			.insertInto('pages')
			.values({
				tenant_id: tenantId,
				slug: 'about-us',
				title: aboutPage.title,
				content_json: JSON.stringify(aboutContent),
				seo_title: aboutPage.seo.title,
				seo_description: aboutPage.seo.description,
				status: 'published',
				published_at: now,
				updated_at: now
			})
			.execute();
		console.log('Seeded about page');
	} else {
		console.log('About page already exists, skipping');
	}
}

// CLI runner
if (import.meta.url === `file://${process.argv[1]}`) {
	const tenantId = process.argv[2];
	if (!tenantId) {
		console.error('Usage: npx tsx src/lib/server/db/seed-pages.ts <tenant_id>');
		process.exit(1);
	}
	seedPages(tenantId)
		.then(() => {
			console.log('Done seeding pages');
			process.exit(0);
		})
		.catch((err) => {
			console.error('Error seeding pages:', err);
			process.exit(1);
		});
}
