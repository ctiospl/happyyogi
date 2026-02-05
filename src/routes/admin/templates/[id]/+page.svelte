<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import TemplateEditor from '$lib/components/template-editor/TemplateEditor.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Dialog from '$lib/components/ui/dialog';
	import { ArrowLeft, Trash2, Settings } from '@lucide/svelte';
	import type { TemplateSchema } from '$lib/server/db/schema';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let deleteDialogOpen = $state(false);
	let settingsDialogOpen = $state(false);
	let templateName = $state(data.template.name);
	let templateSlug = $state(data.template.slug);

	// Hidden form for save
	let saveForm: HTMLFormElement;
	let sourceCodeInput: HTMLInputElement;
	let schemaInput: HTMLInputElement;
	let sampleDataInput: HTMLInputElement;

	function handleSave(saveData: {
		source_code: string;
		schema: TemplateSchema;
		sample_data: Record<string, unknown>;
	}) {
		if (!saveForm || !sourceCodeInput || !schemaInput || !sampleDataInput) return;

		sourceCodeInput.value = saveData.source_code;
		schemaInput.value = JSON.stringify(saveData.schema);
		sampleDataInput.value = JSON.stringify(saveData.sample_data);
		saveForm.requestSubmit();
	}

	async function handlePreview(
		source: string
	): Promise<{ success: boolean; html?: string; css?: string; error?: string }> {
		try {
			const response = await fetch('/api/templates/preview', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ source_code: source })
			});
			return await response.json();
		} catch (err) {
			return {
				success: false,
				error: err instanceof Error ? err.message : 'Preview request failed'
			};
		}
	}
</script>

<svelte:head>
	<title>{data.template.name} | Templates | Admin | {data.tenant.name}</title>
</svelte:head>

<!-- Hidden form for saves -->
<form
	bind:this={saveForm}
	method="POST"
	action="?/save"
	use:enhance={() => {
		return async ({ result, update }) => {
			if (result.type === 'success') {
				// Show success feedback
			}
			await update();
		};
	}}
	class="hidden"
>
	<input bind:this={sourceCodeInput} type="hidden" name="source_code" />
	<input bind:this={schemaInput} type="hidden" name="schema" />
	<input bind:this={sampleDataInput} type="hidden" name="sample_data" />
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
			</div>
		</div>
		<div class="flex items-center gap-2">
			<Button variant="outline" size="sm" onclick={() => (settingsDialogOpen = true)}>
				<Settings class="mr-1 h-4 w-4" />
				Settings
			</Button>
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

	<!-- Editor -->
	<div class="flex-1 overflow-hidden">
		<TemplateEditor
			template={data.template}
			onsave={handleSave}
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
