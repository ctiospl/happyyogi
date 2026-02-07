/**
 * Template CRUD Operations
 */

import { db } from '$lib/server/db';
import type { Template, NewTemplate, TemplateUpdate, TemplateSchema } from '$lib/server/db/schema';
import { compileAndBundle } from './compiler';
import { renderInSandbox } from './sandbox';
import { parse } from 'svelte/compiler';

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
	// Compile + bundle the source code if provided
	let compiledJs: string | null = null;
	let compiledClientJs: string | null = null;
	let compiledCss: string | null = null;
	let compileError: string | null = null;

	if (data.source_code) {
		const schema = typeof data.schema === 'string' ? JSON.parse(data.schema) : data.schema;
		const result = await compileAndBundle(data.source_code, schema);

		if (result.ssrBundle) {
			compiledJs = result.ssrBundle;
			compiledClientJs = result.clientBundle ?? null;
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
			compiled_client_js: compiledClientJs,
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
 * Update a template (core templates cannot be modified)
 */
export async function updateTemplate(
	id: string,
	data: Partial<Omit<TemplateUpdate, 'id' | 'created_at'>>
): Promise<Template | null> {
	const existing = await getTemplateById(id);
	if (existing?.is_core) throw new Error('Core templates cannot be modified');
	// If source code changed, recompile
	let compiledJs: string | null | undefined;
	let compiledClientJs: string | null | undefined;
	let compiledCss: string | null | undefined;
	let compileError: string | null | undefined;

	if (data.source_code !== undefined) {
		const schema = typeof data.schema === 'string' ? JSON.parse(data.schema) : data.schema;
		const result = await compileAndBundle(data.source_code, schema);

		if (result.ssrBundle) {
			compiledJs = result.ssrBundle;
			compiledClientJs = result.clientBundle ?? null;
			compiledCss = result.css ?? null;
			compileError = null;
		} else {
			compileError = result.error ?? null;
			compiledJs = null;
			compiledClientJs = null;
			compiledCss = null;
		}
	}

	const updateData: TemplateUpdate = {
		...data,
		updated_at: new Date()
	};

	if (compiledJs !== undefined) updateData.compiled_js = compiledJs;
	if (compiledClientJs !== undefined) updateData.compiled_client_js = compiledClientJs;
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
// DRAFT / PUBLISH
// ============================================

/**
 * Save draft source code (does not affect published version)
 */
export async function saveDraft(id: string, draftSource: string): Promise<Template | null> {
	const existing = await getTemplateById(id);
	if (existing?.is_core) throw new Error('Core templates cannot be modified');

	const result = await db
		.updateTable('templates')
		.set({ draft_source_code: draftSource, updated_at: new Date() })
		.where('id', '=', id)
		.returningAll()
		.executeTakeFirst();
	return result ?? null;
}

/**
 * Publish template: compile draft, copy to source_code, clear draft
 * Core templates cannot be published.
 */
export async function publishTemplate(id: string): Promise<Template | null> {
	const template = await getTemplateById(id);
	if (!template) return null;
	if (template.is_core) throw new Error('Core templates cannot be modified');

	const sourceToPublish = template.draft_source_code || template.source_code;
	const schema = typeof template.schema === 'string' ? JSON.parse(template.schema) : template.schema;

	const compiled = await compileAndBundle(sourceToPublish, schema);

	const result = await db
		.updateTable('templates')
		.set({
			source_code: sourceToPublish,
			draft_source_code: null,
			compiled_js: compiled.ssrBundle ?? null,
			compiled_client_js: compiled.clientBundle ?? null,
			compiled_css: compiled.css ?? null,
			compile_error: compiled.error ?? null,
			updated_at: new Date()
		})
		.where('id', '=', id)
		.returningAll()
		.executeTakeFirst();

	return result ?? null;
}

// ============================================
// DELETE
// ============================================

/**
 * Delete a template (core templates cannot be deleted)
 */
export async function deleteTemplate(id: string): Promise<void> {
	const existing = await getTemplateById(id);
	if (existing?.is_core) throw new Error('Core templates cannot be deleted');
	await db.deleteFrom('templates').where('id', '=', id).execute();
}

/**
 * Fork a template — create a tenant-owned copy of a (usually core) template
 */
export async function forkTemplate(templateId: string, tenantId: string): Promise<string> {
	const original = await getTemplateById(templateId);
	if (!original) throw new Error('Template not found');

	const slug = `${original.slug}-custom`;

	// Check if custom slug already exists for this tenant
	const existing = await db
		.selectFrom('templates')
		.select('id')
		.where('tenant_id', '=', tenantId)
		.where('slug', '=', slug)
		.executeTakeFirst();

	const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

	const forked = await db
		.insertInto('templates')
		.values({
			tenant_id: tenantId,
			slug: finalSlug,
			name: `${original.name} (Custom)`,
			description: original.description,
			category: original.category,
			source_code: original.source_code,
			compiled_js: original.compiled_js,
			compiled_css: original.compiled_css,
			compile_error: original.compile_error,
			schema: original.schema,
			sample_data: original.sample_data,
			updated_at: new Date()
		})
		.returning('id')
		.executeTakeFirstOrThrow();

	return forked.id;
}

// ============================================
// COMPILE
// ============================================

/**
 * Compile a template without saving (for preview).
 * Uses the same sandbox SSR pipeline as production rendering.
 */
export async function compileTemplatePreview(
	sourceCode: string,
	schema?: TemplateSchema,
	sampleData?: Record<string, unknown>
): Promise<{
	success: boolean;
	html?: string;
	css?: string;
	error?: string;
}> {
	const result = await compileAndBundle(sourceCode, schema);
	if (!result.ssrBundle) {
		return { success: false, error: result.error };
	}

	const rendered = await renderInSandbox(result.ssrBundle, sampleData ?? {});
	if (rendered.error) {
		return { success: false, error: rendered.error };
	}

	return {
		success: true,
		html: rendered.html,
		css: result.css || rendered.css
	};
}

// ============================================
// AST-BASED PREVIEW RENDERER
// ============================================

/* eslint-disable @typescript-eslint/no-explicit-any */
type Scope = Record<string, unknown>;

const VOID_ELEMENTS = new Set([
	'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'
]);

function escapeHtml(s: string): string {
	return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Evaluate an ESTree expression node against a data scope */
function evalExpr(node: any, scope: Scope): unknown {
	if (!node) return undefined;
	switch (node.type) {
		case 'Identifier':
			return scope[node.name];
		case 'Literal':
			return node.value;
		case 'MemberExpression': {
			const obj = evalExpr(node.object, scope) as any;
			if (obj == null) return undefined;
			if (node.computed) {
				const prop = evalExpr(node.property, scope);
				return obj[prop as string | number];
			}
			return obj[node.property.name];
		}
		case 'BinaryExpression': {
			const l = evalExpr(node.left, scope);
			const r = evalExpr(node.right, scope);
			switch (node.operator) {
				case '+': return (l as any) + (r as any);
				case '-': return (l as any) - (r as any);
				case '*': return (l as any) * (r as any);
				case '/': return (l as any) / (r as any);
				case '%': return (l as any) % (r as any);
				case '===': return l === r;
				case '!==': return l !== r;
				case '==': return l == r;
				case '!=': return l != r;
				case '>': return (l as any) > (r as any);
				case '<': return (l as any) < (r as any);
				case '>=': return (l as any) >= (r as any);
				case '<=': return (l as any) <= (r as any);
				default: return undefined;
			}
		}
		case 'LogicalExpression': {
			const left = evalExpr(node.left, scope);
			if (node.operator === '&&') return left ? evalExpr(node.right, scope) : left;
			if (node.operator === '||') return left ? left : evalExpr(node.right, scope);
			if (node.operator === '??') return left != null ? left : evalExpr(node.right, scope);
			return undefined;
		}
		case 'ConditionalExpression': {
			const test = evalExpr(node.test, scope);
			return test ? evalExpr(node.consequent, scope) : evalExpr(node.alternate, scope);
		}
		case 'UnaryExpression': {
			const arg = evalExpr(node.argument, scope);
			if (node.operator === '!') return !arg;
			if (node.operator === '-') return -(arg as number);
			if (node.operator === '+') return +(arg as number);
			if (node.operator === 'typeof') return typeof arg;
			return undefined;
		}
		case 'TemplateLiteral': {
			let result = '';
			for (let i = 0; i < node.quasis.length; i++) {
				result += node.quasis[i].value.cooked ?? node.quasis[i].value.raw;
				if (i < node.expressions.length) {
					const val = evalExpr(node.expressions[i], scope);
					result += val != null ? String(val) : '';
				}
			}
			return result;
		}
		case 'CallExpression': {
			// Support simple method calls like arr.length, obj.method()
			// For now, just return undefined for complex calls
			return undefined;
		}
		case 'ArrayExpression': {
			return node.elements.map((el: any) => evalExpr(el, scope));
		}
		case 'ObjectExpression': {
			const obj: Record<string, unknown> = {};
			for (const prop of node.properties) {
				const key = prop.key.name ?? prop.key.value;
				obj[key] = evalExpr(prop.value, scope);
			}
			return obj;
		}
		default:
			return undefined;
	}
}

/** Render attribute value (array of Text/ExpressionTag, or single ExpressionTag) */
function renderAttrValue(value: any, scope: Scope): string {
	if (value === true) return ''; // boolean attribute
	if (!value) return '';
	// Single ExpressionTag (not wrapped in array)
	if (value.type === 'ExpressionTag') {
		const val = evalExpr(value.expression, scope);
		return val != null ? String(val) : '';
	}
	// Array of Text and ExpressionTag nodes
	if (Array.isArray(value)) {
		return value
			.map((part: any) => {
				if (part.type === 'Text') return part.data;
				if (part.type === 'ExpressionTag') {
					const val = evalExpr(part.expression, scope);
					return val != null ? String(val) : '';
				}
				return '';
			})
			.join('');
	}
	return '';
}

/** Destructure an EachBlock context pattern into scope bindings */
function destructureContext(pattern: any, value: unknown, scope: Scope): Scope {
	const child = { ...scope };
	if (pattern.type === 'Identifier') {
		child[pattern.name] = value;
	} else if (pattern.type === 'ObjectPattern') {
		const obj = value as Record<string, unknown>;
		for (const prop of pattern.properties) {
			child[prop.value?.name ?? prop.key.name] = obj?.[prop.key.name];
		}
	}
	return child;
}

/** Walk AST fragment nodes and produce HTML */
function renderNodes(nodes: any[], scope: Scope): string {
	let out = '';
	for (const node of nodes) {
		out += renderNode(node, scope);
	}
	return out;
}

function renderNode(node: any, scope: Scope): string {
	switch (node.type) {
		case 'Text':
			return node.data;

		case 'Comment':
			return '';

		case 'ExpressionTag': {
			const val = evalExpr(node.expression, scope);
			if (val == null) return '';
			return escapeHtml(String(val));
		}

		case 'HtmlTag': {
			// {@html expr} — raw output, no escaping
			const val = evalExpr(node.expression, scope);
			return val != null ? String(val) : '';
		}

		case 'RegularElement':
		case 'SvelteElement': {
			const tag = node.name;
			let attrs = '';
			for (const attr of node.attributes ?? []) {
				if (attr.type === 'Attribute') {
					const val = renderAttrValue(attr.value, scope);
					attrs += ` ${attr.name}="${escapeHtml(val)}"`;
				} else if (attr.type === 'SpreadAttribute') {
					// Skip spreads in preview
				} else if (attr.type === 'ClassDirective') {
					// class:name={expr} — skip, the base class attr handles most cases
				} else if (attr.type === 'StyleDirective') {
					// style:prop={expr} — skip for preview
				}
			}
			if (VOID_ELEMENTS.has(tag)) {
				return `<${tag}${attrs} />`;
			}
			const children = renderNodes(node.fragment?.nodes ?? [], scope);
			return `<${tag}${attrs}>${children}</${tag}>`;
		}

		case 'IfBlock': {
			const test = evalExpr(node.test, scope);
			if (test) {
				return renderNodes(node.consequent?.nodes ?? [], scope);
			}
			if (node.alternate) {
				// alternate can be a Fragment or another IfBlock (elseif)
				if (node.alternate.type === 'Fragment') {
					return renderNodes(node.alternate.nodes ?? [], scope);
				}
				return renderNode(node.alternate, scope);
			}
			return '';
		}

		case 'EachBlock': {
			const arr = evalExpr(node.expression, scope);
			if (!Array.isArray(arr)) return '';
			let out = '';
			for (let i = 0; i < arr.length; i++) {
				let childScope = destructureContext(node.context, arr[i], scope);
				if (node.index) childScope[node.index] = i;
				out += renderNodes(node.body?.nodes ?? [], childScope);
			}
			return out;
		}

		case 'Fragment':
			return renderNodes(node.nodes ?? [], scope);

		default:
			// AwaitBlock, KeyBlock, etc. — skip for preview
			return '';
	}
}

/**
 * Extract HTML markup from Svelte source using AST-based rendering.
 * Parses template with svelte/compiler, walks the AST, and evaluates
 * expressions against sample data for accurate preview output.
 */
export function extractHtmlMarkup(source: string, data: Record<string, unknown>): string {
	try {
		const ast = parse(source, { modern: true });

		// Build initial scope from script $props() + script-level const declarations
		const scope: Scope = { ...data };

		// Extract const declarations from script (e.g. iconMap)
		const instance = (ast as any).instance;
		if (instance) {
			extractScriptConstants(instance, scope);
		}

		return renderNodes(ast.fragment?.nodes ?? [], scope).trim();
	} catch {
		// Fallback: strip tags naively if parse fails
		return source
			.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
			.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
			.trim();
	}
}

/** Extract top-level const declarations from script AST into scope */
function extractScriptConstants(jsNode: any, scope: Scope): void {
	if (!jsNode?.content?.body) return;
	for (const stmt of jsNode.content.body) {
		if (stmt.type === 'VariableDeclaration' && stmt.kind === 'const') {
			for (const decl of stmt.declarations) {
				if (decl.id?.type === 'Identifier' && decl.init) {
					// Only evaluate object literals (like iconMap)
					const val = evalExpr(decl.init, scope);
					if (val !== undefined) {
						scope[decl.id.name] = val;
					}
				}
			}
		}
	}
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/**
 * Get multiple templates by IDs in a single query
 */
export async function getTemplatesByIds(ids: string[]): Promise<Template[]> {
	if (ids.length === 0) return [];
	return db
		.selectFrom('templates')
		.selectAll()
		.where('id', 'in', ids)
		.execute();
}

/**
 * Extract CSS from Svelte style block
 */
export function extractStyleBlock(source: string): string {
	const styleMatch = source.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
	return styleMatch ? styleMatch[1].trim() : '';
}
