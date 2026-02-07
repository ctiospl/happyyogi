/**
 * One-off script: recompile all templates through the bundled SSR + client pipeline.
 * Run with: npx tsx scripts/recompile-templates.ts
 */

import { Kysely, PostgresDialect } from 'kysely';
import pg from 'pg';
import type { Database } from '../src/lib/server/db/schema.js';
import { compileAndBundle } from '../src/lib/server/templates/compiler.js';

const { Pool } = pg;

async function main() {
	const connectionString = process.env.DATABASE_URL;
	if (!connectionString) throw new Error('DATABASE_URL required');

	const db = new Kysely<Database>({
		dialect: new PostgresDialect({ pool: new Pool({ connectionString }) })
	});

	const templates = await db.selectFrom('templates').selectAll().execute();
	console.log(`Found ${templates.length} templates to recompile`);

	let success = 0;
	let failed = 0;

	for (const t of templates) {
		if (!t.source_code) {
			console.log(`  SKIP ${t.slug} (no source_code)`);
			continue;
		}

		const schema = typeof t.schema === 'string' ? JSON.parse(t.schema) : t.schema;
		const result = await compileAndBundle(t.source_code, schema);

		if (result.ssrBundle) {
			await db.updateTable('templates').set({
				compiled_js: result.ssrBundle,
				compiled_client_js: result.clientBundle ?? null,
				compiled_css: result.css ?? null,
				compile_error: null,
				updated_at: new Date()
			}).where('id', '=', t.id).execute();

			console.log(`  OK   ${t.slug} (ssr: ${(result.ssrBundle.length / 1024).toFixed(1)}KB, client: ${result.clientBundle ? (result.clientBundle.length / 1024).toFixed(1) + 'KB' : 'none'})`);
			success++;
		} else {
			await db.updateTable('templates').set({
				compiled_js: null,
				compiled_client_js: null,
				compiled_css: null,
				compile_error: result.error ?? null,
				updated_at: new Date()
			}).where('id', '=', t.id).execute();

			console.log(`  FAIL ${t.slug}: ${result.error}`);
			failed++;
		}
	}

	console.log(`\nDone: ${success} ok, ${failed} failed`);
	await db.destroy();
}

main().catch((err) => { console.error(err); process.exit(1); });
