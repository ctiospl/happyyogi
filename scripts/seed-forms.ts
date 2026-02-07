/**
 * Seed forms into the database.
 * Run: set -a && source .env && set +a && npx tsx scripts/seed-forms.ts
 */

import { Kysely, PostgresDialect } from 'kysely';
import pg from 'pg';
import type { Database } from '../src/lib/server/db/schema.js';

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
	console.error('DATABASE_URL is required');
	process.exit(1);
}

const db = new Kysely<Database>({
	dialect: new PostgresDialect({
		pool: new Pool({ connectionString })
	})
});

async function main() {
	const tenant = await db.selectFrom('tenants').selectAll().executeTakeFirst();
	if (!tenant) {
		console.error('No tenants found');
		await db.destroy();
		process.exit(1);
	}
	console.log(`Tenant: ${tenant.name} (${tenant.id})`);

	const formDefs = [
		{
			slug: 'contact',
			title: 'Contact Form',
			type: 'inline' as const,
			status: 'published' as const,
			fields: [
				{
					id: 'full_name',
					type: 'text',
					label: 'Full Name',
					required: true,
					placeholder: 'Your name'
				},
				{
					id: 'email',
					type: 'email',
					label: 'Email',
					required: false,
					placeholder: 'your@email.com'
				},
				{
					id: 'phone',
					type: 'phone',
					label: 'Phone',
					required: true,
					placeholder: '+91 98XXX XXXXX'
				},
				{
					id: 'message',
					type: 'textarea',
					label: 'Message',
					required: true,
					placeholder: 'How can we help you?'
				}
			],
			settings: {
				submit_label: 'Send Message',
				success_message: "Thank you! We'll get back to you shortly."
			}
		}
	];

	for (const def of formDefs) {
		const existing = await db
			.selectFrom('forms')
			.selectAll()
			.where('tenant_id', '=', tenant.id)
			.where('slug', '=', def.slug)
			.executeTakeFirst();

		if (existing) {
			await db
				.updateTable('forms')
				.set({
					title: def.title,
					type: def.type,
					status: def.status,
					fields: JSON.stringify(def.fields) as any,
					settings: JSON.stringify(def.settings) as any,
					updated_at: new Date()
				})
				.where('id', '=', existing.id)
				.execute();
			console.log(`  Updated form: ${def.slug} (${existing.id})`);
		} else {
			const created = await db
				.insertInto('forms')
				.values({
					tenant_id: tenant.id,
					slug: def.slug,
					title: def.title,
					type: def.type,
					status: def.status,
					fields: JSON.stringify(def.fields) as any,
					settings: JSON.stringify(def.settings) as any,
					updated_at: new Date()
				})
				.returningAll()
				.executeTakeFirstOrThrow();
			console.log(`  Created form: ${def.slug} (${created.id})`);
		}
	}

	await db.destroy();
}

main();
