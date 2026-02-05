import type { Kysely } from 'kysely';
import { sql } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
	// Enable UUID extension
	await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`.execute(db);

	// ============================================
	// TENANTS
	// ============================================
	await db.schema
		.createTable('tenants')
		.addColumn('id', 'uuid', (col) =>
			col.primaryKey().defaultTo(sql`uuid_generate_v4()`)
		)
		.addColumn('name', 'varchar(255)', (col) => col.notNull())
		.addColumn('slug', 'varchar(100)', (col) => col.notNull().unique())
		.addColumn('domain', 'varchar(255)')
		.addColumn('timezone', 'varchar(50)', (col) => col.notNull().defaultTo('Asia/Kolkata'))
		.addColumn('currency', 'varchar(3)', (col) => col.notNull().defaultTo('INR'))
		.addColumn('settings', 'jsonb', (col) => col.notNull().defaultTo('{}'))
		.addColumn('theme', 'jsonb', (col) => col.notNull().defaultTo('{}'))
		.addColumn('logo_url', 'text')
		.addColumn('created_at', 'timestamptz', (col) =>
			col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
		)
		.addColumn('updated_at', 'timestamptz', (col) =>
			col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
		)
		.addColumn('deleted_at', 'timestamptz')
		.execute();

	await db.schema
		.createIndex('idx_tenants_slug')
		.on('tenants')
		.column('slug')
		.execute();

	await db.schema
		.createIndex('idx_tenants_domain')
		.on('tenants')
		.column('domain')
		.where('domain', 'is not', null)
		.execute();

	// ============================================
	// USERS
	// ============================================
	await db.schema
		.createTable('users')
		.addColumn('id', 'uuid', (col) =>
			col.primaryKey().defaultTo(sql`uuid_generate_v4()`)
		)
		.addColumn('phone', 'varchar(20)', (col) => col.notNull().unique())
		.addColumn('phone_verified_at', 'timestamptz')
		.addColumn('email', 'varchar(255)')
		.addColumn('email_verified_at', 'timestamptz')
		.addColumn('name', 'varchar(255)')
		.addColumn('avatar_url', 'text')
		.addColumn('timezone', 'varchar(50)')
		.addColumn('created_at', 'timestamptz', (col) =>
			col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
		)
		.addColumn('updated_at', 'timestamptz', (col) =>
			col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
		)
		.addColumn('deleted_at', 'timestamptz')
		.execute();

	await db.schema
		.createIndex('idx_users_phone')
		.on('users')
		.column('phone')
		.execute();

	await db.schema
		.createIndex('idx_users_email')
		.on('users')
		.column('email')
		.where('email', 'is not', null)
		.execute();

	// ============================================
	// SESSIONS
	// ============================================
	await db.schema
		.createTable('sessions')
		.addColumn('id', 'uuid', (col) =>
			col.primaryKey().defaultTo(sql`uuid_generate_v4()`)
		)
		.addColumn('user_id', 'uuid', (col) =>
			col.notNull().references('users.id').onDelete('cascade')
		)
		.addColumn('tenant_id', 'uuid', (col) =>
			col.references('tenants.id').onDelete('cascade')
		)
		.addColumn('device_info', 'jsonb')
		.addColumn('expires_at', 'timestamptz', (col) => col.notNull())
		.addColumn('created_at', 'timestamptz', (col) =>
			col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
		)
		.execute();

	await db.schema
		.createIndex('idx_sessions_user_id')
		.on('sessions')
		.column('user_id')
		.execute();

	await db.schema
		.createIndex('idx_sessions_expires_at')
		.on('sessions')
		.column('expires_at')
		.execute();

	// ============================================
	// OTP VERIFICATIONS
	// ============================================
	await db.schema
		.createTable('otp_verifications')
		.addColumn('id', 'uuid', (col) =>
			col.primaryKey().defaultTo(sql`uuid_generate_v4()`)
		)
		.addColumn('phone', 'varchar(20)', (col) => col.notNull())
		.addColumn('otp_hash', 'varchar(255)', (col) => col.notNull())
		.addColumn('purpose', 'varchar(20)', (col) => col.notNull())
		.addColumn('attempts', 'integer', (col) => col.notNull().defaultTo(0))
		.addColumn('expires_at', 'timestamptz', (col) => col.notNull())
		.addColumn('verified_at', 'timestamptz')
		.addColumn('created_at', 'timestamptz', (col) =>
			col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
		)
		.execute();

	await db.schema
		.createIndex('idx_otp_phone_purpose')
		.on('otp_verifications')
		.columns(['phone', 'purpose'])
		.execute();

	// ============================================
	// USER TENANT LINKS
	// ============================================
	await db.schema
		.createTable('user_tenant_links')
		.addColumn('id', 'uuid', (col) =>
			col.primaryKey().defaultTo(sql`uuid_generate_v4()`)
		)
		.addColumn('user_id', 'uuid', (col) =>
			col.notNull().references('users.id').onDelete('cascade')
		)
		.addColumn('tenant_id', 'uuid', (col) =>
			col.notNull().references('tenants.id').onDelete('cascade')
		)
		.addColumn('role', 'varchar(20)', (col) => col.notNull().defaultTo('user'))
		.addColumn('wallet_balance_paise', 'integer', (col) => col.notNull().defaultTo(0))
		.addColumn('created_at', 'timestamptz', (col) =>
			col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
		)
		.addColumn('updated_at', 'timestamptz', (col) =>
			col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
		)
		.execute();

	await db.schema
		.createIndex('idx_user_tenant_links_user_tenant')
		.on('user_tenant_links')
		.columns(['user_id', 'tenant_id'])
		.unique()
		.execute();

	await db.schema
		.createIndex('idx_user_tenant_links_tenant_id')
		.on('user_tenant_links')
		.column('tenant_id')
		.execute();

	// ============================================
	// INSTRUCTORS
	// ============================================
	await db.schema
		.createTable('instructors')
		.addColumn('id', 'uuid', (col) =>
			col.primaryKey().defaultTo(sql`uuid_generate_v4()`)
		)
		.addColumn('user_id', 'uuid', (col) =>
			col.notNull().references('users.id').onDelete('cascade')
		)
		.addColumn('slug', 'varchar(100)', (col) => col.notNull().unique())
		.addColumn('bio', 'text')
		.addColumn('certifications', 'jsonb', (col) => col.notNull().defaultTo('[]'))
		.addColumn('specializations', 'jsonb', (col) => col.notNull().defaultTo('[]'))
		.addColumn('avatar_url', 'text')
		.addColumn('gallery', 'jsonb', (col) => col.notNull().defaultTo('[]'))
		.addColumn('teaching_philosophy', 'text')
		.addColumn('created_at', 'timestamptz', (col) =>
			col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
		)
		.addColumn('updated_at', 'timestamptz', (col) =>
			col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
		)
		.addColumn('deleted_at', 'timestamptz')
		.execute();

	await db.schema
		.createIndex('idx_instructors_user_id')
		.on('instructors')
		.column('user_id')
		.execute();

	await db.schema
		.createIndex('idx_instructors_slug')
		.on('instructors')
		.column('slug')
		.execute();

	// ============================================
	// WORKSHOPS
	// ============================================
	await db.schema
		.createTable('workshops')
		.addColumn('id', 'uuid', (col) =>
			col.primaryKey().defaultTo(sql`uuid_generate_v4()`)
		)
		.addColumn('tenant_id', 'uuid', (col) =>
			col.notNull().references('tenants.id').onDelete('cascade')
		)
		.addColumn('instructor_id', 'uuid', (col) =>
			col.references('instructors.id').onDelete('set null')
		)
		.addColumn('title', 'varchar(255)', (col) => col.notNull())
		.addColumn('slug', 'varchar(255)', (col) => col.notNull())
		.addColumn('description', 'text')
		.addColumn('content_html', 'text')
		.addColumn('faqs', 'jsonb', (col) => col.notNull().defaultTo('[]'))
		.addColumn('venue_name', 'varchar(255)')
		.addColumn('venue_address', 'text')
		.addColumn('mode', 'varchar(20)', (col) => col.notNull().defaultTo('offline'))
		.addColumn('capacity', 'integer')
		.addColumn('price_paise', 'integer', (col) => col.notNull())
		.addColumn('deposit_amount_paise', 'integer')
		.addColumn('registration_opens_at', 'timestamptz')
		.addColumn('registration_closes_at', 'timestamptz')
		.addColumn('booking_hold_minutes', 'integer')
		.addColumn('cancellation_policy', 'text')
		.addColumn('status', 'varchar(20)', (col) => col.notNull().defaultTo('draft'))
		.addColumn('published_at', 'timestamptz')
		.addColumn('seo_title', 'varchar(255)')
		.addColumn('seo_description', 'text')
		.addColumn('og_image_url', 'text')
		.addColumn('created_at', 'timestamptz', (col) =>
			col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
		)
		.addColumn('updated_at', 'timestamptz', (col) =>
			col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
		)
		.addColumn('deleted_at', 'timestamptz')
		.execute();

	await db.schema
		.createIndex('idx_workshops_tenant_slug')
		.on('workshops')
		.columns(['tenant_id', 'slug'])
		.unique()
		.execute();

	await db.schema
		.createIndex('idx_workshops_tenant_status')
		.on('workshops')
		.columns(['tenant_id', 'status'])
		.execute();

	await db.schema
		.createIndex('idx_workshops_instructor_id')
		.on('workshops')
		.column('instructor_id')
		.execute();

	// ============================================
	// WORKSHOP SESSIONS
	// ============================================
	await db.schema
		.createTable('workshop_sessions')
		.addColumn('id', 'uuid', (col) =>
			col.primaryKey().defaultTo(sql`uuid_generate_v4()`)
		)
		.addColumn('workshop_id', 'uuid', (col) =>
			col.notNull().references('workshops.id').onDelete('cascade')
		)
		.addColumn('title', 'varchar(255)')
		.addColumn('starts_at', 'timestamptz', (col) => col.notNull())
		.addColumn('ends_at', 'timestamptz', (col) => col.notNull())
		.addColumn('session_order', 'integer', (col) => col.notNull())
		.addColumn('created_at', 'timestamptz', (col) =>
			col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
		)
		.execute();

	await db.schema
		.createIndex('idx_workshop_sessions_workshop_id')
		.on('workshop_sessions')
		.column('workshop_id')
		.execute();

	await db.schema
		.createIndex('idx_workshop_sessions_starts_at')
		.on('workshop_sessions')
		.column('starts_at')
		.execute();

	// ============================================
	// BOOKINGS
	// ============================================
	await db.schema
		.createTable('bookings')
		.addColumn('id', 'uuid', (col) =>
			col.primaryKey().defaultTo(sql`uuid_generate_v4()`)
		)
		.addColumn('tenant_id', 'uuid', (col) =>
			col.notNull().references('tenants.id').onDelete('cascade')
		)
		.addColumn('user_id', 'uuid', (col) =>
			col.notNull().references('users.id').onDelete('cascade')
		)
		.addColumn('workshop_id', 'uuid', (col) =>
			col.notNull().references('workshops.id').onDelete('cascade')
		)
		.addColumn('status', 'varchar(20)', (col) => col.notNull().defaultTo('pending'))
		.addColumn('hold_expires_at', 'timestamptz')
		.addColumn('cancelled_at', 'timestamptz')
		.addColumn('cancellation_reason', 'text')
		.addColumn('promo_code_id', 'uuid')
		.addColumn('discount_amount_paise', 'integer')
		.addColumn('created_at', 'timestamptz', (col) =>
			col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
		)
		.addColumn('updated_at', 'timestamptz', (col) =>
			col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
		)
		.execute();

	await db.schema
		.createIndex('idx_bookings_tenant_workshop')
		.on('bookings')
		.columns(['tenant_id', 'workshop_id'])
		.execute();

	await db.schema
		.createIndex('idx_bookings_user_id')
		.on('bookings')
		.column('user_id')
		.execute();

	await db.schema
		.createIndex('idx_bookings_status')
		.on('bookings')
		.column('status')
		.execute();

	await db.schema
		.createIndex('idx_bookings_hold_expires_at')
		.on('bookings')
		.column('hold_expires_at')
		.where('hold_expires_at', 'is not', null)
		.execute();

	// ============================================
	// WAITLISTS
	// ============================================
	await db.schema
		.createTable('waitlists')
		.addColumn('id', 'uuid', (col) =>
			col.primaryKey().defaultTo(sql`uuid_generate_v4()`)
		)
		.addColumn('tenant_id', 'uuid', (col) =>
			col.notNull().references('tenants.id').onDelete('cascade')
		)
		.addColumn('user_id', 'uuid', (col) =>
			col.notNull().references('users.id').onDelete('cascade')
		)
		.addColumn('workshop_id', 'uuid', (col) =>
			col.notNull().references('workshops.id').onDelete('cascade')
		)
		.addColumn('position', 'integer', (col) => col.notNull())
		.addColumn('status', 'varchar(20)', (col) => col.notNull().defaultTo('waiting'))
		.addColumn('offered_at', 'timestamptz')
		.addColumn('expires_at', 'timestamptz')
		.addColumn('created_at', 'timestamptz', (col) =>
			col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
		)
		.execute();

	await db.schema
		.createIndex('idx_waitlists_workshop_position')
		.on('waitlists')
		.columns(['workshop_id', 'position'])
		.execute();

	await db.schema
		.createIndex('idx_waitlists_user_workshop')
		.on('waitlists')
		.columns(['user_id', 'workshop_id'])
		.unique()
		.execute();

	// ============================================
	// PAYMENTS
	// ============================================
	await db.schema
		.createTable('payments')
		.addColumn('id', 'uuid', (col) =>
			col.primaryKey().defaultTo(sql`uuid_generate_v4()`)
		)
		.addColumn('tenant_id', 'uuid', (col) =>
			col.notNull().references('tenants.id').onDelete('cascade')
		)
		.addColumn('booking_id', 'uuid', (col) =>
			col.notNull().references('bookings.id').onDelete('cascade')
		)
		.addColumn('user_id', 'uuid', (col) =>
			col.notNull().references('users.id').onDelete('cascade')
		)
		.addColumn('amount_paise', 'integer', (col) => col.notNull())
		.addColumn('currency', 'varchar(3)', (col) => col.notNull().defaultTo('INR'))
		.addColumn('payment_type', 'varchar(20)', (col) => col.notNull().defaultTo('full'))
		.addColumn('method', 'varchar(20)')
		.addColumn('proof_url', 'text')
		.addColumn('gateway_payment_id', 'varchar(255)')
		.addColumn('gateway_response', 'jsonb')
		.addColumn('marked_by', 'uuid')
		.addColumn('marked_at', 'timestamptz')
		.addColumn('status', 'varchar(20)', (col) => col.notNull().defaultTo('pending'))
		.addColumn('created_at', 'timestamptz', (col) =>
			col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
		)
		.addColumn('updated_at', 'timestamptz', (col) =>
			col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
		)
		.execute();

	await db.schema
		.createIndex('idx_payments_booking_id')
		.on('payments')
		.column('booking_id')
		.execute();

	await db.schema
		.createIndex('idx_payments_tenant_status')
		.on('payments')
		.columns(['tenant_id', 'status'])
		.execute();

	await db.schema
		.createIndex('idx_payments_gateway_payment_id')
		.on('payments')
		.column('gateway_payment_id')
		.where('gateway_payment_id', 'is not', null)
		.execute();

	// ============================================
	// PAGES
	// ============================================
	await db.schema
		.createTable('pages')
		.addColumn('id', 'uuid', (col) =>
			col.primaryKey().defaultTo(sql`uuid_generate_v4()`)
		)
		.addColumn('tenant_id', 'uuid', (col) =>
			col.notNull().references('tenants.id').onDelete('cascade')
		)
		.addColumn('slug', 'varchar(255)', (col) => col.notNull())
		.addColumn('title', 'varchar(255)', (col) => col.notNull())
		.addColumn('content_html', 'text')
		.addColumn('content_json', 'jsonb')
		.addColumn('template', 'varchar(100)')
		.addColumn('seo_title', 'varchar(255)')
		.addColumn('seo_description', 'text')
		.addColumn('og_image_url', 'text')
		.addColumn('status', 'varchar(20)', (col) => col.notNull().defaultTo('draft'))
		.addColumn('published_at', 'timestamptz')
		.addColumn('created_at', 'timestamptz', (col) =>
			col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
		)
		.addColumn('updated_at', 'timestamptz', (col) =>
			col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
		)
		.addColumn('deleted_at', 'timestamptz')
		.execute();

	await db.schema
		.createIndex('idx_pages_tenant_slug')
		.on('pages')
		.columns(['tenant_id', 'slug'])
		.unique()
		.execute();

	await db.schema
		.createIndex('idx_pages_tenant_status')
		.on('pages')
		.columns(['tenant_id', 'status'])
		.execute();

	// ============================================
	// MEDIA
	// ============================================
	await db.schema
		.createTable('media')
		.addColumn('id', 'uuid', (col) =>
			col.primaryKey().defaultTo(sql`uuid_generate_v4()`)
		)
		.addColumn('tenant_id', 'uuid', (col) =>
			col.notNull().references('tenants.id').onDelete('cascade')
		)
		.addColumn('filename', 'varchar(255)', (col) => col.notNull())
		.addColumn('original_filename', 'varchar(255)', (col) => col.notNull())
		.addColumn('mime_type', 'varchar(100)', (col) => col.notNull())
		.addColumn('size_bytes', 'integer', (col) => col.notNull())
		.addColumn('storage_key', 'varchar(500)', (col) => col.notNull())
		.addColumn('url', 'text', (col) => col.notNull())
		.addColumn('variants', 'jsonb', (col) => col.notNull().defaultTo('{}'))
		.addColumn('alt_text', 'varchar(255)')
		.addColumn('uploaded_by', 'uuid')
		.addColumn('created_at', 'timestamptz', (col) =>
			col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
		)
		.execute();

	await db.schema
		.createIndex('idx_media_tenant_id')
		.on('media')
		.column('tenant_id')
		.execute();

	await db.schema
		.createIndex('idx_media_storage_key')
		.on('media')
		.column('storage_key')
		.execute();

	// ============================================
	// CONTACT SUBMISSIONS
	// ============================================
	await db.schema
		.createTable('contact_submissions')
		.addColumn('id', 'uuid', (col) =>
			col.primaryKey().defaultTo(sql`uuid_generate_v4()`)
		)
		.addColumn('tenant_id', 'uuid', (col) =>
			col.notNull().references('tenants.id').onDelete('cascade')
		)
		.addColumn('name', 'varchar(255)', (col) => col.notNull())
		.addColumn('email', 'varchar(255)')
		.addColumn('phone', 'varchar(20)')
		.addColumn('message', 'text', (col) => col.notNull())
		.addColumn('status', 'varchar(20)', (col) => col.notNull().defaultTo('new'))
		.addColumn('replied_at', 'timestamptz')
		.addColumn('created_at', 'timestamptz', (col) =>
			col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
		)
		.execute();

	await db.schema
		.createIndex('idx_contact_submissions_tenant_status')
		.on('contact_submissions')
		.columns(['tenant_id', 'status'])
		.execute();

	// ============================================
	// AUDIT LOGS
	// ============================================
	await db.schema
		.createTable('audit_logs')
		.addColumn('id', 'uuid', (col) =>
			col.primaryKey().defaultTo(sql`uuid_generate_v4()`)
		)
		.addColumn('tenant_id', 'uuid')
		.addColumn('actor_id', 'uuid')
		.addColumn('action', 'varchar(100)', (col) => col.notNull())
		.addColumn('resource_type', 'varchar(100)', (col) => col.notNull())
		.addColumn('resource_id', 'uuid')
		.addColumn('old_values', 'jsonb')
		.addColumn('new_values', 'jsonb')
		.addColumn('ip_address', 'varchar(45)')
		.addColumn('user_agent', 'text')
		.addColumn('created_at', 'timestamptz', (col) =>
			col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
		)
		.execute();

	await db.schema
		.createIndex('idx_audit_logs_tenant_id')
		.on('audit_logs')
		.column('tenant_id')
		.execute();

	await db.schema
		.createIndex('idx_audit_logs_resource')
		.on('audit_logs')
		.columns(['resource_type', 'resource_id'])
		.execute();

	await db.schema
		.createIndex('idx_audit_logs_created_at')
		.on('audit_logs')
		.column('created_at')
		.execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
	// Drop tables in reverse order of creation (to handle foreign keys)
	await db.schema.dropTable('audit_logs').execute();
	await db.schema.dropTable('contact_submissions').execute();
	await db.schema.dropTable('media').execute();
	await db.schema.dropTable('pages').execute();
	await db.schema.dropTable('payments').execute();
	await db.schema.dropTable('waitlists').execute();
	await db.schema.dropTable('bookings').execute();
	await db.schema.dropTable('workshop_sessions').execute();
	await db.schema.dropTable('workshops').execute();
	await db.schema.dropTable('instructors').execute();
	await db.schema.dropTable('user_tenant_links').execute();
	await db.schema.dropTable('otp_verifications').execute();
	await db.schema.dropTable('sessions').execute();
	await db.schema.dropTable('users').execute();
	await db.schema.dropTable('tenants').execute();
}
