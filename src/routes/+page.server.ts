import { getPageBySlug } from '$lib/server/pages';
import type { PageContent, InstructorItem } from '$lib/types';
import type { ServerLoad } from '@sveltejs/kit';

// Default instructors for CTA sections (used when rendering structured content)
const defaultInstructors: InstructorItem[] = [
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
];

export const load: ServerLoad = async ({ locals }) => {
	// If tenant exists, try to load home page from DB
	if (locals.tenant) {
		const page = await getPageBySlug(locals.tenant.id, 'home');

		if (page && page.status === 'published' && page.content_json) {
			// Parse structured content
			try {
				const contentJson = typeof page.content_json === 'string'
					? JSON.parse(page.content_json)
					: page.content_json;

				if (contentJson.version && Array.isArray(contentJson.blocks)) {
					return {
						useStructuredContent: true,
						structuredContent: contentJson as PageContent,
						instructors: defaultInstructors,
						seo: {
							title: page.seo_title || page.title,
							description: page.seo_description || ''
						}
					};
				}
			} catch {
				// Fall through to hardcoded content
			}
		}
	}

	// Return null to indicate using hardcoded content
	return {
		useStructuredContent: false
	};
};
