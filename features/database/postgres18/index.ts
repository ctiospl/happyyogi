import { Kysely, PostgresDialect } from 'kysely';
import pg from 'pg';
import type { Database } from '../_shared/types.js';

const { Pool } = pg;

export function createDb(): Kysely<Database> {
	return new Kysely<Database>({
		dialect: new PostgresDialect({
			pool: new Pool({
				connectionString: process.env.DATABASE_URL,
				// PG18: Configure idle transaction timeout
				idle_in_transaction_session_timeout: 30000
			})
		})
	});
}

export const db = createDb();
