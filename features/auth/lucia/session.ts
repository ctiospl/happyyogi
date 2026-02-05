import type { Lucia } from 'lucia';
import type { Cookies } from '@sveltejs/kit';

export async function validateSession(lucia: Lucia, cookies: Cookies) {
	const sessionId = cookies.get(lucia.sessionCookieName);
	if (!sessionId) {
		return { user: null, session: null };
	}

	const result = await lucia.validateSession(sessionId);

	if (result.session && result.session.fresh) {
		const sessionCookie = lucia.createSessionCookie(result.session.id);
		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '/',
			...sessionCookie.attributes
		});
	}
	if (!result.session) {
		const sessionCookie = lucia.createBlankSessionCookie();
		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '/',
			...sessionCookie.attributes
		});
	}

	return result;
}

export async function invalidateSession(lucia: Lucia, cookies: Cookies, sessionId: string) {
	await lucia.invalidateSession(sessionId);
	const sessionCookie = lucia.createBlankSessionCookie();
	cookies.set(sessionCookie.name, sessionCookie.value, {
		path: '/',
		...sessionCookie.attributes
	});
}
