/**
 * One-off script: recompile all templates through the bundled SSR + client pipeline.
 * Supports template composition ($template/* imports) via topological sort.
 * Run with: npx tsx scripts/recompile-templates.ts
 */

import { Kysely, PostgresDialect } from 'kysely';
import pg from 'pg';
import type { Database } from '../src/lib/server/db/schema.js';
import { compileAndBundle, extractTemplateDependencies } from '../src/lib/server/templates/compiler.js';
import type { LookupSource } from '../src/lib/server/templates/compiler.js';

const { Pool } = pg;

/** Topological sort: templates with no deps first, then dependents */
function topologicalSort(templates: { slug: string; source_code: string }[]): string[] {
	const slugSet = new Set(templates.map(t => t.slug));
	const depsMap = new Map<string, string[]>();
	for (const t of templates) {
		const deps = extractTemplateDependencies(t.source_code).filter(d => slugSet.has(d));
		depsMap.set(t.slug, deps);
	}

	const sorted: string[] = [];
	const visited = new Set<string>();
	const visiting = new Set<string>();

	function visit(slug: string): void {
		if (visited.has(slug)) return;
		if (visiting.has(slug)) {
			console.error(`  CYCLE detected involving: ${slug}`);
			return;
		}
		visiting.add(slug);
		for (const dep of depsMap.get(slug) ?? []) {
			visit(dep);
		}
		visiting.delete(slug);
		visited.add(slug);
		sorted.push(slug);
	}

	for (const slug of slugSet) visit(slug);
	return sorted;
}

async function main() {
	const connectionString = process.env.DATABASE_URL;
	if (!connectionString) throw new Error('DATABASE_URL required');

	const db = new Kysely<Database>({
		dialect: new PostgresDialect({ pool: new Pool({ connectionString }) })
	});

	const templates = await db.selectFrom('templates').selectAll().execute();
	console.log(`Found ${templates.length} templates to recompile`);

	// Build slug → template map
	const bySlug = new Map(templates.map(t => [t.slug, t]));

	// Build lookupSource closure
	const lookupSource: LookupSource = async (slug: string) => {
		const t = bySlug.get(slug);
		return t?.source_code ?? null;
	};

	// Topological sort for correct compilation order
	const order = topologicalSort(
		templates.filter(t => t.source_code).map(t => ({ slug: t.slug, source_code: t.source_code }))
	);

	let success = 0;
	let failed = 0;

	for (const slug of order) {
		const t = bySlug.get(slug)!;
		if (!t.source_code) {
			console.log(`  SKIP ${t.slug} (no source_code)`);
			continue;
		}

		const schema = typeof t.schema === 'string' ? JSON.parse(t.schema) : t.schema;
		const deps = extractTemplateDependencies(t.source_code);
		const result = await compileAndBundle(t.source_code, schema, deps.length > 0 ? lookupSource : undefined);

		if (result.ssrBundle) {
			await db.updateTable('templates').set({
				compiled_js: result.ssrBundle,
				compiled_client_js: result.clientBundle ?? null,
				compiled_css: result.css ?? null,
				compile_error: null,
				updated_at: new Date()
			}).where('id', '=', t.id).execute();

			console.log(`  OK   ${t.slug} (ssr: ${(result.ssrBundle.length / 1024).toFixed(1)}KB, client: ${result.clientBundle ? (result.clientBundle.length / 1024).toFixed(1) + 'KB' : 'none'}, deps: [${deps.join(', ')}])`);
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
