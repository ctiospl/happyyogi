import type { Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
	await db.schema
		.alterTable('templates')
		.addColumn('compiled_client_js', 'text')
		.execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
	await db.schema
		.alterTable('templates')
		.dropColumn('compiled_client_js')
		.execute();
}
