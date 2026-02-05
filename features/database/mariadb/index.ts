import { Kysely, MysqlDialect } from 'kysely';
import { createPool } from 'mysql2';
import type { Database } from '../_shared/types.js';

// MariaDB uses the MySQL dialect in Kysely
// Connection string uses mysql:// protocol
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
