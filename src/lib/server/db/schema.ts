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
export type LayoutStatus = 'draft' | 'published';
export type LayoutRegionName = 'header' | 'footer' | 'announcement_bar' | 'sidebar';
export type ContactStatus = 'new' | 'read' | 'replied' | 'archived';
export type OtpPurpose = 'login' | 'signup' | 'verify_phone';
export type AuthMethod = 'phone_otp' | 'email_otp' | 'password';
export type FormType = 'standalone' | 'inline';
export type FormStatus = 'draft' | 'published' | 'archived';

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
	payment_gateways: Generated<Json<PaymentGatewayConfig>>;
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
	colors?: {
		primary?: string;
		primary_foreground?: string;
		secondary?: string;
		accent?: string;
	};
	logo_url?: string;
	brand_name?: string;
}

export interface PaymentGatewayConfig {
	razorpay?: {
		enabled: boolean;
		key_id?: string;
		key_secret?: string;
		webhook_secret?: string;
	};
	cashfree?: {
		enabled: boolean;
		app_id?: string;
		secret_key?: string;
		webhook_secret?: string;
	};
	upi_manual?: {
		enabled: boolean;
		upi_id?: string;
		qr_image_url?: string;
	};
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
	password_hash: string | null;
	auth_method: Generated<AuthMethod>;
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
// TEMPLATES
// ============================================
export type TemplateCategory = 'layout' | 'section' | 'component' | 'custom';

export interface TemplateSchemaField {
	key: string;
	type: 'text' | 'textarea' | 'richtext' | 'number' | 'boolean' | 'select' | 'image' | 'object' | 'array';
	label: string;
	required?: boolean;
	placeholder?: string;
	options?: { value: string; label: string }[]; // for select type
	fields?: TemplateSchemaField[]; // for object/array types
	itemType?: 'text' | 'object'; // for array type
}

export interface TemplateSchema {
	fields: TemplateSchemaField[];
}

export interface TemplatesTable {
	id: Generated<string>;
	tenant_id: string | null; // null = core/global template
	slug: string;
	name: string;
	description: string | null;
	category: TemplateCategory;

	// Source code (published = used by frontend rendering)
	source_code: string;
	// Draft source code (work-in-progress, used by admin preview)
	draft_source_code: string | null;

	// Compiled output
	compiled_js: string | null;
	compiled_css: string | null;
	compile_error: string | null;

	// Schema defines editable props
	schema: Json<TemplateSchema>;

	// Sample data for preview
	sample_data: Json<Record<string, unknown>>;

	// Metadata
	is_core: Generated<boolean>;
	created_at: Generated<Timestamp>;
	updated_at: Timestamp;
}

export type Template = Selectable<TemplatesTable>;
export type NewTemplate = Insertable<TemplatesTable>;
export type TemplateUpdate = Updateable<TemplatesTable>;

// ============================================
// LAYOUTS
// ============================================
export type LayoutRegions = Partial<Record<LayoutRegionName, PageBlock[]>>;

export interface LayoutsTable {
	id: Generated<string>;
	tenant_id: string;
	name: string;
	slug: string;
	is_default: Generated<boolean>;
	regions: Generated<Json<LayoutRegions>>;
	status: LayoutStatus;
	published_at: Timestamp | null;
	created_at: Generated<Timestamp>;
	updated_at: Timestamp;
}

export type Layout = Selectable<LayoutsTable>;
export type NewLayout = Insertable<LayoutsTable>;
export type LayoutUpdate = Updateable<LayoutsTable>;

// ============================================
// PAGES
// ============================================
export interface PageBlock {
	id: string; // unique block instance id
	template_id: string;
	props: Record<string, unknown>;
}

export interface PagesTable {
	id: Generated<string>;
	tenant_id: string;
	slug: string;
	title: string;
	content_html: string | null;
	content_json: Json<Record<string, unknown>> | null;
	template: string | null;
	template_id: string | null; // reference to templates table
	blocks: Generated<Json<PageBlock[]>>; // structured content blocks (defaults to [])
	layout_id: string | null;
	no_layout: Generated<boolean>;
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
// FORMS
// ============================================
export type FormFieldType =
	| 'text'
	| 'email'
	| 'phone'
	| 'textarea'
	| 'number'
	| 'select'
	| 'multi_select'
	| 'checkbox'
	| 'radio'
	| 'date'
	| 'date_range'
	| 'time'
	| 'file'
	| 'rating'
	| 'scale'
	| 'address'
	| 'signature'
	| 'heading';

export interface FormFieldDef {
	id: string;
	type: FormFieldType;
	label: string;
	placeholder?: string;
	required?: boolean;
	options?: { value: string; label: string }[];
	validation?: {
		min?: number;
		max?: number;
		min_length?: number;
		max_length?: number;
		pattern?: string;
		accept?: string; // file types
		max_size_mb?: number;
	};
	step?: number; // which step this field belongs to (0-indexed)
	// scale/rating specific
	scale_min?: number;
	scale_max?: number;
	scale_labels?: { min: string; max: string };
	// address sub-fields config
	address_fields?: ('street' | 'city' | 'state' | 'zip' | 'country')[];
}

export interface FormConditionalRule {
	field_id: string;
	operator: 'equals' | 'not_equals' | 'contains' | 'not_empty' | 'empty' | 'gt' | 'lt';
	value: string;
	target_field_id: string;
	action: 'show' | 'hide';
}

export interface FormSettings {
	submit_label?: string;
	success_message?: string;
	redirect_url?: string;
	multi_step?: boolean;
	steps?: { label: string }[];
}

export interface FormsTable {
	id: Generated<string>;
	tenant_id: string;
	title: string;
	slug: string;
	type: FormType;
	fields: Generated<Json<FormFieldDef[]>>;
	settings: Generated<Json<FormSettings>>;
	conditional_rules: Generated<Json<FormConditionalRule[]>>;
	status: FormStatus;
	created_at: Generated<Timestamp>;
	updated_at: Timestamp;
}

export type Form = Selectable<FormsTable>;
export type NewForm = Insertable<FormsTable>;
export type FormUpdate = Updateable<FormsTable>;

// ============================================
// FORM SUBMISSIONS
// ============================================
export interface FormSubmissionsTable {
	id: Generated<string>;
	tenant_id: string;
	form_id: string;
	data: Json<Record<string, unknown>>;
	metadata: Generated<Json<Record<string, unknown>>>;
	submitted_at: Generated<Timestamp>;
}

export type FormSubmission = Selectable<FormSubmissionsTable>;
export type NewFormSubmission = Insertable<FormSubmissionsTable>;
export type FormSubmissionUpdate = Updateable<FormSubmissionsTable>;

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
	templates: TemplatesTable;
	layouts: LayoutsTable;
	pages: PagesTable;
	media: MediaTable;
	contact_submissions: ContactSubmissionsTable;
	audit_logs: AuditLogsTable;
	forms: FormsTable;
	form_submissions: FormSubmissionsTable;
}
