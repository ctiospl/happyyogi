import type { Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
	// Add draft_source_code column to templates table
	// source_code = published version (used by frontend rendering)
	// draft_source_code = work-in-progress (used by admin preview)
	await db.schema
		.alterTable('templates')
		.addColumn('draft_source_code', 'text')
		.execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
	await db.schema
		.alterTable('templates')
		.dropColumn('draft_source_code')
		.execute();
}
