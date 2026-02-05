<script lang="ts">
	import MonacoEditor from './MonacoEditor.svelte';
	import PreviewFrame from './PreviewFrame.svelte';
	import SchemaEditor from './SchemaEditor.svelte';
	import SampleDataEditor from './SampleDataEditor.svelte';
	import type { Template, TemplateSchema } from '$lib/server/db/schema';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import * as Tabs from '$lib/components/ui/tabs';
	import { Save, Play, AlertCircle, CheckCircle, Loader2 } from '@lucide/svelte';

	interface Props {
		template: Template;
		onsave?: (data: { source_code: string; schema: TemplateSchema; sample_data: Record<string, unknown> }) => void;
		onpreview?: (source: string) => Promise<{ success: boolean; html?: string; css?: string; error?: string }>;
		class?: string;
	}

	let { template, onsave, onpreview, class: className = '' }: Props = $props();

	let sourceCode = $state(template.source_code);
	let schema = $state<TemplateSchema>(template.schema as TemplateSchema);
	let sampleData = $state<Record<string, unknown>>(template.sample_data as Record<string, unknown>);

	let previewHtml = $state('');
	let previewCss = $state('');
	let previewError = $state<string | null>(template.compile_error);

	let isCompiling = $state(false);
	let isSaving = $state(false);
	let hasChanges = $state(false);
	let lastSavedSource = template.source_code;

	// Debounce preview updates
	let previewTimeout: ReturnType<typeof setTimeout> | null = null;

	function handleSourceChange(value: string) {
		sourceCode = value;
		hasChanges = value !== lastSavedSource;

		// Debounced preview
		if (previewTimeout) clearTimeout(previewTimeout);
		previewTimeout = setTimeout(() => {
			compilePreview();
		}, 500);
	}

	async function compilePreview() {
		if (!onpreview) return;

		isCompiling = true;
		try {
			const result = await onpreview(sourceCode);
			if (result.success) {
				previewHtml = result.html ?? '';
				previewCss = result.css ?? '';
				previewError = null;
			} else {
				previewError = result.error ?? 'Unknown error';
			}
		} catch (err) {
			previewError = err instanceof Error ? err.message : 'Preview failed';
		} finally {
			isCompiling = false;
		}
	}

	function handleSave() {
		if (!onsave) return;

		isSaving = true;
		try {
			onsave({
				source_code: sourceCode,
				schema,
				sample_data: sampleData
			});
			lastSavedSource = sourceCode;
			hasChanges = false;
		} finally {
			isSaving = false;
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if ((event.metaKey || event.ctrlKey) && event.key === 's') {
			event.preventDefault();
			handleSave();
		}
	}

	// Initial preview
	$effect(() => {
		if (onpreview && !previewHtml && !previewError) {
			compilePreview();
		}
	});
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="template-editor {className}">
	<!-- Header -->
	<div class="editor-header">
		<div class="header-left">
			<h2 class="text-lg font-semibold">{template.name}</h2>
			<Badge variant="outline">{template.category}</Badge>
			{#if hasChanges}
				<Badge variant="secondary">Unsaved</Badge>
			{/if}
		</div>
		<div class="header-right">
			{#if previewError}
				<Badge variant="destructive" class="gap-1">
					<AlertCircle class="h-3 w-3" />
					Error
				</Badge>
			{:else if isCompiling}
				<Badge variant="secondary" class="gap-1">
					<Loader2 class="h-3 w-3 animate-spin" />
					Compiling
				</Badge>
			{:else}
				<Badge variant="outline" class="gap-1 text-green-600">
					<CheckCircle class="h-3 w-3" />
					Ready
				</Badge>
			{/if}
			<Button variant="outline" size="sm" onclick={compilePreview} disabled={isCompiling}>
				<Play class="mr-1 h-4 w-4" />
				Preview
			</Button>
			<Button size="sm" onclick={handleSave} disabled={isSaving || !hasChanges}>
				{#if isSaving}
					<Loader2 class="mr-1 h-4 w-4 animate-spin" />
				{:else}
					<Save class="mr-1 h-4 w-4" />
				{/if}
				Save
			</Button>
		</div>
	</div>

	<!-- Main content -->
	<div class="editor-main">
		<!-- Code editor (2/3 width) -->
		<div class="editor-code">
			<MonacoEditor
				value={sourceCode}
				language="svelte"
				onchange={handleSourceChange}
			/>
		</div>

		<!-- Right panel (1/3 width) -->
		<div class="editor-panel">
			<!-- Preview -->
			<div class="panel-preview">
				<PreviewFrame
					html={previewHtml}
					css={previewCss}
					error={previewError}
				/>
			</div>

			<!-- Schema/Data tabs -->
			<div class="panel-tabs">
				<Tabs.Root value="schema">
					<Tabs.List class="w-full">
						<Tabs.Trigger value="schema" class="flex-1">Schema</Tabs.Trigger>
						<Tabs.Trigger value="data" class="flex-1">Sample Data</Tabs.Trigger>
					</Tabs.List>
					<Tabs.Content value="schema" class="p-3">
						<SchemaEditor
							{schema}
							onchange={(newSchema) => {
								schema = newSchema;
								hasChanges = true;
							}}
						/>
					</Tabs.Content>
					<Tabs.Content value="data" class="p-3">
						<SampleDataEditor
							data={sampleData}
							{schema}
							onchange={(newData) => {
								sampleData = newData;
								hasChanges = true;
							}}
						/>
					</Tabs.Content>
				</Tabs.Root>
			</div>
		</div>
	</div>
</div>

<style>
	.template-editor {
		display: flex;
		flex-direction: column;
		height: 100%;
		background: #1e1e1e;
	}

	.editor-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 12px 16px;
		background: #252526;
		border-bottom: 1px solid #3c3c3c;
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: 12px;
		color: white;
	}

	.header-right {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.editor-main {
		display: flex;
		flex: 1;
		overflow: hidden;
	}

	.editor-code {
		flex: 2;
		min-width: 0;
		overflow: hidden;
	}

	.editor-panel {
		flex: 1;
		min-width: 320px;
		max-width: 480px;
		display: flex;
		flex-direction: column;
		border-left: 1px solid #3c3c3c;
		background: #252526;
	}

	.panel-preview {
		flex: 1;
		min-height: 200px;
		padding: 12px;
		border-bottom: 1px solid #3c3c3c;
	}

	.panel-tabs {
		flex-shrink: 0;
		max-height: 200px;
		overflow: auto;
	}
</style>
