import type { Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
	// Create forms table
	await db.schema
		.createTable('forms')
		.addColumn('id', 'uuid', (col) =>
			col.primaryKey().defaultTo(db.fn('gen_random_uuid'))
		)
		.addColumn('tenant_id', 'uuid', (col) =>
			col.notNull().references('tenants.id').onDelete('cascade')
		)
		.addColumn('title', 'varchar(255)', (col) => col.notNull())
		.addColumn('slug', 'varchar(100)', (col) => col.notNull())
		.addColumn('type', 'varchar(20)', (col) => col.notNull().defaultTo('standalone'))
		.addColumn('fields', 'jsonb', (col) => col.notNull().defaultTo('[]'))
		.addColumn('settings', 'jsonb', (col) => col.notNull().defaultTo('{}'))
		.addColumn('conditional_rules', 'jsonb', (col) => col.notNull().defaultTo('[]'))
		.addColumn('status', 'varchar(20)', (col) => col.notNull().defaultTo('draft'))
		.addColumn('created_at', 'timestamptz', (col) =>
			col.notNull().defaultTo(db.fn('now'))
		)
		.addColumn('updated_at', 'timestamptz', (col) =>
			col.notNull().defaultTo(db.fn('now'))
		)
		.execute();

	// Unique slug per tenant
	await db.schema
		.createIndex('idx_forms_tenant_slug')
		.on('forms')
		.columns(['tenant_id', 'slug'])
		.unique()
		.execute();

	// Status filtering
	await db.schema
		.createIndex('idx_forms_tenant_status')
		.on('forms')
		.columns(['tenant_id', 'status'])
		.execute();

	// Create form_submissions table
	await db.schema
		.createTable('form_submissions')
		.addColumn('id', 'uuid', (col) =>
			col.primaryKey().defaultTo(db.fn('gen_random_uuid'))
		)
		.addColumn('tenant_id', 'uuid', (col) =>
			col.notNull().references('tenants.id').onDelete('cascade')
		)
		.addColumn('form_id', 'uuid', (col) =>
			col.notNull().references('forms.id').onDelete('cascade')
		)
		.addColumn('data', 'jsonb', (col) => col.notNull().defaultTo('{}'))
		.addColumn('metadata', 'jsonb', (col) => col.notNull().defaultTo('{}'))
		.addColumn('submitted_at', 'timestamptz', (col) =>
			col.notNull().defaultTo(db.fn('now'))
		)
		.execute();

	await db.schema
		.createIndex('idx_form_submissions_form')
		.on('form_submissions')
		.columns(['form_id'])
		.execute();

	await db.schema
		.createIndex('idx_form_submissions_tenant')
		.on('form_submissions')
		.columns(['tenant_id'])
		.execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
	await db.schema.dropTable('form_submissions').execute();
	await db.schema.dropTable('forms').execute();
}
