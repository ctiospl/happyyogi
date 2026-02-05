import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ parent }) => {
	const data = await parent();

	// Dashboard requires stats from layout
	if (!data.stats) {
		throw redirect(302, '/admin/login');
	}

	return {
		stats: data.stats
	};
};
