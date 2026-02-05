import { db } from '$lib/server/db';
import type { Cookies } from '@sveltejs/kit';
import type { Session, UserTenantLink } from '$lib/server/db/schema';

const SESSION_COOKIE_NAME = 'happyyogi_session';
const SESSION_DURATION_DAYS = 30;

export interface SessionUser {
	id: string;
	phone: string;
	name: string | null;
	email: string | null;
	avatarUrl: string | null;
}

export interface SessionData {
	user: SessionUser;
	session: Session;
	tenantLink: UserTenantLink | null;
}

export async function createSession(
	userId: string,
	tenantId: string | null,
	deviceInfo?: { userAgent?: string; ip?: string }
): Promise<Session> {
	const expiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000);

	// Let DB generate UUID for session ID
	const [session] = await db
		.insertInto('sessions')
		.values({
			user_id: userId,
			tenant_id: tenantId,
			device_info: deviceInfo ? JSON.stringify(deviceInfo) : null,
			expires_at: expiresAt
		})
		.returningAll()
		.execute();

	return session as Session;
}

export async function validateSession(sessionId: string): Promise<SessionData | null> {
	const result = await db
		.selectFrom('sessions')
		.innerJoin('users', 'users.id', 'sessions.user_id')
		.where('sessions.id', '=', sessionId)
		.where('sessions.expires_at', '>', new Date())
		.where('users.deleted_at', 'is', null)
		.select([
			'sessions.id as session_id',
			'sessions.user_id',
			'sessions.tenant_id',
			'sessions.device_info',
			'sessions.expires_at',
			'sessions.created_at as session_created_at',
			'users.id',
			'users.phone',
			'users.name',
			'users.email',
			'users.avatar_url'
		])
		.executeTakeFirst();

	if (!result) {
		return null;
	}

	// Get tenant link if tenant_id is set
	let tenantLink: UserTenantLink | null = null;
	if (result.tenant_id) {
		const link = await db
			.selectFrom('user_tenant_links')
			.where('user_id', '=', result.user_id)
			.where('tenant_id', '=', result.tenant_id)
			.selectAll()
			.executeTakeFirst();
		tenantLink = (link as UserTenantLink) || null;
	}

	return {
		user: {
			id: result.id,
			phone: result.phone,
			name: result.name,
			email: result.email,
			avatarUrl: result.avatar_url
		},
		session: {
			id: result.session_id,
			user_id: result.user_id,
			tenant_id: result.tenant_id,
			device_info: result.device_info as Session['device_info'],
			expires_at: result.expires_at,
			created_at: result.session_created_at
		},
		tenantLink
	};
}

export async function invalidateSession(sessionId: string): Promise<void> {
	await db.deleteFrom('sessions').where('id', '=', sessionId).execute();
}

export async function invalidateAllUserSessions(userId: string): Promise<void> {
	await db.deleteFrom('sessions').where('user_id', '=', userId).execute();
}

export function setSessionCookie(cookies: Cookies, sessionId: string): void {
	cookies.set(SESSION_COOKIE_NAME, sessionId, {
		path: '/',
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		maxAge: SESSION_DURATION_DAYS * 24 * 60 * 60
	});
}

export function clearSessionCookie(cookies: Cookies): void {
	cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
}

export function getSessionIdFromCookies(cookies: Cookies): string | null {
	return cookies.get(SESSION_COOKIE_NAME) || null;
}

export async function getSessionFromCookies(cookies: Cookies): Promise<SessionData | null> {
	const sessionId = getSessionIdFromCookies(cookies);
	if (!sessionId) {
		return null;
	}
	return validateSession(sessionId);
}

// Extend session if it's close to expiring (within 7 days)
export async function extendSessionIfNeeded(session: Session): Promise<void> {
	const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
	if (session.expires_at < sevenDaysFromNow) {
		const newExpiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000);
		await db
			.updateTable('sessions')
			.set({ expires_at: newExpiresAt })
			.where('id', '=', session.id)
			.execute();
	}
}

// Clean up expired sessions (run periodically)
export async function cleanupExpiredSessions(): Promise<number> {
	const result = await db
		.deleteFrom('sessions')
		.where('expires_at', '<', new Date())
		.executeTakeFirst();

	return Number(result.numDeletedRows);
}
