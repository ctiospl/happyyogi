/**
 * Svelte Template Compiler Service
 *
 * Compiles Svelte component source code with security validation.
 * Templates are compiled server-side and stored in DB.
 */

import { compile } from 'svelte/compiler';
import type { CompileResult, Warning } from 'svelte/compiler';

// ============================================
// TYPES
// ============================================

export interface TemplateCompileResult {
	success: boolean;
	js?: string;
	css?: string;
	warnings?: Warning[];
	error?: string;
}

export interface ValidationResult {
	valid: boolean;
	errors: string[];
	warnings: string[];
}

// ============================================
// SECURITY: IMPORT WHITELIST
// ============================================

/**
 * Allowed imports for templates.
 * Templates can only import from this whitelist.
 */
const ALLOWED_IMPORT_PATTERNS = [
	// UI Components (relative to $lib)
	/^\$lib\/components\/ui\//,
	/^\$lib\/components\/blocks\//,

	// Utilities
	/^\$lib\/utils\//,

	// Icons
	/^lucide-svelte/,

	// Svelte internals (needed for compiled output)
	/^svelte/
];

/**
 * Forbidden patterns in source code.
 * These are security risks and must be blocked.
 */
const FORBIDDEN_PATTERNS = [
	// Dynamic code execution
	/\beval\s*\(/,
	/\bnew\s+Function\s*\(/,
	/\bFunction\s*\(/,

	// Direct DOM/window access (should use Svelte APIs)
	/\bdocument\s*\./,
	/\bwindow\s*\./,
	/\bglobalThis\s*\./,

	// Network requests (data should come from props)
	/\bfetch\s*\(/,
	/\bXMLHttpRequest/,

	// Node.js APIs
	/\brequire\s*\(/,
	/\bprocess\s*\./,
	/\b__dirname\b/,
	/\b__filename\b/,

	// Import meta (except for Vite-safe ones)
	/import\.meta\.env\./,

	// Raw HTML injection with dynamic content
	// Allowed: {@html "<p>static</p>"}
	// Forbidden: {@html variable}
	/\{@html\s+[^"'`]/
];

// ============================================
// VALIDATION
// ============================================

/**
 * Extract all imports from Svelte source code
 */
function extractImports(source: string): string[] {
	const importRegex = /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)\s+from\s+)?['"]([^'"]+)['"]/g;
	const imports: string[] = [];
	let match;

	while ((match = importRegex.exec(source)) !== null) {
		imports.push(match[1]);
	}

	return imports;
}

/**
 * Check if an import path is allowed
 */
function isImportAllowed(importPath: string): boolean {
	return ALLOWED_IMPORT_PATTERNS.some((pattern) => pattern.test(importPath));
}

/**
 * Validate template source code for security issues
 */
export function validateTemplate(source: string): ValidationResult {
	const errors: string[] = [];
	const warnings: string[] = [];

	// Check for forbidden patterns
	for (const pattern of FORBIDDEN_PATTERNS) {
		if (pattern.test(source)) {
			errors.push(`Forbidden pattern detected: ${pattern.toString()}`);
		}
	}

	// Check imports against whitelist
	const imports = extractImports(source);
	for (const importPath of imports) {
		if (!isImportAllowed(importPath)) {
			errors.push(`Import not allowed: "${importPath}". Only UI components, utilities, and icons are permitted.`);
		}
	}

	// Warn about potential issues
	if (source.includes('{@html')) {
		warnings.push('Template uses {@html} - ensure content is sanitized');
	}

	if (source.includes('on:click') || source.includes('onclick')) {
		warnings.push('Template has click handlers - these will only work after hydration');
	}

	return {
		valid: errors.length === 0,
		errors,
		warnings
	};
}

// ============================================
// COMPILATION
// ============================================

/**
 * Compile a Svelte template to JavaScript and CSS
 */
export async function compileTemplate(
	source: string,
	options: {
		filename?: string;
		name?: string;
	} = {}
): Promise<TemplateCompileResult> {
	// Validate first
	const validation = validateTemplate(source);
	if (!validation.valid) {
		return {
			success: false,
			error: validation.errors.join('\n')
		};
	}

	try {
		// Compile for server-side rendering
		const result: CompileResult = compile(source, {
			filename: options.filename || 'Template.svelte',
			name: options.name || 'Template',
			generate: 'server',
			dev: false,
			css: 'injected',
			runes: true
		});

		// Also compile client version for hydration (optional, for future use)
		// const clientResult = compile(source, {
		//   ...options,
		//   generate: 'client'
		// });

		return {
			success: true,
			js: result.js.code,
			css: result.css?.code || '',
			warnings: result.warnings
		};
	} catch (err) {
		return {
			success: false,
			error: err instanceof Error ? err.message : 'Compilation failed'
		};
	}
}

/**
 * Compile for both server and client
 */
export async function compileTemplateDual(
	source: string,
	options: {
		filename?: string;
		name?: string;
	} = {}
): Promise<{
	server: TemplateCompileResult;
	client: TemplateCompileResult;
}> {
	const validation = validateTemplate(source);
	if (!validation.valid) {
		const errorResult: TemplateCompileResult = {
			success: false,
			error: validation.errors.join('\n')
		};
		return { server: errorResult, client: errorResult };
	}

	const baseOptions = {
		filename: options.filename || 'Template.svelte',
		name: options.name || 'Template',
		dev: false,
		css: 'injected' as const,
		runes: true
	};

	try {
		const serverResult = compile(source, { ...baseOptions, generate: 'server' });
		const clientResult = compile(source, { ...baseOptions, generate: 'client' });

		return {
			server: {
				success: true,
				js: serverResult.js.code,
				css: serverResult.css?.code || '',
				warnings: serverResult.warnings
			},
			client: {
				success: true,
				js: clientResult.js.code,
				css: clientResult.css?.code || '',
				warnings: clientResult.warnings
			}
		};
	} catch (err) {
		const errorResult: TemplateCompileResult = {
			success: false,
			error: err instanceof Error ? err.message : 'Compilation failed'
		};
		return { server: errorResult, client: errorResult };
	}
}

// ============================================
// TEMPLATE PREPROCESSING
// ============================================

/**
 * Wrap raw template content in a Svelte component structure
 * if it doesn't already have one.
 */
export function normalizeTemplate(source: string, schema?: { fields: { key: string }[] }): string {
	// If source already has a script tag, return as-is
	if (source.includes('<script')) {
		return source;
	}

	// Generate props from schema
	const props = schema?.fields.map((f) => f.key) || [];
	const propsDeclaration = props.length > 0 ? `let { ${props.join(', ')} } = $props();` : '';

	// Wrap in component structure
	return `<script>
${propsDeclaration}
</script>

${source}`;
}
