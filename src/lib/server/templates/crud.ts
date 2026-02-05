/**
 * Template CRUD Operations
 */

import { db } from '$lib/server/db';
import type { Template, NewTemplate, TemplateUpdate, TemplateSchema } from '$lib/server/db/schema';
import { compileTemplate } from './compiler';

// ============================================
// READ
// ============================================

/**
 * Get all templates for a tenant (or core templates if tenantId is null)
 */
export async function getTemplates(tenantId?: string | null): Promise<Template[]> {
	const query = db
		.selectFrom('templates')
		.selectAll()
		.orderBy('name', 'asc');

	if (tenantId) {
		// Get tenant-specific + core templates
		return query
			.where((eb) =>
				eb.or([eb('tenant_id', '=', tenantId), eb('tenant_id', 'is', null)])
			)
			.execute();
	}

	// Just core templates
	return query.where('tenant_id', 'is', null).execute();
}

/**
 * Get templates for a specific tenant only (not including core)
 */
export async function getTenantTemplates(tenantId: string): Promise<Template[]> {
	return db
		.selectFrom('templates')
		.selectAll()
		.where('tenant_id', '=', tenantId)
		.orderBy('name', 'asc')
		.execute();
}

/**
 * Get a template by ID
 */
export async function getTemplateById(id: string): Promise<Template | null> {
	const result = await db
		.selectFrom('templates')
		.selectAll()
		.where('id', '=', id)
		.executeTakeFirst();

	return result ?? null;
}

/**
 * Get a template by slug (within tenant scope)
 */
export async function getTemplateBySlug(
	slug: string,
	tenantId?: string | null
): Promise<Template | null> {
	const query = db
		.selectFrom('templates')
		.selectAll()
		.where('slug', '=', slug);

	if (tenantId) {
		const result = await query
			.where((eb) =>
				eb.or([eb('tenant_id', '=', tenantId), eb('tenant_id', 'is', null)])
			)
			.executeTakeFirst();
		return result ?? null;
	}

	const result = await query.where('tenant_id', 'is', null).executeTakeFirst();
	return result ?? null;
}

// ============================================
// CREATE
// ============================================

/**
 * Create a new template
 */
export async function createTemplate(
	data: Omit<NewTemplate, 'id' | 'created_at'>
): Promise<Template> {
	// Compile the source code if provided
	let compiledJs: string | null = null;
	let compiledCss: string | null = null;
	let compileError: string | null = null;

	if (data.source_code) {
		const result = await compileTemplate(data.source_code, {
			filename: `${data.slug}.svelte`,
			name: data.name.replace(/[^a-zA-Z0-9]/g, '')
		});

		if (result.success) {
			compiledJs = result.js ?? null;
			compiledCss = result.css ?? null;
		} else {
			compileError = result.error ?? null;
		}
	}

	const template = await db
		.insertInto('templates')
		.values({
			tenant_id: data.tenant_id,
			slug: data.slug,
			name: data.name,
			description: data.description ?? null,
			category: data.category,
			source_code: data.source_code,
			compiled_js: compiledJs,
			compiled_css: compiledCss,
			compile_error: compileError,
			schema: data.schema ?? { fields: [] },
			sample_data: data.sample_data ?? {},
			updated_at: new Date()
		})
		.returningAll()
		.executeTakeFirstOrThrow();

	return template;
}

// ============================================
// UPDATE
// ============================================

/**
 * Update a template
 */
export async function updateTemplate(
	id: string,
	data: Partial<Omit<TemplateUpdate, 'id' | 'created_at'>>
): Promise<Template | null> {
	// If source code changed, recompile
	let compiledJs: string | null | undefined;
	let compiledCss: string | null | undefined;
	let compileError: string | null | undefined;

	if (data.source_code !== undefined) {
		const result = await compileTemplate(data.source_code, {
			filename: `template-${id}.svelte`,
			name: 'Template'
		});

		if (result.success) {
			compiledJs = result.js ?? null;
			compiledCss = result.css ?? null;
			compileError = null;
		} else {
			compileError = result.error ?? null;
			compiledJs = null;
			compiledCss = null;
		}
	}

	const updateData: TemplateUpdate = {
		...data,
		updated_at: new Date()
	};

	if (compiledJs !== undefined) updateData.compiled_js = compiledJs;
	if (compiledCss !== undefined) updateData.compiled_css = compiledCss;
	if (compileError !== undefined) updateData.compile_error = compileError;

	const result = await db
		.updateTable('templates')
		.set(updateData)
		.where('id', '=', id)
		.returningAll()
		.executeTakeFirst();

	return result ?? null;
}

// ============================================
// DELETE
// ============================================

/**
 * Delete a template
 */
export async function deleteTemplate(id: string): Promise<void> {
	await db.deleteFrom('templates').where('id', '=', id).execute();
}

// ============================================
// COMPILE
// ============================================

/**
 * Compile a template without saving (for preview)
 *
 * For Phase 1: We validate the template and extract static HTML for preview.
 * This provides visual feedback without needing full SSR execution.
 */
export async function compileTemplatePreview(
	sourceCode: string,
	_schema?: TemplateSchema,
	sampleData?: Record<string, unknown>
): Promise<{
	success: boolean;
	html?: string;
	css?: string;
	error?: string;
}> {
	// Validate the template compiles
	const result = await compileTemplate(sourceCode, {
		filename: 'Preview.svelte',
		name: 'Preview'
	});

	if (!result.success) {
		return {
			success: false,
			error: result.error
		};
	}

	// Extract HTML markup for preview (strip script/style tags)
	const html = extractHtmlMarkup(sourceCode, sampleData ?? {});

	// Extract CSS from style block
	const css = extractStyleBlock(sourceCode);

	return {
		success: true,
		html,
		css
	};
}

/**
 * Extract HTML markup from Svelte source, interpolating sample data
 */
function extractHtmlMarkup(source: string, data: Record<string, unknown>): string {
	// Remove script tags
	let html = source.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');

	// Remove style tags (CSS handled separately)
	html = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

	// Simple interpolation: replace {variableName} with data values
	html = html.replace(/\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g, (_match, varName) => {
		if (varName in data) {
			const value = data[varName];
			if (typeof value === 'string' || typeof value === 'number') {
				return String(value);
			}
		}
		// Return placeholder for unresolved variables
		return `[${varName}]`;
	});

	// Remove Svelte control flow blocks for preview (show content)
	html = html.replace(/\{#if[^}]*\}/g, '');
	html = html.replace(/\{:else[^}]*\}/g, '');
	html = html.replace(/\{\/if\}/g, '');
	html = html.replace(/\{#each[^}]*\}/g, '');
	html = html.replace(/\{\/each\}/g, '');
	html = html.replace(/\{@html[^}]*\}/g, '');

	return html.trim();
}

/**
 * Extract CSS from Svelte style block
 */
function extractStyleBlock(source: string): string {
	const styleMatch = source.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
	return styleMatch ? styleMatch[1].trim() : '';
}
