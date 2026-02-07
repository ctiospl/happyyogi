/**
 * esbuild bundler for Svelte SSR + client templates
 *
 * Server-side bundles:
 * 1. Shared Svelte runtime (svelte/server + svelte/internal/server) → cached IIFE
 * 2. Per-template SSR code → IIFE referencing shared runtime via globalThis.__svelte
 *
 * Client-side bundles:
 * 3. Shared Svelte client runtime (svelte + svelte/internal/client) → cached IIFE
 * 4. Per-template client code → IIFE referencing shared client runtime via globalThis.__svelte_client
 */

import * as esbuild from 'esbuild';
import sveltePlugin from 'esbuild-svelte';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { writeFileSync, unlinkSync, mkdirSync } from 'fs';
import { tmpdir } from 'os';
import { randomUUID } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = resolve(__dirname, '../../../../');

// Cached shared runtime (bundled once at startup)
let sharedRuntimeCache: string | null = null;

/**
 * Bundle svelte/server into a single IIFE that exposes globalThis.__svelte
 * Contains render(), escape_html(), and all internal/server helpers.
 * ~50KB, loaded once per process.
 */
export async function bundleSharedRuntime(): Promise<string> {
	if (sharedRuntimeCache) return sharedRuntimeCache;

	// Create a temp entry file that re-exports svelte/server
	const tmpDir = resolve(tmpdir(), 'happyyogi-bundler');
	mkdirSync(tmpDir, { recursive: true });
	const entryPath = resolve(tmpDir, `runtime-entry-${randomUUID()}.js`);
	writeFileSync(
		entryPath,
		`export { render } from 'svelte/server';
export * from 'svelte/internal/server';
`
	);

	try {
		const result = await esbuild.build({
			entryPoints: [entryPath],
			bundle: true,
			write: false,
			format: 'iife',
			globalName: '__svelte_runtime',
			platform: 'node',
			target: 'node18',
			conditions: ['svelte', 'node'],
			mainFields: ['svelte', 'module', 'main'],
			// Resolve node_modules from project root
			absWorkingDir: PROJECT_ROOT,
			nodePaths: [resolve(PROJECT_ROOT, 'node_modules')]
		});

		const code = result.outputFiles![0].text;
		// Expose as globalThis.__svelte
		sharedRuntimeCache = `${code}\nglobalThis.__svelte = __svelte_runtime;\n`;
		return sharedRuntimeCache;
	} finally {
		try {
			unlinkSync(entryPath);
		} catch {
			// ignore cleanup errors
		}
	}
}

/**
 * Bundle compiled Svelte SSR component JS into a self-contained IIFE.
 * Marks svelte/internal/server as external (provided by shared runtime).
 * Resolves $lib/* paths via custom plugin.
 */
export async function bundleSSR(compiledJs: string): Promise<string> {
	const tmpDir = resolve(tmpdir(), 'happyyogi-bundler');
	mkdirSync(tmpDir, { recursive: true });
	const entryPath = resolve(tmpDir, `ssr-${randomUUID()}.js`);
	writeFileSync(entryPath, compiledJs);

	try {
		const result = await esbuild.build({
			entryPoints: [entryPath],
			bundle: true,
			write: false,
			format: 'iife',
			globalName: '__component_module',
			platform: 'node',
			target: 'node18',
			conditions: ['svelte', 'node'],
			mainFields: ['svelte', 'module', 'main'],
			absWorkingDir: PROJECT_ROOT,
			nodePaths: [resolve(PROJECT_ROOT, 'node_modules')],
			plugins: [
				resolveLibPlugin(),
				svelteServerPlugin(),
				externalSvelteInternalPlugin()
			]
		});

		const code = result.outputFiles![0].text;
		return `${code}\nglobalThis.__component = __component_module.default;\n`;
	} finally {
		try {
			unlinkSync(entryPath);
		} catch {
			// ignore
		}
	}
}

/**
 * Resolve $lib/ paths to absolute project paths
 */
function resolveLibPlugin(): esbuild.Plugin {
	return {
		name: 'resolve-lib',
		setup(build) {
			build.onResolve({ filter: /^\$lib\// }, (args) => ({
				path: args.path.replace(/^\$lib\//, resolve(PROJECT_ROOT, 'src/lib') + '/')
			}));
		}
	};
}

/**
 * Compile imported .svelte files for server-side rendering
 */
function svelteServerPlugin(): esbuild.Plugin {
	return sveltePlugin({
		compilerOptions: {
			generate: 'server',
			dev: false,
			css: 'injected',
			runes: true
		}
	}) as unknown as esbuild.Plugin;
}

/**
 * Map svelte/internal/server imports to globalThis.__svelte
 * so the per-template bundle stays small (~2-5KB).
 */
function externalSvelteInternalPlugin(): esbuild.Plugin {
	return {
		name: 'external-svelte-internal',
		setup(build) {
			// Intercept svelte/internal/* imports — inject from __svelte global
			build.onResolve({ filter: /^svelte\/internal/ }, (args) => ({
				path: args.path,
				namespace: 'svelte-internal'
			}));
			build.onLoad({ filter: /.*/, namespace: 'svelte-internal' }, () => ({
				contents: `module.exports = globalThis.__svelte;`,
				loader: 'js'
			}));

			// Also handle bare 'svelte' and 'svelte/server' imports
			build.onResolve({ filter: /^svelte(\/server)?$/ }, (args) => ({
				path: args.path,
				namespace: 'svelte-internal'
			}));
		}
	};
}

// ---------------------------------------------------------------------------
// Client-side bundling
// ---------------------------------------------------------------------------

// Cached shared client runtime (bundled once at startup)
let sharedClientRuntimeCache: string | null = null;

/**
 * Bundle svelte + svelte/internal/client into a single IIFE on window.__svelte_client.
 * Contains mount(), hydrate(), unmount() and all client helpers.
 * Served to browsers, loaded once per page.
 */
export async function buildSharedClientRuntime(): Promise<string> {
	if (sharedClientRuntimeCache) return sharedClientRuntimeCache;

	const tmpDir = resolve(tmpdir(), 'happyyogi-bundler');
	mkdirSync(tmpDir, { recursive: true });
	const entryPath = resolve(tmpDir, `client-runtime-entry-${randomUUID()}.js`);
	writeFileSync(
		entryPath,
		`export { mount, hydrate, unmount } from 'svelte';
export * from 'svelte/internal/client';
`
	);

	try {
		const result = await esbuild.build({
			entryPoints: [entryPath],
			bundle: true,
			write: false,
			format: 'iife',
			globalName: '__svelte_client',
			platform: 'browser',
			target: 'es2020',
			minify: true,
			absWorkingDir: PROJECT_ROOT,
			nodePaths: [resolve(PROJECT_ROOT, 'node_modules')]
		});

		sharedClientRuntimeCache = result.outputFiles![0].text;
		return sharedClientRuntimeCache;
	} finally {
		try {
			unlinkSync(entryPath);
		} catch {
			// ignore cleanup errors
		}
	}
}

/**
 * Bundle compiled Svelte client component JS into a browser IIFE.
 * Svelte internals are externalized to window.__svelte_client.
 * Resolves $lib/* paths via custom plugin.
 */
export async function bundleClientTemplate(compiledClientJs: string): Promise<string> {
	const tmpDir = resolve(tmpdir(), 'happyyogi-bundler');
	mkdirSync(tmpDir, { recursive: true });
	const entryPath = resolve(tmpDir, `client-${randomUUID()}.js`);
	writeFileSync(entryPath, compiledClientJs);

	try {
		const result = await esbuild.build({
			entryPoints: [entryPath],
			bundle: true,
			write: false,
			format: 'iife',
			globalName: '__component_client',
			platform: 'browser',
			target: 'es2020',
			minify: true,
			absWorkingDir: PROJECT_ROOT,
			nodePaths: [resolve(PROJECT_ROOT, 'node_modules')],
			plugins: [
				resolveLibPlugin(),
				externalSvelteClientPlugin()
			]
		});

		return result.outputFiles![0].text;
	} finally {
		try {
			unlinkSync(entryPath);
		} catch {
			// ignore
		}
	}
}

/**
 * Map svelte client imports to globalThis.__svelte_client
 * so the per-template bundle stays small.
 */
function externalSvelteClientPlugin(): esbuild.Plugin {
	return {
		name: 'external-svelte-client',
		setup(build) {
			// Externalize svelte/internal/client → window.__svelte_client
			build.onResolve({ filter: /^svelte\/internal\/client/ }, () => ({
				path: 'svelte/internal/client',
				namespace: 'svelte-client-external'
			}));
			build.onLoad({ filter: /.*/, namespace: 'svelte-client-external' }, () => ({
				contents: 'module.exports = globalThis.__svelte_client;',
				loader: 'js'
			}));

			// Externalize bare svelte → window.__svelte_client (mount, hydrate, unmount)
			build.onResolve({ filter: /^svelte$/ }, () => ({
				path: 'svelte',
				namespace: 'svelte-client-external'
			}));

			// Externalize svelte/internal/disclose-version
			build.onResolve({ filter: /^svelte\/internal\/disclose-version/ }, () => ({
				path: 'svelte/internal/disclose-version',
				namespace: 'svelte-client-external'
			}));
		}
	};
}

/** Clear cached shared runtime (e.g. after svelte package update) */
export function clearRuntimeCache(): void {
	sharedRuntimeCache = null;
	sharedClientRuntimeCache = null;
}
