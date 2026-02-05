import { Kysely, Migrator, FileMigrationProvider, PostgresDialect } from 'kysely';
import pg from 'pg';
import { promises as fs } from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import type { Database } from './schema.js';

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function migrate() {
	const connectionString = process.env.DATABASE_URL;
	if (!connectionString) {
		throw new Error('DATABASE_URL environment variable is required');
	}

	const db = new Kysely<Database>({
		dialect: new PostgresDialect({
			pool: new Pool({ connectionString })
		})
	});

	const migrator = new Migrator({
		db,
		provider: new FileMigrationProvider({
			fs,
			path,
			migrationFolder: path.join(__dirname, 'migrations')
		})
	});

	const { error, results } = await migrator.migrateToLatest();

	results?.forEach((it) => {
		if (it.status === 'Success') {
			console.log(`Migration "${it.migrationName}" was executed successfully`);
		} else if (it.status === 'Error') {
			console.error(`Failed to execute migration "${it.migrationName}"`);
		}
	});

	if (error) {
		console.error('Failed to migrate');
		console.error(error);
		process.exit(1);
	}

	await db.destroy();
	console.log('Migrations completed successfully');
}

migrate();
