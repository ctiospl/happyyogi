import type { Kysely } from 'kysely';
import { sql } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
	await db.schema
		.alterTable('templates')
		.addColumn('dependencies', 'jsonb', (col) => col.defaultTo('[]'))
		.execute();

	// GIN index for @> containment queries (find dependents of a slug)
	await sql`CREATE INDEX idx_templates_dependencies ON templates USING GIN (dependencies)`.execute(db);

	// Ensure dependencies is always a JSON array
	await sql`ALTER TABLE templates ADD CONSTRAINT dependencies_is_array CHECK (jsonb_typeof(dependencies) = 'array')`.execute(db);
}

export async function down(db: Kysely<unknown>): Promise<void> {
	await sql`ALTER TABLE templates DROP CONSTRAINT IF EXISTS dependencies_is_array`.execute(db);
	await sql`DROP INDEX IF EXISTS idx_templates_dependencies`.execute(db);

	await db.schema
		.alterTable('templates')
		.dropColumn('dependencies')
		.execute();
}
