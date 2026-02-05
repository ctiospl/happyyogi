import { getPageBySlug } from '$lib/server/pages';
import type { PageContent } from '$lib/types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.tenant) {
		const page = await getPageBySlug(locals.tenant.id, 'services');

		if (page && page.status === 'published' && page.content_json) {
			try {
				const rawJson =
					typeof page.content_json === 'string'
						? JSON.parse(page.content_json)
						: page.content_json;

				const contentJson = rawJson.structured ?? rawJson;

				if (contentJson.version && Array.isArray(contentJson.blocks)) {
					return {
						useStructuredContent: true,
						structuredContent: contentJson as PageContent,
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

	return { useStructuredContent: false };
};
