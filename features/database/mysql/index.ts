import { Kysely, MysqlDialect } from 'kysely';
import { createPool } from 'mysql2';
import type { Database } from '../_shared/types.js';

export function createDb(): Kysely<Database> {
	return new Kysely<Database>({
		dialect: new MysqlDialect({
			pool: createPool({
				uri: process.env.DATABASE_URL
			})
		})
	});
}

export const db = createDb();
