import type { Kysely } from 'kysely';
import { sql } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
	// Add password auth columns to users
	await db.schema
		.alterTable('users')
		.addColumn('password_hash', 'text')
		.execute();

	await db.schema
		.alterTable('users')
		.addColumn('auth_method', 'varchar(20)', (col) => col.defaultTo('phone_otp'))
		.execute();

	// Add payment gateway config to tenants
	await db.schema
		.alterTable('tenants')
		.addColumn('payment_gateways', 'jsonb', (col) => col.defaultTo('{}'))
		.execute();

	// Seed Happy Yogi theme if not set
	await sql`
		UPDATE tenants SET theme = '{
			"colors": {
				"primary": "oklch(0.45 0.08 150)",
				"primary_foreground": "oklch(0.98 0.005 70)",
				"secondary": "oklch(0.92 0.03 70)",
				"accent": "oklch(0.65 0.12 55)"
			},
			"logo_url": "/images/happyyogi-logo.png",
			"brand_name": "Happy Yogi Shaala"
		}'::jsonb WHERE slug = 'happyyogi' AND (theme = '{}'::jsonb OR theme IS NULL)
	`.execute(db);
}

export async function down(db: Kysely<unknown>): Promise<void> {
	await db.schema.alterTable('users').dropColumn('password_hash').execute();
	await db.schema.alterTable('users').dropColumn('auth_method').execute();
	await db.schema.alterTable('tenants').dropColumn('payment_gateways').execute();
}
