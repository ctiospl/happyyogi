import type { RequestHandler } from './$types';
import { buildSharedClientRuntime } from '$lib/server/templates/bundler';

/**
 * Serve the shared Svelte client runtime for template hydration.
 * Cached aggressively since the runtime only changes on deploy.
 */
export const GET: RequestHandler = async () => {
	const runtime = await buildSharedClientRuntime();

	return new Response(runtime, {
		headers: {
			'Content-Type': 'application/javascript',
			'Cache-Control': 'public, max-age=3600'
		}
	});
};
