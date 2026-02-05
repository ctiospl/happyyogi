import type { Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
	// Templates table - stores Svelte template source + compiled output
	await db.schema
		.createTable('templates')
		.addColumn('id', 'uuid', (col) =>
			col.primaryKey().defaultTo(db.fn('gen_random_uuid'))
		)
		.addColumn('tenant_id', 'uuid', (col) =>
			col.references('tenants.id').onDelete('cascade')
		)
		.addColumn('slug', 'varchar(100)', (col) => col.notNull())
		.addColumn('name', 'varchar(255)', (col) => col.notNull())
		.addColumn('description', 'text')
		.addColumn('category', 'varchar(50)', (col) => col.defaultTo('custom'))

		// Source code
		.addColumn('source_code', 'text', (col) => col.notNull())

		// Compiled output (populated on save)
		.addColumn('compiled_js', 'text')
		.addColumn('compiled_css', 'text')
		.addColumn('compile_error', 'text')

		// Schema defines editable props
		.addColumn('schema', 'jsonb', (col) => col.notNull().defaultTo('{"fields": []}'))

		// Sample data for preview
		.addColumn('sample_data', 'jsonb', (col) => col.defaultTo('{}'))

		// Metadata
		.addColumn('is_core', 'boolean', (col) => col.defaultTo(false))
		.addColumn('created_at', 'timestamptz', (col) =>
			col.notNull().defaultTo(db.fn('now'))
		)
		.addColumn('updated_at', 'timestamptz', (col) =>
			col.notNull().defaultTo(db.fn('now'))
		)
		.execute();

	// Unique constraint: slug unique per tenant (or globally for core templates)
	await db.schema
		.createIndex('idx_templates_tenant_slug')
		.on('templates')
		.columns(['tenant_id', 'slug'])
		.unique()
		.execute();

	await db.schema
		.createIndex('idx_templates_category')
		.on('templates')
		.column('category')
		.execute();

	await db.schema
		.createIndex('idx_templates_is_core')
		.on('templates')
		.column('is_core')
		.execute();

	// Update pages table to reference templates
	// Add template_id column (nullable, for structured pages)
	await db.schema
		.alterTable('pages')
		.addColumn('template_id', 'uuid', (col) =>
			col.references('templates.id').onDelete('set null')
		)
		.execute();

	// Add blocks column for structured content (array of {template_id, props})
	await db.schema
		.alterTable('pages')
		.addColumn('blocks', 'jsonb', (col) => col.defaultTo('[]'))
		.execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
	await db.schema.alterTable('pages').dropColumn('blocks').execute();
	await db.schema.alterTable('pages').dropColumn('template_id').execute();
	await db.schema.dropTable('templates').execute();
}
