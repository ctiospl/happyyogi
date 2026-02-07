<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	import TemplateEditor from '$lib/components/template-editor/TemplateEditor.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Badge } from '$lib/components/ui/badge';
	import * as Dialog from '$lib/components/ui/dialog';
	import { ArrowLeft, Trash2, Settings, Upload, Save } from '@lucide/svelte';
	import type { TemplateSchema } from '$lib/server/db/schema';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let deleteDialogOpen = $state(false);
	let settingsDialogOpen = $state(false);
	let templateName = $state(data.template.name);
	let templateSlug = $state(data.template.slug);
	let saveStatus = $state<'idle' | 'saving' | 'saved' | 'publishing' | 'published' | 'error'>('idle');

	const hasDraft = $derived(!!data.template.draft_source_code);
	const draftStatus = $derived(
		hasDraft ? 'Unpublished changes' : 'Published'
	);

	// Hidden forms for save/publish
	let draftForm: HTMLFormElement;
	let draftSourceInput: HTMLInputElement;
	let draftSchemaInput: HTMLInputElement;
	let draftSampleInput: HTMLInputElement;

	function handleSave(saveData: {
		source_code: string;
		schema: TemplateSchema;
		sample_data: Record<string, unknown>;
	}) {
		if (!draftForm || !draftSourceInput || !draftSchemaInput || !draftSampleInput) return;
		draftSourceInput.value = saveData.source_code;
		draftSchemaInput.value = JSON.stringify(saveData.schema);
		draftSampleInput.value = JSON.stringify(saveData.sample_data);
		saveStatus = 'saving';
		draftForm.requestSubmit();
	}

	async function handlePreview(
		source: string,
		sampleData: Record<string, unknown>
	): Promise<{ success: boolean; html?: string; css?: string; error?: string }> {
		try {
			const response = await fetch('/api/templates/preview', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ source_code: source, sample_data: sampleData })
			});
			return await response.json();
		} catch (err) {
			return {
				success: false,
				error: err instanceof Error ? err.message : 'Preview request failed'
			};
		}
	}

	// Provide draft source to editor if available
	const editorTemplate = $derived({
		...data.template,
		source_code: data.template.draft_source_code || data.template.source_code
	});
</script>

<svelte:head>
	<title>{data.template.name} | Templates | Admin | {data.tenant.name}</title>
</svelte:head>

<!-- Hidden form for draft save -->
<form
	bind:this={draftForm}
	method="POST"
	action="?/saveDraft"
	use:enhance={() => {
		return async ({ result, update }) => {
			if (result.type === 'success') {
				saveStatus = 'saved';
				setTimeout(() => { saveStatus = 'idle'; }, 2000);
			} else {
				saveStatus = 'error';
			}
			await update();
		};
	}}
	class="hidden"
>
	<input bind:this={draftSourceInput} type="hidden" name="source_code" />
	<input bind:this={draftSchemaInput} type="hidden" name="schema" />
	<input bind:this={draftSampleInput} type="hidden" name="sample_data" />
</form>

<div class="flex h-screen flex-col">
	<!-- Top bar -->
	<div class="bg-background flex items-center justify-between border-b px-4 py-2">
		<div class="flex items-center gap-4">
			<Button href="/admin/templates" variant="ghost" size="sm">
				<ArrowLeft class="mr-1 h-4 w-4" />
				Templates
			</Button>
			<div class="flex items-center gap-2">
				<span class="font-medium">{data.template.name}</span>
				<span class="text-muted-foreground text-sm">({data.template.slug})</span>
				<Badge variant={hasDraft ? 'secondary' : 'default'}>
					{draftStatus}
				</Badge>
			</div>
		</div>
		<div class="flex items-center gap-2">
			{#if saveStatus === 'saved'}
				<span class="text-sm text-green-600">Draft saved</span>
			{:else if saveStatus === 'published'}
				<span class="text-sm text-green-600">Published</span>
			{:else if saveStatus === 'error'}
				<span class="text-sm text-red-600">Error</span>
			{/if}

			{#if !data.template.is_core}
				<form
					method="POST"
					action="?/publish"
					use:enhance={() => {
						saveStatus = 'publishing';
						return async ({ result, update }) => {
							if (result.type === 'success') {
								saveStatus = 'published';
								setTimeout(() => { saveStatus = 'idle'; }, 2000);
							} else {
								saveStatus = 'error';
							}
							await update();
						};
					}}
				>
					<Button type="submit" variant="default" size="sm" disabled={saveStatus === 'publishing'}>
						<Upload class="mr-1 h-4 w-4" />
						Publish
					</Button>
				</form>

				<Button variant="outline" size="sm" onclick={() => (settingsDialogOpen = true)}>
					<Settings class="mr-1 h-4 w-4" />
					Settings
				</Button>
			{/if}
			{#if !data.template.is_core}
				<Button
					variant="outline"
					size="sm"
					class="text-destructive"
					onclick={() => (deleteDialogOpen = true)}
				>
					<Trash2 class="mr-1 h-4 w-4" />
					Delete
				</Button>
			{/if}
		</div>
	</div>

	{#if form?.error}
		<div class="bg-destructive/10 text-destructive border-destructive/20 border-b px-4 py-2 text-sm">
			{form.error}
		</div>
	{/if}

	{#if data.template.is_core}
		<div class="core-banner">
			<span>Core Template — Read Only</span>
			<form method="POST" action="?/fork">
				<button type="submit" class="customize-btn">Customize</button>
			</form>
		</div>
	{/if}

	<!-- Editor (uses draft source if available) -->
	<div class="flex-1 overflow-hidden {data.template.is_core ? 'pointer-events-none opacity-60' : ''}">
		<TemplateEditor
			template={editorTemplate}
			onsave={data.template.is_core ? undefined : handleSave}
			onpreview={handlePreview}
		/>
	</div>
</div>

<!-- Settings dialog -->
<Dialog.Root bind:open={settingsDialogOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Template Settings</Dialog.Title>
		</Dialog.Header>
		<form
			method="POST"
			action="?/save"
			use:enhance={() => {
				return async ({ update }) => {
					settingsDialogOpen = false;
					await update();
				};
			}}
		>
			<div class="space-y-4 py-4">
				<div>
					<Label for="name">Name</Label>
					<Input id="name" name="name" bind:value={templateName} required />
				</div>
				<div>
					<Label for="slug">Slug</Label>
					<Input id="slug" name="slug" bind:value={templateSlug} required />
				</div>
			</div>
			<input type="hidden" name="source_code" value={data.template.source_code} />
			<input type="hidden" name="schema" value={JSON.stringify(data.template.schema)} />
			<input type="hidden" name="sample_data" value={JSON.stringify(data.template.sample_data)} />
			<Dialog.Footer>
				<Button type="button" variant="outline" onclick={() => (settingsDialogOpen = false)}>
					Cancel
				</Button>
				<Button type="submit">Save Settings</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<!-- Delete confirmation dialog -->
<Dialog.Root bind:open={deleteDialogOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Delete Template</Dialog.Title>
		</Dialog.Header>
		<p class="text-muted-foreground py-4">
			Are you sure you want to delete "{data.template.name}"? This action cannot be undone.
		</p>
		<Dialog.Footer>
			<Button type="button" variant="outline" onclick={() => (deleteDialogOpen = false)}>
				Cancel
			</Button>
			<form method="POST" action="?/delete" use:enhance>
				<Button type="submit" variant="destructive">Delete</Button>
			</form>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<style>
	.core-banner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 12px 16px;
		background: #fef3c7;
		border: 1px solid #f59e0b;
		border-radius: 8px;
		margin: 8px 16px;
		font-size: 14px;
		font-weight: 500;
		color: #92400e;
	}
	.customize-btn {
		padding: 6px 16px;
		background: #f59e0b;
		color: white;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		font-size: 13px;
		font-weight: 500;
	}
	.customize-btn:hover {
		background: #d97706;
	}
</style>
