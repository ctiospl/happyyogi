import { db } from '$lib/server/db';
import type { User, UserRole, UserTenantLink, BookingStatus } from '$lib/server/db/schema';

export interface UserWithTenantLink extends User {
	tenantLink: UserTenantLink | null;
	bookingsCount: number;
}

export interface UserListParams {
	tenantId: string;
	search?: string;
	limit?: number;
	offset?: number;
}

/**
 * Get users for a tenant with their tenant link info
 */
export async function getUsers(params: UserListParams): Promise<UserWithTenantLink[]> {
	const { tenantId, search, limit = 50, offset = 0 } = params;

	let query = db
		.selectFrom('users')
		.leftJoin('user_tenant_links', (join) =>
			join
				.onRef('user_tenant_links.user_id', '=', 'users.id')
				.on('user_tenant_links.tenant_id', '=', tenantId)
		)
		.leftJoin('bookings', (join) =>
			join.onRef('bookings.user_id', '=', 'users.id').on('bookings.tenant_id', '=', tenantId)
		)
		.where('users.deleted_at', 'is', null)
		.where((eb) =>
			eb.or([
				eb('user_tenant_links.tenant_id', '=', tenantId),
				eb.exists(
					eb
						.selectFrom('bookings as b')
						.whereRef('b.user_id', '=', 'users.id')
						.where('b.tenant_id', '=', tenantId)
				)
			])
		);

	if (search) {
		const searchTerm = `%${search}%`;
		query = query.where((eb) =>
			eb.or([
				eb('users.name', 'ilike', searchTerm),
				eb('users.phone', 'ilike', searchTerm),
				eb('users.email', 'ilike', searchTerm)
			])
		);
	}

	const users = await query
		.select([
			'users.id',
			'users.phone',
			'users.phone_verified_at',
			'users.email',
			'users.email_verified_at',
			'users.name',
			'users.avatar_url',
			'users.timezone',
			'users.password_hash',
			'users.auth_method',
			'users.created_at',
			'users.updated_at',
			'users.deleted_at',
			'user_tenant_links.id as link_id',
			'user_tenant_links.role as link_role',
			'user_tenant_links.wallet_balance_paise as link_wallet',
			'user_tenant_links.created_at as link_created_at',
			'user_tenant_links.updated_at as link_updated_at',
			db.fn.count('bookings.id').as('bookings_count')
		])
		.groupBy([
			'users.id',
			'user_tenant_links.id',
			'user_tenant_links.role',
			'user_tenant_links.wallet_balance_paise',
			'user_tenant_links.created_at',
			'user_tenant_links.updated_at'
		])
		.orderBy('users.created_at', 'desc')
		.limit(limit)
		.offset(offset)
		.execute();

	return users.map((u) => ({
		id: u.id,
		phone: u.phone,
		phone_verified_at: u.phone_verified_at,
		email: u.email,
		email_verified_at: u.email_verified_at,
		name: u.name,
		avatar_url: u.avatar_url,
		timezone: u.timezone,
		password_hash: u.password_hash,
		auth_method: u.auth_method,
		created_at: u.created_at,
		updated_at: u.updated_at,
		deleted_at: u.deleted_at,
		tenantLink: u.link_id
			? {
					id: u.link_id,
					user_id: u.id,
					tenant_id: tenantId,
					role: u.link_role as UserRole,
					wallet_balance_paise: u.link_wallet ?? 0,
					created_at: u.link_created_at!,
					updated_at: u.link_updated_at!
				}
			: null,
		bookingsCount: Number(u.bookings_count)
	}));
}

/**
 * Get single user by ID with tenant link
 */
export async function getUserById(
	userId: string,
	tenantId: string
): Promise<UserWithTenantLink | null> {
	const user = await db
		.selectFrom('users')
		.leftJoin('user_tenant_links', (join) =>
			join
				.onRef('user_tenant_links.user_id', '=', 'users.id')
				.on('user_tenant_links.tenant_id', '=', tenantId)
		)
		.where('users.id', '=', userId)
		.where('users.deleted_at', 'is', null)
		.select([
			'users.id',
			'users.phone',
			'users.phone_verified_at',
			'users.email',
			'users.email_verified_at',
			'users.name',
			'users.avatar_url',
			'users.timezone',
			'users.password_hash',
			'users.auth_method',
			'users.created_at',
			'users.updated_at',
			'users.deleted_at',
			'user_tenant_links.id as link_id',
			'user_tenant_links.role as link_role',
			'user_tenant_links.wallet_balance_paise as link_wallet',
			'user_tenant_links.created_at as link_created_at',
			'user_tenant_links.updated_at as link_updated_at'
		])
		.executeTakeFirst();

	if (!user) return null;

	// Get bookings count
	const bookingsResult = await db
		.selectFrom('bookings')
		.where('user_id', '=', userId)
		.where('tenant_id', '=', tenantId)
		.select(db.fn.count('id').as('count'))
		.executeTakeFirst();

	return {
		id: user.id,
		phone: user.phone,
		phone_verified_at: user.phone_verified_at,
		email: user.email,
		email_verified_at: user.email_verified_at,
		name: user.name,
		avatar_url: user.avatar_url,
		timezone: user.timezone,
		password_hash: user.password_hash,
		auth_method: user.auth_method,
		created_at: user.created_at,
		updated_at: user.updated_at,
		deleted_at: user.deleted_at,
		tenantLink: user.link_id
			? {
					id: user.link_id,
					user_id: user.id,
					tenant_id: tenantId,
					role: user.link_role as UserRole,
					wallet_balance_paise: user.link_wallet ?? 0,
					created_at: user.link_created_at!,
					updated_at: user.link_updated_at!
				}
			: null,
		bookingsCount: Number(bookingsResult?.count ?? 0)
	};
}

/**
 * Update user role for a tenant
 */
export async function updateUserRole(
	userId: string,
	tenantId: string,
	role: UserRole
): Promise<UserTenantLink> {
	// Check if link exists
	const existing = await db
		.selectFrom('user_tenant_links')
		.where('user_id', '=', userId)
		.where('tenant_id', '=', tenantId)
		.selectAll()
		.executeTakeFirst();

	if (existing) {
		const [updated] = await db
			.updateTable('user_tenant_links')
			.set({ role, updated_at: new Date() })
			.where('id', '=', existing.id)
			.returningAll()
			.execute();
		return updated as UserTenantLink;
	}

	// Create new link
	const [created] = await db
		.insertInto('user_tenant_links')
		.values({
			user_id: userId,
			tenant_id: tenantId,
			role,
			updated_at: new Date()
		})
		.returningAll()
		.execute();

	return created as UserTenantLink;
}

/**
 * Get user's booking history for a tenant
 */
export async function getUserBookingHistory(userId: string, tenantId: string) {
	const bookings = await db
		.selectFrom('bookings')
		.innerJoin('workshops', 'workshops.id', 'bookings.workshop_id')
		.where('bookings.user_id', '=', userId)
		.where('bookings.tenant_id', '=', tenantId)
		.select([
			'bookings.id',
			'bookings.status',
			'bookings.created_at',
			'bookings.cancelled_at',
			'workshops.title as workshop_title',
			'workshops.slug as workshop_slug',
			'workshops.price_paise'
		])
		.orderBy('bookings.created_at', 'desc')
		.execute();

	// Get payments for these bookings
	const bookingIds = bookings.map((b) => b.id);
	const payments =
		bookingIds.length > 0
			? await db
					.selectFrom('payments')
					.where('booking_id', 'in', bookingIds)
					.where('status', '=', 'completed')
					.select(['booking_id', 'amount_paise'])
					.execute()
			: [];

	const paymentMap = new Map<string, number>();
	for (const p of payments) {
		paymentMap.set(p.booking_id, (paymentMap.get(p.booking_id) || 0) + p.amount_paise);
	}

	return bookings.map((b) => ({
		id: b.id,
		status: b.status as BookingStatus,
		created_at: b.created_at,
		cancelled_at: b.cancelled_at,
		workshop_title: b.workshop_title,
		workshop_slug: b.workshop_slug,
		price_paise: b.price_paise,
		paid_paise: paymentMap.get(b.id) || 0
	}));
}

/**
 * Count total users for a tenant
 */
export async function countUsers(tenantId: string, search?: string): Promise<number> {
	let query = db
		.selectFrom('users')
		.leftJoin('user_tenant_links', (join) =>
			join
				.onRef('user_tenant_links.user_id', '=', 'users.id')
				.on('user_tenant_links.tenant_id', '=', tenantId)
		)
		.where('users.deleted_at', 'is', null)
		.where((eb) =>
			eb.or([
				eb('user_tenant_links.tenant_id', '=', tenantId),
				eb.exists(
					eb
						.selectFrom('bookings as b')
						.whereRef('b.user_id', '=', 'users.id')
						.where('b.tenant_id', '=', tenantId)
				)
			])
		);

	if (search) {
		const searchTerm = `%${search}%`;
		query = query.where((eb) =>
			eb.or([
				eb('users.name', 'ilike', searchTerm),
				eb('users.phone', 'ilike', searchTerm),
				eb('users.email', 'ilike', searchTerm)
			])
		);
	}

	const result = await query.select(db.fn.count('users.id').as('count')).executeTakeFirst();

	return Number(result?.count ?? 0);
}
