import type { Handle } from '@sveltejs/kit';
import { createLucia } from './index.js';
import { validateSession } from './session.js';
import { db } from '$lib/server/db';

export const lucia = createLucia(db);

export const authHandle: Handle = async ({ event, resolve }) => {
	const { user, session } = await validateSession(lucia, event.cookies);
	event.locals.user = user;
	event.locals.session = session;
	return resolve(event);
};

// Use with sequence() in hooks.server.ts:
// import { sequence } from '@sveltejs/kit/hooks';
// import { authHandle } from '$lib/server/auth/middleware';
// export const handle = sequence(authHandle, ...other handles);
