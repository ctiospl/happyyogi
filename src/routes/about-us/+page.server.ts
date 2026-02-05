import { loadPageForRoute } from '$lib/server/pages';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	return loadPageForRoute(locals.tenant?.id, 'about-us');
};
