<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type * as Monaco from 'monaco-editor';

	interface TemplateListItem {
		slug: string;
		name: string;
		category: string;
		schema: { fields: { key: string }[] };
	}

	interface Props {
		value?: string;
		language?: string;
		theme?: string;
		readonly?: boolean;
		onchange?: (value: string) => void;
		class?: string;
	}

	let {
		value = '',
		language = 'html',
		theme = 'vs-dark',
		readonly = false,
		onchange,
		class: className = ''
	}: Props = $props();

	let container: HTMLDivElement;
	let editor: Monaco.editor.IStandaloneCodeEditor | null = null;
	let monaco: typeof Monaco | null = null;

	// Track external value changes
	let lastExternalValue = value;

	// Cached template list for autocomplete
	let templateListCache: TemplateListItem[] | null = null;

	async function fetchTemplateList(): Promise<TemplateListItem[]> {
		if (templateListCache) return templateListCache;
		try {
			const res = await fetch('/api/templates/list');
			if (res.ok) {
				templateListCache = await res.json();
				return templateListCache!;
			}
		} catch {
			// Autocomplete is non-critical
		}
		return [];
	}

	/** Convert slug to PascalCase component name: testimonial-card → TestimonialCard */
	function slugToComponentName(slug: string): string {
		return slug
			.split('-')
			.map((s) => s.charAt(0).toUpperCase() + s.slice(1))
			.join('');
	}

	onMount(async () => {
		// Load Monaco from CDN
		// @ts-expect-error - Monaco CDN global
		if (!window.monaco) {
			await loadMonacoFromCDN();
		}

		// @ts-expect-error - Monaco CDN global
		monaco = window.monaco;

		if (!monaco) return;

		// Configure Svelte language support
		monaco.languages.register({ id: 'svelte' });
		monaco.languages.setMonarchTokensProvider('svelte', getSvelteLanguageConfig());

		editor = monaco.editor.create(container, {
			value,
			language: language === 'svelte' ? 'svelte' : language,
			theme,
			readOnly: readonly,
			minimap: { enabled: false },
			fontSize: 14,
			lineNumbers: 'on',
			scrollBeyondLastLine: false,
			automaticLayout: true,
			tabSize: 2,
			wordWrap: 'on',
			padding: { top: 12, bottom: 12 }
		});

		const currentEditor = editor;
		currentEditor.onDidChangeModelContent(() => {
			const newValue = currentEditor.getValue();
			if (newValue !== lastExternalValue) {
				onchange?.(newValue);
			}
		});

		// Register $template/ autocomplete provider
		const editorLanguage = language === 'svelte' ? 'svelte' : language;
		monaco.languages.registerCompletionItemProvider(editorLanguage, {
			triggerCharacters: ['/'],
			provideCompletionItems: async (model, position) => {
				const lineContent = model.getLineContent(position.lineNumber);
				const textBefore = lineContent.substring(0, position.column - 1);

				// Only trigger on $template/ context
				if (!textBefore.includes('$template/')) {
					return { suggestions: [] };
				}

				const templates = await fetchTemplateList();
				const word = model.getWordUntilPosition(position);

				// Extract what's been typed after $template/
				const match = textBefore.match(/\$template\/(\S*)$/);
				const typed = match?.[1] ?? '';

				const suggestions: Monaco.languages.CompletionItem[] = templates
					.filter((t) => t.slug.includes(typed))
					.map((t) => {
						const componentName = slugToComponentName(t.slug);
						// Check if this is inside a from '...' context or a standalone import
						const isInImportFrom = /from\s+['"]/.test(textBefore);

						return {
							label: {
								label: t.slug,
								detail: ` — ${t.name}`,
								description: t.category
							},
							kind: monaco!.languages.CompletionItemKind.Module,
							insertText: isInImportFrom
								? t.slug
								: `${t.slug}';\n`,
							// When user completes inside import statement, offer full import snippet
							documentation: `import ${componentName} from '$template/${t.slug}'`,
							range: {
								startLineNumber: position.lineNumber,
								startColumn: position.column - typed.length,
								endLineNumber: position.lineNumber,
								endColumn: position.column
							}
						};
					});

				return { suggestions };
			}
		});
	});

	onDestroy(() => {
		editor?.dispose();
	});

	// Update editor when external value changes
	$effect(() => {
		if (editor && value !== lastExternalValue) {
			lastExternalValue = value;
			const currentValue = editor.getValue();
			if (currentValue !== value) {
				editor.setValue(value);
			}
		}
	});

	async function loadMonacoFromCDN(): Promise<void> {
		return new Promise((resolve, reject) => {
			const script = document.createElement('script');
			script.src = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs/loader.js';
			script.onload = () => {
				// @ts-expect-error - AMD loader
				window.require.config({
					paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs' }
				});
				// @ts-expect-error - AMD loader
				window.require(['vs/editor/editor.main'], () => {
					resolve();
				});
			};
			script.onerror = reject;
			document.head.appendChild(script);
		});
	}

	function getSvelteLanguageConfig(): Monaco.languages.IMonarchLanguage {
		return {
			defaultToken: '',
			tokenPostfix: '.svelte',

			brackets: [
				{ open: '{', close: '}', token: 'delimiter.curly' },
				{ open: '[', close: ']', token: 'delimiter.square' },
				{ open: '(', close: ')', token: 'delimiter.parenthesis' },
				{ open: '<', close: '>', token: 'delimiter.angle' }
			],

			tokenizer: {
				root: [
					// Script tags
					[/<script[^>]*>/, { token: 'tag', next: '@script' }],
					// Style tags
					[/<style[^>]*>/, { token: 'tag', next: '@style' }],
					// Svelte blocks
					[/\{#(if|each|await|key)\b/, 'keyword'],
					[/\{:(else|then|catch)\b/, 'keyword'],
					[/\{\/(if|each|await|key)\b/, 'keyword'],
					[/\{@(html|debug|const)\b/, 'keyword'],
					// Expressions
					[/\{/, 'delimiter.curly', '@expression'],
					// HTML
					[/<\/?[\w-]+/, 'tag'],
					[/>/, 'tag'],
					[/=/, 'delimiter'],
					[/"[^"]*"/, 'string'],
					[/'[^']*'/, 'string'],
					[/[^<{]+/, '']
				],
				script: [
					[/<\/script>/, { token: 'tag', next: '@pop' }],
					[/.+/, 'source.js']
				],
				style: [
					[/<\/style>/, { token: 'tag', next: '@pop' }],
					[/.+/, 'source.css']
				],
				expression: [
					[/\}/, 'delimiter.curly', '@pop'],
					[/[^}]+/, 'source.js']
				]
			}
		};
	}

	export function getValue(): string {
		return editor?.getValue() ?? '';
	}

	export function setValue(newValue: string): void {
		editor?.setValue(newValue);
	}

	export function focus(): void {
		editor?.focus();
	}
</script>

<div bind:this={container} class="monaco-editor-container {className}"></div>

<style>
	.monaco-editor-container {
		width: 100%;
		height: 100%;
		min-height: 400px;
	}
</style>
