<script lang="ts">
	import type { TemplateSchema } from '$lib/server/db/schema';
	import { Button } from '$lib/components/ui/button';
	import { RefreshCw } from '@lucide/svelte';

	interface Props {
		data: Record<string, unknown>;
		schema?: TemplateSchema;
		onchange?: (data: Record<string, unknown>) => void;
		class?: string;
	}

	let { data, schema, onchange, class: className = '' }: Props = $props();

	let jsonText = $state(JSON.stringify(data, null, 2));
	let parseError = $state<string | null>(null);

	function handleInput(event: Event) {
		const textarea = event.target as HTMLTextAreaElement;
		jsonText = textarea.value;

		try {
			const parsed = JSON.parse(jsonText);
			parseError = null;
			onchange?.(parsed);
		} catch (err) {
			parseError = err instanceof Error ? err.message : 'Invalid JSON';
		}
	}

	function generateFromSchema() {
		if (!schema) return;

		const generated: Record<string, unknown> = {};

		for (const field of schema.fields) {
			generated[field.key] = generateDefaultValue(field.type, field.label);
		}

		jsonText = JSON.stringify(generated, null, 2);
		parseError = null;
		onchange?.(generated);
	}

	function generateDefaultValue(type: string, label: string): unknown {
		switch (type) {
			case 'text':
				return label || 'Sample text';
			case 'textarea':
				return `Sample ${label.toLowerCase()} content. This is a longer text field.`;
			case 'richtext':
				return `<p>Sample ${label.toLowerCase()} content with <strong>formatting</strong>.</p>`;
			case 'number':
				return 42;
			case 'boolean':
				return true;
			case 'select':
				return 'option1';
			case 'image':
				return 'https://placehold.co/400x300';
			case 'object':
				return {};
			case 'array':
				return [];
			default:
				return null;
		}
	}
</script>

<div class="sample-data-editor {className}">
	<div class="editor-header">
		<h4 class="editor-title">Sample Data</h4>
		{#if schema && schema.fields.length > 0}
			<Button variant="outline" size="sm" onclick={generateFromSchema}>
				<RefreshCw class="mr-1 h-3 w-3" />
				Generate
			</Button>
		{/if}
	</div>

	<div class="editor-body">
		<textarea
			class="json-input"
			class:has-error={parseError}
			value={jsonText}
			oninput={handleInput}
			spellcheck="false"
		></textarea>

		{#if parseError}
			<div class="parse-error">{parseError}</div>
		{/if}
	</div>
</div>

<style>
	.sample-data-editor {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.editor-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.editor-title {
		font-size: 14px;
		font-weight: 600;
		margin: 0;
	}

	.editor-body {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.json-input {
		flex: 1;
		min-height: 120px;
		padding: 8px;
		font-family: monospace;
		font-size: 12px;
		line-height: 1.4;
		border: 1px solid var(--border);
		border-radius: 6px;
		background: var(--muted);
		color: var(--foreground);
		resize: vertical;
	}

	.json-input:focus {
		outline: none;
		border-color: var(--ring);
	}

	.json-input.has-error {
		border-color: #ef4444;
	}

	.parse-error {
		font-size: 12px;
		color: #ef4444;
	}
</style>
