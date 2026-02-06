import type { LayoutServerLoad } from './$types';
import { getDefaultLayout } from '$lib/server/layouts';
import { resolveLayout } from '$lib/server/layouts/resolve';
import type { ResolvedLayout } from '$lib/server/layouts/resolve';

export const load: LayoutServerLoad = async ({ locals }) => {
	if (!locals.tenant) {
		return { layout: null as ResolvedLayout | null };
	}

	const layout = await getDefaultLayout(locals.tenant.id);
	if (!layout) {
		return { layout: null as ResolvedLayout | null };
	}

	const resolved = await resolveLayout(layout);
	return { layout: resolved };
};
