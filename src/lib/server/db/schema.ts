import type { ColumnType, Generated, Insertable, Selectable, Updateable } from 'kysely';

// Helper types
type Timestamp = ColumnType<Date, Date | string, Date | string>;
type Json<T> = ColumnType<T, T | string, T | string>;

// Enums as string literals for type safety
export type UserRole = 'user' | 'admin' | 'superadmin';
export type WorkshopMode = 'online' | 'offline' | 'hybrid';
export type WorkshopStatus = 'draft' | 'published' | 'cancelled' | 'completed';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type WaitlistStatus = 'waiting' | 'offered' | 'declined' | 'converted';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type PaymentType = 'full' | 'deposit' | 'balance';
export type PaymentMethod = 'upi' | 'cash' | 'card' | 'bank_transfer' | 'gateway';
export type PageStatus = 'draft' | 'published';
export type ContactStatus = 'new' | 'read' | 'replied' | 'archived';
export type OtpPurpose = 'login' | 'signup' | 'verify_phone';

// ============================================
// TENANTS
// ============================================
export interface TenantsTable {
	id: Generated<string>;
	name: string;
	slug: string;
	domain: string | null;
	timezone: string;
	currency: string;
	settings: Json<TenantSettings>;
	theme: Json<TenantTheme>;
	logo_url: string | null;
	created_at: Generated<Timestamp>;
	updated_at: Timestamp;
	deleted_at: Timestamp | null;
}

export interface TenantSettings {
	booking_hold_minutes?: number;
	default_cancellation_policy?: string;
	reminder_hours?: number[];
	allow_waitlist?: boolean;
}

export interface TenantTheme {
	primary_color?: string;
	secondary_color?: string;
	font_family?: string;
	custom_css?: string;
}

export type Tenant = Selectable<TenantsTable>;
export type NewTenant = Insertable<TenantsTable>;
export type TenantUpdate = Updateable<TenantsTable>;

// ============================================
// USERS
// ============================================
export interface UsersTable {
	id: Generated<string>;
	phone: string;
	phone_verified_at: Timestamp | null;
	email: string | null;
	email_verified_at: Timestamp | null;
	name: string | null;
	avatar_url: string | null;
	timezone: string | null;
	created_at: Generated<Timestamp>;
	updated_at: Timestamp;
	deleted_at: Timestamp | null;
}

export type User = Selectable<UsersTable>;
export type NewUser = Insertable<UsersTable>;
export type UserUpdate = Updateable<UsersTable>;

// ============================================
// SESSIONS
// ============================================
export interface SessionsTable {
	id: Generated<string>;
	user_id: string;
	tenant_id: string | null;
	device_info: Json<DeviceInfo> | null;
	expires_at: Timestamp;
	created_at: Generated<Timestamp>;
}

export interface DeviceInfo {
	user_agent?: string;
	ip?: string;
	device_type?: string;
}

export type Session = Selectable<SessionsTable>;
export type NewSession = Insertable<SessionsTable>;
export type SessionUpdate = Updateable<SessionsTable>;

// ============================================
// OTP VERIFICATIONS
// ============================================
export interface OtpVerificationsTable {
	id: Generated<string>;
	phone: string;
	otp_hash: string;
	purpose: OtpPurpose;
	attempts: Generated<number>;
	expires_at: Timestamp;
	verified_at: Timestamp | null;
	created_at: Generated<Timestamp>;
}

export type OtpVerification = Selectable<OtpVerificationsTable>;
export type NewOtpVerification = Insertable<OtpVerificationsTable>;
export type OtpVerificationUpdate = Updateable<OtpVerificationsTable>;

// ============================================
// USER TENANT LINKS
// ============================================
export interface UserTenantLinksTable {
	id: Generated<string>;
	user_id: string;
	tenant_id: string;
	role: UserRole;
	wallet_balance_paise: Generated<number>;
	created_at: Generated<Timestamp>;
	updated_at: Timestamp;
}

export type UserTenantLink = Selectable<UserTenantLinksTable>;
export type NewUserTenantLink = Insertable<UserTenantLinksTable>;
export type UserTenantLinkUpdate = Updateable<UserTenantLinksTable>;

// ============================================
// INSTRUCTORS
// ============================================
export interface InstructorsTable {
	id: Generated<string>;
	user_id: string;
	slug: string;
	bio: string | null;
	certifications: Json<string[]>;
	specializations: Json<string[]>;
	avatar_url: string | null;
	gallery: Json<string[]>;
	teaching_philosophy: string | null;
	created_at: Generated<Timestamp>;
	updated_at: Timestamp;
	deleted_at: Timestamp | null;
}

export type Instructor = Selectable<InstructorsTable>;
export type NewInstructor = Insertable<InstructorsTable>;
export type InstructorUpdate = Updateable<InstructorsTable>;

// ============================================
// WORKSHOPS
// ============================================
export interface WorkshopsTable {
	id: Generated<string>;
	tenant_id: string;
	instructor_id: string | null;
	title: string;
	slug: string;
	description: string | null;
	content_html: string | null;
	faqs: Json<WorkshopFaq[]>;
	venue_name: string | null;
	venue_address: string | null;
	mode: WorkshopMode;
	capacity: number | null;
	price_paise: number;
	deposit_amount_paise: number | null;
	registration_opens_at: Timestamp | null;
	registration_closes_at: Timestamp | null;
	booking_hold_minutes: number | null;
	cancellation_policy: string | null;
	status: WorkshopStatus;
	published_at: Timestamp | null;
	seo_title: string | null;
	seo_description: string | null;
	og_image_url: string | null;
	created_at: Generated<Timestamp>;
	updated_at: Timestamp;
	deleted_at: Timestamp | null;
}

export interface WorkshopFaq {
	question: string;
	answer: string;
}

export type Workshop = Selectable<WorkshopsTable>;
export type NewWorkshop = Insertable<WorkshopsTable>;
export type WorkshopUpdate = Updateable<WorkshopsTable>;

// ============================================
// WORKSHOP SESSIONS
// ============================================
export interface WorkshopSessionsTable {
	id: Generated<string>;
	workshop_id: string;
	title: string | null;
	starts_at: Timestamp;
	ends_at: Timestamp;
	session_order: number;
	created_at: Generated<Timestamp>;
}

export type WorkshopSession = Selectable<WorkshopSessionsTable>;
export type NewWorkshopSession = Insertable<WorkshopSessionsTable>;
export type WorkshopSessionUpdate = Updateable<WorkshopSessionsTable>;

// ============================================
// BOOKINGS
// ============================================
export interface BookingsTable {
	id: Generated<string>;
	tenant_id: string;
	user_id: string;
	workshop_id: string;
	status: BookingStatus;
	hold_expires_at: Timestamp | null;
	cancelled_at: Timestamp | null;
	cancellation_reason: string | null;
	promo_code_id: string | null;
	discount_amount_paise: number | null;
	created_at: Generated<Timestamp>;
	updated_at: Timestamp;
}

export type Booking = Selectable<BookingsTable>;
export type NewBooking = Insertable<BookingsTable>;
export type BookingUpdate = Updateable<BookingsTable>;

// ============================================
// WAITLISTS
// ============================================
export interface WaitlistsTable {
	id: Generated<string>;
	tenant_id: string;
	user_id: string;
	workshop_id: string;
	position: number;
	status: WaitlistStatus;
	offered_at: Timestamp | null;
	expires_at: Timestamp | null;
	created_at: Generated<Timestamp>;
}

export type Waitlist = Selectable<WaitlistsTable>;
export type NewWaitlist = Insertable<WaitlistsTable>;
export type WaitlistUpdate = Updateable<WaitlistsTable>;

// ============================================
// PAYMENTS
// ============================================
export interface PaymentsTable {
	id: Generated<string>;
	tenant_id: string;
	booking_id: string;
	user_id: string;
	amount_paise: number;
	currency: string;
	payment_type: PaymentType;
	method: PaymentMethod | null;
	proof_url: string | null;
	gateway_payment_id: string | null;
	gateway_response: Json<Record<string, unknown>> | null;
	marked_by: string | null;
	marked_at: Timestamp | null;
	status: PaymentStatus;
	created_at: Generated<Timestamp>;
	updated_at: Timestamp;
}

export type Payment = Selectable<PaymentsTable>;
export type NewPayment = Insertable<PaymentsTable>;
export type PaymentUpdate = Updateable<PaymentsTable>;

// ============================================
// PAGES
// ============================================
export interface PagesTable {
	id: Generated<string>;
	tenant_id: string;
	slug: string;
	title: string;
	content_html: string | null;
	content_json: Json<Record<string, unknown>> | null;
	template: string | null;
	seo_title: string | null;
	seo_description: string | null;
	og_image_url: string | null;
	status: PageStatus;
	published_at: Timestamp | null;
	created_at: Generated<Timestamp>;
	updated_at: Timestamp;
	deleted_at: Timestamp | null;
}

export type Page = Selectable<PagesTable>;
export type NewPage = Insertable<PagesTable>;
export type PageUpdate = Updateable<PagesTable>;

// ============================================
// MEDIA
// ============================================
export interface MediaTable {
	id: Generated<string>;
	tenant_id: string;
	filename: string;
	original_filename: string;
	mime_type: string;
	size_bytes: number;
	storage_key: string;
	url: string;
	variants: Json<MediaVariants>;
	alt_text: string | null;
	uploaded_by: string | null;
	created_at: Generated<Timestamp>;
}

export interface MediaVariants {
	sm?: string;
	md?: string;
	lg?: string;
	webp?: string;
	webp_sm?: string;
	webp_md?: string;
	webp_lg?: string;
}

export type Media = Selectable<MediaTable>;
export type NewMedia = Insertable<MediaTable>;
export type MediaUpdate = Updateable<MediaTable>;

// ============================================
// CONTACT SUBMISSIONS
// ============================================
export interface ContactSubmissionsTable {
	id: Generated<string>;
	tenant_id: string;
	name: string;
	email: string | null;
	phone: string | null;
	message: string;
	status: ContactStatus;
	replied_at: Timestamp | null;
	created_at: Generated<Timestamp>;
}

export type ContactSubmission = Selectable<ContactSubmissionsTable>;
export type NewContactSubmission = Insertable<ContactSubmissionsTable>;
export type ContactSubmissionUpdate = Updateable<ContactSubmissionsTable>;

// ============================================
// AUDIT LOGS
// ============================================
export interface AuditLogsTable {
	id: Generated<string>;
	tenant_id: string | null;
	actor_id: string | null;
	action: string;
	resource_type: string;
	resource_id: string | null;
	old_values: Json<Record<string, unknown>> | null;
	new_values: Json<Record<string, unknown>> | null;
	ip_address: string | null;
	user_agent: string | null;
	created_at: Generated<Timestamp>;
}

export type AuditLog = Selectable<AuditLogsTable>;
export type NewAuditLog = Insertable<AuditLogsTable>;

// ============================================
// DATABASE INTERFACE
// ============================================
export interface Database {
	tenants: TenantsTable;
	users: UsersTable;
	sessions: SessionsTable;
	otp_verifications: OtpVerificationsTable;
	user_tenant_links: UserTenantLinksTable;
	instructors: InstructorsTable;
	workshops: WorkshopsTable;
	workshop_sessions: WorkshopSessionsTable;
	bookings: BookingsTable;
	waitlists: WaitlistsTable;
	payments: PaymentsTable;
	pages: PagesTable;
	media: MediaTable;
	contact_submissions: ContactSubmissionsTable;
	audit_logs: AuditLogsTable;
}
