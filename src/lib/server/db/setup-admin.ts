/**
 * Script to set up admin user with password
 *
 * Usage: DATABASE_URL=... ADMIN_EMAIL=... ADMIN_PASSWORD=... npx tsx src/lib/server/db/setup-admin.ts
 */

import { Kysely, PostgresDialect } from 'kysely';
import pg from 'pg';
import type { Database } from './schema.js';
import { hashPassword } from '../auth/password.js';

const { Pool } = pg;

async function setupAdmin() {
	const email = process.env.ADMIN_EMAIL;
	const password = process.env.ADMIN_PASSWORD;

	if (!email || !password) {
		console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD environment variables');
		console.error('Usage: DATABASE_URL=... ADMIN_EMAIL=... ADMIN_PASSWORD=... npx tsx src/lib/server/db/setup-admin.ts');
		process.exit(1);
	}

	const connectionString = process.env.DATABASE_URL;
	if (!connectionString) {
		throw new Error('DATABASE_URL environment variable is required');
	}

	const db = new Kysely<Database>({
		dialect: new PostgresDialect({
			pool: new Pool({ connectionString })
		})
	});

	console.log(`Setting up admin for: ${email}`);

	// Find user by email
	let user = await db
		.selectFrom('users')
		.where('email', '=', email.toLowerCase())
		.where('deleted_at', 'is', null)
		.selectAll()
		.executeTakeFirst();

	if (!user) {
		// Create new admin user
		const [newUser] = await db
			.insertInto('users')
			.values({
				phone: '+910000000000', // Placeholder - admin uses email login
				email: email.toLowerCase(),
				email_verified_at: new Date(),
				name: 'Admin',
				auth_method: 'password',
				password_hash: await hashPassword(password),
				updated_at: new Date()
			})
			.returningAll()
			.execute();
		user = newUser;
		console.log(`Created new user: ${user.id}`);
	} else {
		// Update existing user with password
		await db
			.updateTable('users')
			.set({
				password_hash: await hashPassword(password),
				auth_method: 'password',
				updated_at: new Date()
			})
			.where('id', '=', user.id)
			.execute();
		console.log(`Updated password for user: ${user.id}`);
	}

	// Get happyyogi tenant
	const tenant = await db
		.selectFrom('tenants')
		.where('slug', '=', 'happyyogi')
		.where('deleted_at', 'is', null)
		.selectAll()
		.executeTakeFirst();

	if (!tenant) {
		console.error('Error: happyyogi tenant not found. Run seed first.');
		process.exit(1);
	}

	// Check if user already has admin link
	const existingLink = await db
		.selectFrom('user_tenant_links')
		.where('user_id', '=', user.id)
		.where('tenant_id', '=', tenant.id)
		.selectAll()
		.executeTakeFirst();

	if (existingLink) {
		if (existingLink.role !== 'admin' && existingLink.role !== 'superadmin') {
			await db
				.updateTable('user_tenant_links')
				.set({ role: 'admin', updated_at: new Date() })
				.where('id', '=', existingLink.id)
				.execute();
			console.log('Upgraded to admin role');
		} else {
			console.log('Already has admin role');
		}
	} else {
		await db
			.insertInto('user_tenant_links')
			.values({
				user_id: user.id,
				tenant_id: tenant.id,
				role: 'admin',
				updated_at: new Date()
			})
			.execute();
		console.log('Created admin link');
	}

	await db.destroy();
	console.log('Admin setup complete!');
	console.log(`Login at /admin/login with email: ${email}`);
}

setupAdmin().catch((err) => {
	console.error('Setup failed:', err);
	process.exit(1);
});
