import { db } from '$lib/server/db';
import type {
	Workshop,
	WorkshopSession,
	NewWorkshop,
	NewWorkshopSession,
	WorkshopUpdate
} from '$lib/server/db/schema';

export interface WorkshopWithSessions extends Workshop {
	sessions: WorkshopSession[];
	instructor?: {
		id: string;
		name: string | null;
		slug: string;
		avatar_url: string | null;
	};
	bookings_count?: number;
}

/**
 * Get all published workshops for a tenant
 */
export async function getPublishedWorkshops(tenantId: string): Promise<WorkshopWithSessions[]> {
	const workshops = await db
		.selectFrom('workshops')
		.leftJoin('instructors', 'instructors.id', 'workshops.instructor_id')
		.leftJoin('users', 'users.id', 'instructors.user_id')
		.where('workshops.tenant_id', '=', tenantId)
		.where('workshops.status', '=', 'published')
		.where('workshops.deleted_at', 'is', null)
		.select([
			'workshops.id',
			'workshops.tenant_id',
			'workshops.instructor_id',
			'workshops.title',
			'workshops.slug',
			'workshops.description',
			'workshops.content_html',
			'workshops.faqs',
			'workshops.venue_name',
			'workshops.venue_address',
			'workshops.mode',
			'workshops.capacity',
			'workshops.price_paise',
			'workshops.deposit_amount_paise',
			'workshops.registration_opens_at',
			'workshops.registration_closes_at',
			'workshops.booking_hold_minutes',
			'workshops.cancellation_policy',
			'workshops.status',
			'workshops.published_at',
			'workshops.seo_title',
			'workshops.seo_description',
			'workshops.og_image_url',
			'workshops.created_at',
			'workshops.updated_at',
			'workshops.deleted_at',
			'instructors.slug as instructor_slug',
			'instructors.avatar_url as instructor_avatar',
			'users.name as instructor_name'
		])
		.orderBy('workshops.created_at', 'desc')
		.execute();

	// Get sessions for each workshop
	const workshopIds = workshops.map((w) => w.id);
	const sessions =
		workshopIds.length > 0
			? await db
					.selectFrom('workshop_sessions')
					.where('workshop_id', 'in', workshopIds)
					.selectAll()
					.orderBy('session_order', 'asc')
					.execute()
			: [];

	// Get booking counts
	const bookingCounts =
		workshopIds.length > 0
			? await db
					.selectFrom('bookings')
					.where('workshop_id', 'in', workshopIds)
					.where('status', 'in', ['pending', 'confirmed'])
					.select(['workshop_id'])
					.select(db.fn.count('id').as('count'))
					.groupBy('workshop_id')
					.execute()
			: [];

	const countMap = new Map(bookingCounts.map((c) => [c.workshop_id, Number(c.count)]));
	const sessionMap = new Map<string, WorkshopSession[]>();
	for (const session of sessions) {
		const existing = sessionMap.get(session.workshop_id) || [];
		existing.push(session as WorkshopSession);
		sessionMap.set(session.workshop_id, existing);
	}

	return workshops.map((w) => ({
		...(w as unknown as Workshop),
		sessions: sessionMap.get(w.id) || [],
		instructor: w.instructor_id
			? {
					id: w.instructor_id,
					name: w.instructor_name,
					slug: w.instructor_slug!,
					avatar_url: w.instructor_avatar
				}
			: undefined,
		bookings_count: countMap.get(w.id) || 0
	}));
}

/**
 * Get a single workshop by slug
 */
export async function getWorkshopBySlug(
	tenantId: string,
	slug: string
): Promise<WorkshopWithSessions | null> {
	const workshop = await db
		.selectFrom('workshops')
		.leftJoin('instructors', 'instructors.id', 'workshops.instructor_id')
		.leftJoin('users', 'users.id', 'instructors.user_id')
		.where('workshops.tenant_id', '=', tenantId)
		.where('workshops.slug', '=', slug)
		.where('workshops.deleted_at', 'is', null)
		.select([
			'workshops.id',
			'workshops.tenant_id',
			'workshops.instructor_id',
			'workshops.title',
			'workshops.slug',
			'workshops.description',
			'workshops.content_html',
			'workshops.faqs',
			'workshops.venue_name',
			'workshops.venue_address',
			'workshops.mode',
			'workshops.capacity',
			'workshops.price_paise',
			'workshops.deposit_amount_paise',
			'workshops.registration_opens_at',
			'workshops.registration_closes_at',
			'workshops.booking_hold_minutes',
			'workshops.cancellation_policy',
			'workshops.status',
			'workshops.published_at',
			'workshops.seo_title',
			'workshops.seo_description',
			'workshops.og_image_url',
			'workshops.created_at',
			'workshops.updated_at',
			'workshops.deleted_at',
			'instructors.slug as instructor_slug',
			'instructors.avatar_url as instructor_avatar',
			'instructors.bio as instructor_bio',
			'users.name as instructor_name'
		])
		.executeTakeFirst();

	if (!workshop) return null;

	const sessions = await db
		.selectFrom('workshop_sessions')
		.where('workshop_id', '=', workshop.id)
		.selectAll()
		.orderBy('session_order', 'asc')
		.execute();

	const bookingCount = await db
		.selectFrom('bookings')
		.where('workshop_id', '=', workshop.id)
		.where('status', 'in', ['pending', 'confirmed'])
		.select(db.fn.count('id').as('count'))
		.executeTakeFirst();

	return {
		...(workshop as unknown as Workshop),
		sessions: sessions as WorkshopSession[],
		instructor: workshop.instructor_id
			? {
					id: workshop.instructor_id,
					name: workshop.instructor_name,
					slug: workshop.instructor_slug!,
					avatar_url: workshop.instructor_avatar
				}
			: undefined,
		bookings_count: Number(bookingCount?.count || 0)
	};
}

/**
 * Get all workshops for admin (including drafts)
 */
export async function getAllWorkshops(tenantId: string): Promise<WorkshopWithSessions[]> {
	const workshops = await db
		.selectFrom('workshops')
		.leftJoin('instructors', 'instructors.id', 'workshops.instructor_id')
		.leftJoin('users', 'users.id', 'instructors.user_id')
		.where('workshops.tenant_id', '=', tenantId)
		.where('workshops.deleted_at', 'is', null)
		.select([
			'workshops.id',
			'workshops.tenant_id',
			'workshops.instructor_id',
			'workshops.title',
			'workshops.slug',
			'workshops.description',
			'workshops.content_html',
			'workshops.faqs',
			'workshops.venue_name',
			'workshops.venue_address',
			'workshops.mode',
			'workshops.capacity',
			'workshops.price_paise',
			'workshops.deposit_amount_paise',
			'workshops.registration_opens_at',
			'workshops.registration_closes_at',
			'workshops.booking_hold_minutes',
			'workshops.cancellation_policy',
			'workshops.status',
			'workshops.published_at',
			'workshops.seo_title',
			'workshops.seo_description',
			'workshops.og_image_url',
			'workshops.created_at',
			'workshops.updated_at',
			'workshops.deleted_at',
			'instructors.slug as instructor_slug',
			'instructors.avatar_url as instructor_avatar',
			'users.name as instructor_name'
		])
		.orderBy('workshops.created_at', 'desc')
		.execute();

	const workshopIds = workshops.map((w) => w.id);
	const sessions =
		workshopIds.length > 0
			? await db
					.selectFrom('workshop_sessions')
					.where('workshop_id', 'in', workshopIds)
					.selectAll()
					.orderBy('session_order', 'asc')
					.execute()
			: [];

	const bookingCounts =
		workshopIds.length > 0
			? await db
					.selectFrom('bookings')
					.where('workshop_id', 'in', workshopIds)
					.where('status', 'in', ['pending', 'confirmed'])
					.select(['workshop_id'])
					.select(db.fn.count('id').as('count'))
					.groupBy('workshop_id')
					.execute()
			: [];

	const countMap = new Map(bookingCounts.map((c) => [c.workshop_id, Number(c.count)]));
	const sessionMap = new Map<string, WorkshopSession[]>();
	for (const session of sessions) {
		const existing = sessionMap.get(session.workshop_id) || [];
		existing.push(session as WorkshopSession);
		sessionMap.set(session.workshop_id, existing);
	}

	return workshops.map((w) => ({
		...(w as unknown as Workshop),
		sessions: sessionMap.get(w.id) || [],
		instructor: w.instructor_id
			? {
					id: w.instructor_id,
					name: w.instructor_name,
					slug: w.instructor_slug!,
					avatar_url: w.instructor_avatar
				}
			: undefined,
		bookings_count: countMap.get(w.id) || 0
	}));
}

/**
 * Create a new workshop
 */
export async function createWorkshop(
	data: NewWorkshop,
	sessions?: Omit<NewWorkshopSession, 'workshop_id'>[]
): Promise<Workshop> {
	const [workshop] = await db
		.insertInto('workshops')
		.values(data)
		.returningAll()
		.execute();

	if (sessions && sessions.length > 0) {
		await db
			.insertInto('workshop_sessions')
			.values(
				sessions.map((s, i) => ({
					...s,
					workshop_id: workshop.id,
					session_order: s.session_order ?? i + 1
				}))
			)
			.execute();
	}

	return workshop as Workshop;
}

/**
 * Update a workshop
 */
export async function updateWorkshop(
	workshopId: string,
	tenantId: string,
	data: WorkshopUpdate
): Promise<Workshop | null> {
	const [updated] = await db
		.updateTable('workshops')
		.set({ ...data, updated_at: new Date() })
		.where('id', '=', workshopId)
		.where('tenant_id', '=', tenantId)
		.returningAll()
		.execute();

	return (updated as Workshop) || null;
}

/**
 * Update workshop sessions
 */
export async function updateWorkshopSessions(
	workshopId: string,
	tenantId: string,
	sessions: Omit<NewWorkshopSession, 'workshop_id'>[]
): Promise<void> {
	// Verify workshop belongs to tenant first
	const workshop = await db
		.selectFrom('workshops')
		.where('id', '=', workshopId)
		.where('tenant_id', '=', tenantId)
		.select('id')
		.executeTakeFirst();

	if (!workshop) {
		throw new Error('Workshop not found');
	}

	// Delete existing sessions
	await db
		.deleteFrom('workshop_sessions')
		.where('workshop_id', '=', workshopId)
		.execute();

	// Insert new sessions
	if (sessions.length > 0) {
		await db
			.insertInto('workshop_sessions')
			.values(
				sessions.map((s, i) => ({
					...s,
					workshop_id: workshopId,
					session_order: s.session_order ?? i + 1
				}))
			)
			.execute();
	}
}

/**
 * Publish a workshop
 */
export async function publishWorkshop(workshopId: string, tenantId: string): Promise<Workshop | null> {
	return updateWorkshop(workshopId, tenantId, {
		status: 'published',
		published_at: new Date()
	});
}

/**
 * Unpublish a workshop
 */
export async function unpublishWorkshop(workshopId: string, tenantId: string): Promise<Workshop | null> {
	return updateWorkshop(workshopId, tenantId, {
		status: 'draft',
		published_at: null
	});
}

/**
 * Soft delete a workshop
 */
export async function deleteWorkshop(workshopId: string, tenantId: string): Promise<void> {
	await db
		.updateTable('workshops')
		.set({ deleted_at: new Date(), updated_at: new Date() })
		.where('id', '=', workshopId)
		.where('tenant_id', '=', tenantId)
		.execute();
}

/**
 * Check if workshop has available capacity
 */
export async function getAvailableCapacity(workshopId: string): Promise<number | null> {
	const workshop = await db
		.selectFrom('workshops')
		.where('id', '=', workshopId)
		.select(['capacity'])
		.executeTakeFirst();

	if (!workshop || workshop.capacity === null) return null;

	const bookingCount = await db
		.selectFrom('bookings')
		.where('workshop_id', '=', workshopId)
		.where('status', 'in', ['pending', 'confirmed'])
		.select(db.fn.count('id').as('count'))
		.executeTakeFirst();

	return workshop.capacity - Number(bookingCount?.count || 0);
}

/**
 * Get a workshop by ID (for admin editing)
 */
export async function getWorkshopById(workshopId: string): Promise<WorkshopWithSessions | null> {
	const workshop = await db
		.selectFrom('workshops')
		.leftJoin('instructors', 'instructors.id', 'workshops.instructor_id')
		.leftJoin('users', 'users.id', 'instructors.user_id')
		.where('workshops.id', '=', workshopId)
		.where('workshops.deleted_at', 'is', null)
		.select([
			'workshops.id',
			'workshops.tenant_id',
			'workshops.instructor_id',
			'workshops.title',
			'workshops.slug',
			'workshops.description',
			'workshops.content_html',
			'workshops.faqs',
			'workshops.venue_name',
			'workshops.venue_address',
			'workshops.mode',
			'workshops.capacity',
			'workshops.price_paise',
			'workshops.deposit_amount_paise',
			'workshops.registration_opens_at',
			'workshops.registration_closes_at',
			'workshops.booking_hold_minutes',
			'workshops.cancellation_policy',
			'workshops.status',
			'workshops.published_at',
			'workshops.seo_title',
			'workshops.seo_description',
			'workshops.og_image_url',
			'workshops.created_at',
			'workshops.updated_at',
			'workshops.deleted_at',
			'instructors.slug as instructor_slug',
			'instructors.avatar_url as instructor_avatar',
			'users.name as instructor_name'
		])
		.executeTakeFirst();

	if (!workshop) return null;

	const sessions = await db
		.selectFrom('workshop_sessions')
		.where('workshop_id', '=', workshop.id)
		.selectAll()
		.orderBy('session_order', 'asc')
		.execute();

	const bookingCount = await db
		.selectFrom('bookings')
		.where('workshop_id', '=', workshop.id)
		.where('status', 'in', ['pending', 'confirmed'])
		.select(db.fn.count('id').as('count'))
		.executeTakeFirst();

	return {
		...(workshop as unknown as Workshop),
		sessions: sessions as WorkshopSession[],
		instructor: workshop.instructor_id
			? {
					id: workshop.instructor_id,
					name: workshop.instructor_name,
					slug: workshop.instructor_slug!,
					avatar_url: workshop.instructor_avatar
				}
			: undefined,
		bookings_count: Number(bookingCount?.count || 0)
	};
}

/**
 * Get all instructors for a tenant (for dropdown selection)
 */
export async function getInstructors(
	tenantId: string
): Promise<{ id: string; name: string | null; slug: string }[]> {
	const instructors = await db
		.selectFrom('instructors')
		.innerJoin('users', 'users.id', 'instructors.user_id')
		.innerJoin('user_tenant_links', 'user_tenant_links.user_id', 'users.id')
		.where('user_tenant_links.tenant_id', '=', tenantId)
		.where('instructors.deleted_at', 'is', null)
		.select(['instructors.id', 'users.name', 'instructors.slug'])
		.execute();

	return instructors;
}

/**
 * Check if registration is open for a workshop
 */
export function isRegistrationOpen(workshop: Workshop): boolean {
	const now = new Date();

	if (workshop.status !== 'published') return false;
	if (workshop.registration_opens_at && new Date(workshop.registration_opens_at) > now)
		return false;
	if (workshop.registration_closes_at && new Date(workshop.registration_closes_at) < now)
		return false;

	return true;
}
