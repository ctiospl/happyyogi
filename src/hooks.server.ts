import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { getCurrentSession, getDefaultTenant } from '$lib/server/auth';

const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;

		return resolve(event, {
			transformPageChunk: ({ html }) => html.replace('%paraglide.lang%', locale)
		});
	});

const handleAuth: Handle = async ({ event, resolve }) => {
	// Get current session
	const sessionData = await getCurrentSession(event.cookies);

	if (sessionData) {
		event.locals.user = sessionData.user;
		event.locals.session = sessionData.session;
		event.locals.tenantLink = sessionData.tenantLink;
	} else {
		event.locals.user = null;
		event.locals.session = null;
		event.locals.tenantLink = null;
	}

	// Get default tenant for MVP (single tenant mode)
	const tenant = await getDefaultTenant();
	event.locals.tenant = (tenant as App.Locals['tenant']) || null;

	return resolve(event);
};

export const handle: Handle = sequence(handleParaglide, handleAuth);
