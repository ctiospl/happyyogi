import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { DATABASE_URL } from '$env/static/private';
import type { Database } from './schema.js';

const pool = new Pool({
	connectionString: DATABASE_URL,
	min: 2,
	max: 10,
	connectionTimeoutMillis: 10000,
	idleTimeoutMillis: 30000
});

pool.on('error', (err) => {
	console.error('Database pool error:', err);
});

export const db = new Kysely<Database>({
	dialect: new PostgresDialect({ pool })
});

export type { Database } from './schema.js';
