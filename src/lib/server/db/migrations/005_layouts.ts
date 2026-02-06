import type { Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
	// Create layouts table
	await db.schema
		.createTable('layouts')
		.addColumn('id', 'uuid', (col) =>
			col.primaryKey().defaultTo(db.fn('gen_random_uuid'))
		)
		.addColumn('tenant_id', 'uuid', (col) =>
			col.notNull().references('tenants.id').onDelete('cascade')
		)
		.addColumn('name', 'varchar(255)', (col) => col.notNull())
		.addColumn('slug', 'varchar(100)', (col) => col.notNull())
		.addColumn('is_default', 'boolean', (col) => col.notNull().defaultTo(false))
		.addColumn('regions', 'jsonb', (col) => col.notNull().defaultTo('{}'))
		.addColumn('status', 'varchar(20)', (col) => col.notNull().defaultTo('draft'))
		.addColumn('published_at', 'timestamptz')
		.addColumn('created_at', 'timestamptz', (col) =>
			col.notNull().defaultTo(db.fn('now'))
		)
		.addColumn('updated_at', 'timestamptz', (col) =>
			col.notNull().defaultTo(db.fn('now'))
		)
		.execute();

	// Unique slug per tenant
	await db.schema
		.createIndex('idx_layouts_tenant_slug')
		.on('layouts')
		.columns(['tenant_id', 'slug'])
		.unique()
		.execute();

	await db.schema
		.createIndex('idx_layouts_tenant_default')
		.on('layouts')
		.columns(['tenant_id', 'is_default'])
		.execute();

	// Add layout_id to pages (null = use tenant default)
	await db.schema
		.alterTable('pages')
		.addColumn('layout_id', 'uuid', (col) =>
			col.references('layouts.id').onDelete('set null')
		)
		.execute();

	// Add no_layout flag to pages (renders without any chrome)
	await db.schema
		.alterTable('pages')
		.addColumn('no_layout', 'boolean', (col) => col.defaultTo(false))
		.execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
	await db.schema.alterTable('pages').dropColumn('no_layout').execute();
	await db.schema.alterTable('pages').dropColumn('layout_id').execute();
	await db.schema.dropTable('layouts').execute();
}
