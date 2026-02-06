import { loadPageForRoute } from '$lib/server/pages';
import type { InstructorItem } from '$lib/types';
import type { ServerLoad } from '@sveltejs/kit';

const defaultInstructors: InstructorItem[] = [
	{ name: 'Deepa Rao', image: '/images/instructors/deepa-rao.webp', specialty: 'Hatha & Vinyasa' },
	{ name: 'Divya Rao', image: '/images/instructors/divya-rao.webp', specialty: 'Prenatal & Restorative' },
	{ name: 'Vijesh Nair', image: '/images/instructors/vijesh-nair.webp', specialty: 'Ashtanga & Inversions' }
];

export const load: ServerLoad = async ({ locals }) => {
	const result = await loadPageForRoute(locals.tenant?.id, 'home');
	return { ...result, instructors: defaultInstructors };
};
