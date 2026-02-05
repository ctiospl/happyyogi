import { Kysely, SqliteDialect } from 'kysely';
import Database from 'better-sqlite3';
import type { Database as DbType } from '../_shared/types.js';

export function createDb(): Kysely<DbType> {
	return new Kysely<DbType>({
		dialect: new SqliteDialect({
			database: new Database(process.env.DATABASE_PATH || './data/app.db')
		})
	});
}

export const db = createDb();
