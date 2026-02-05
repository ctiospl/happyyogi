import { db } from '$lib/server/db';
import type { Cookies } from '@sveltejs/kit';
import type { User, UserRole } from '$lib/server/db/schema';
import { verifyOtp } from './otp.js';
import {
	createSession,
	getSessionFromCookies,
	setSessionCookie,
	clearSessionCookie,
	invalidateSession,
	extendSessionIfNeeded,
	type SessionData
} from './session.js';

export { sendOtp, verifyOtp } from './otp.js';
export {
	createSession,
	validateSession,
	invalidateSession,
	invalidateAllUserSessions,
	setSessionCookie,
	clearSessionCookie,
	getSessionIdFromCookies,
	getSessionFromCookies,
	cleanupExpiredSessions,
	type SessionData,
	type SessionUser
} from './session.js';

interface AuthResult {
	success: boolean;
	user?: User;
	isNewUser?: boolean;
	error?: string;
}

/**
 * Authenticate user with phone OTP
 * Creates user if not exists
 */
export async function authenticateWithOtp(
	phone: string,
	code: string,
	cookies: Cookies,
	tenantId?: string | null,
	deviceInfo?: { userAgent?: string; ip?: string }
): Promise<AuthResult> {
	// Verify OTP
	const verifyResult = await verifyOtp(phone, code, 'login');
	if (!verifyResult.success) {
		return { success: false, error: verifyResult.error };
	}

	const normalizedPhone = verifyResult.phone!;

	// Find or create user
	let user = (await db
		.selectFrom('users')
		.where('phone', '=', normalizedPhone)
		.where('deleted_at', 'is', null)
		.selectAll()
		.executeTakeFirst()) as User | undefined;

	let isNewUser = false;

	if (!user) {
		// Create new user
		const [newUser] = await db
			.insertInto('users')
			.values({
				phone: normalizedPhone,
				phone_verified_at: new Date(),
				updated_at: new Date()
			})
			.returningAll()
			.execute();
		user = newUser as User;
		isNewUser = true;
	} else {
		// Update phone_verified_at if not set
		if (!user.phone_verified_at) {
			await db
				.updateTable('users')
				.set({ phone_verified_at: new Date(), updated_at: new Date() })
				.where('id', '=', user.id)
				.execute();
		}
	}

	// If tenantId provided and user doesn't have a link, create one
	if (tenantId) {
		const existingLink = await db
			.selectFrom('user_tenant_links')
			.where('user_id', '=', user.id)
			.where('tenant_id', '=', tenantId)
			.selectAll()
			.executeTakeFirst();

		if (!existingLink) {
			await db
				.insertInto('user_tenant_links')
				.values({
					user_id: user.id,
					tenant_id: tenantId,
					role: 'user',
					updated_at: new Date()
				})
				.execute();
		}
	}

	// Create session
	const session = await createSession(user.id, tenantId || null, deviceInfo);
	setSessionCookie(cookies, session.id);

	return { success: true, user, isNewUser };
}

/**
 * Get current session from cookies
 */
export async function getCurrentSession(cookies: Cookies): Promise<SessionData | null> {
	const sessionData = await getSessionFromCookies(cookies);
	if (sessionData) {
		// Extend session if needed
		await extendSessionIfNeeded(sessionData.session);
	}
	return sessionData;
}

/**
 * Logout - invalidate session and clear cookie
 */
export async function logout(cookies: Cookies): Promise<void> {
	const sessionData = await getSessionFromCookies(cookies);
	if (sessionData) {
		await invalidateSession(sessionData.session.id);
	}
	clearSessionCookie(cookies);
}

/**
 * Check if user has a specific role in tenant
 */
export async function hasRole(
	userId: string,
	tenantId: string,
	roles: UserRole | UserRole[]
): Promise<boolean> {
	const roleArray = Array.isArray(roles) ? roles : [roles];

	const link = await db
		.selectFrom('user_tenant_links')
		.where('user_id', '=', userId)
		.where('tenant_id', '=', tenantId)
		.select('role')
		.executeTakeFirst();

	if (!link) return false;
	return roleArray.includes(link.role as UserRole);
}

/**
 * Get user's role in tenant
 */
export async function getUserRole(userId: string, tenantId: string): Promise<UserRole | null> {
	const link = await db
		.selectFrom('user_tenant_links')
		.where('user_id', '=', userId)
		.where('tenant_id', '=', tenantId)
		.select('role')
		.executeTakeFirst();

	return (link?.role as UserRole) || null;
}

/**
 * Update user profile
 */
export async function updateUserProfile(
	userId: string,
	data: { name?: string; email?: string; avatarUrl?: string }
): Promise<User> {
	const updateData: Record<string, unknown> = { updated_at: new Date() };
	if (data.name !== undefined) updateData.name = data.name;
	if (data.email !== undefined) updateData.email = data.email;
	if (data.avatarUrl !== undefined) updateData.avatar_url = data.avatarUrl;

	const [updatedUser] = await db
		.updateTable('users')
		.set(updateData)
		.where('id', '=', userId)
		.returningAll()
		.execute();

	return updatedUser as User;
}

/**
 * Get tenant by slug or domain
 */
export async function getTenantBySlugOrDomain(slugOrDomain: string) {
	return db
		.selectFrom('tenants')
		.where((eb) =>
			eb.or([eb('slug', '=', slugOrDomain), eb('domain', '=', slugOrDomain)])
		)
		.where('deleted_at', 'is', null)
		.selectAll()
		.executeTakeFirst();
}

/**
 * Get default tenant (for MVP - Happy Yogi)
 */
export async function getDefaultTenant() {
	return db
		.selectFrom('tenants')
		.where('slug', '=', 'happyyogi')
		.where('deleted_at', 'is', null)
		.selectAll()
		.executeTakeFirst();
}
