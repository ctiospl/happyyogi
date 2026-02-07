/**
 * VM Sandbox Executor
 *
 * Executes bundled SSR code in vm.createContext() with the shared Svelte runtime.
 * Restricted globals + timeout for security.
 */

import vm from 'node:vm';
import { bundleSharedRuntime } from './bundler';

export interface SandboxResult {
	html: string;
	head: string;
	css: string;
	error?: string;
}

interface SandboxOptions {
	timeout?: number; // ms, default 2000
}

/**
 * Render a bundled SSR component in a sandboxed vm context.
 *
 * @param ssrBundle - IIFE string from bundleSSR() that assigns globalThis.__component
 * @param props - Props to pass to the component's render() call
 * @param opts - Timeout and other options
 */
export async function renderInSandbox(
	ssrBundle: string,
	props: Record<string, unknown>,
	opts?: SandboxOptions
): Promise<SandboxResult> {
	const timeout = opts?.timeout ?? 2000;

	try {
		const sharedRuntime = await bundleSharedRuntime();

		// Build a sandbox context with safe globals only
		const sandbox: Record<string, unknown> = {
			// Standard JS globals needed for Svelte runtime
			Map,
			Set,
			WeakMap,
			WeakSet,
			Promise,
			Array,
			Object,
			JSON,
			Math,
			Date,
			String,
			Number,
			Boolean,
			RegExp,
			Error,
			TypeError,
			RangeError,
			Symbol,
			Uint8Array,
			Int32Array,
			Float64Array,
			ArrayBuffer,
			TextEncoder,
			TextDecoder,
			parseInt,
			parseFloat,
			isNaN,
			isFinite,
			encodeURIComponent,
			decodeURIComponent,
			undefined,
			NaN,
			Infinity,

			// globalThis reference (sandbox only)
			globalThis: null as unknown,

			// Placeholders for runtime + component
			__svelte: null,
			__component: null,
			__result: null,

			// Console stub (no-op in sandbox)
			console: {
				log: () => {},
				warn: () => {},
				error: () => {}
			},

			// Explicitly blocked
			process: undefined,
			require: undefined,
			fetch: undefined,
			setTimeout: undefined,
			setInterval: undefined,
			setImmediate: undefined,
			queueMicrotask: undefined
		};

		const context = vm.createContext(sandbox);
		// Set globalThis to point to the sandbox
		vm.runInContext('globalThis = this;', context);

		// 1. Inject shared runtime (defines globalThis.__svelte)
		vm.runInContext(sharedRuntime, context, { timeout });

		// 2. Inject component bundle (defines globalThis.__component)
		vm.runInContext(ssrBundle, context, { timeout });

		// 3. Render: call __svelte.render(__component, { props })
		const renderScript = `
			(function() {
				if (!__svelte || !__svelte.render) {
					__result = { error: 'Svelte runtime not loaded' };
					return;
				}
				if (!__component) {
					__result = { error: 'Component not loaded' };
					return;
				}
				try {
					var out = __svelte.render(__component, { props: ${JSON.stringify(props)} });
					__result = {
						html: out.body || '',
						head: out.head || '',
						css: ''
					};
				} catch(e) {
					__result = { error: e.message || String(e) };
				}
			})();
		`;
		vm.runInContext(renderScript, context, { timeout });

		const result = sandbox.__result as SandboxResult | { error: string } | null;

		if (!result) {
			return { html: '', head: '', css: '', error: 'No render result' };
		}

		if ('error' in result && result.error) {
			return { html: '', head: '', css: '', error: result.error };
		}

		return {
			html: (result as SandboxResult).html || '',
			head: (result as SandboxResult).head || '',
			css: (result as SandboxResult).css || '',
		};
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		return { html: '', head: '', css: '', error: `Sandbox error: ${message}` };
	}
}
