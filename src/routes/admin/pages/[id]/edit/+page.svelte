<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	import type { PageBlock } from '$lib/server/db/schema';
	import PageBlockEditor from '$lib/components/admin/PageBlockEditor.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Badge } from '$lib/components/ui/badge';
	import * as Sheet from '$lib/components/ui/sheet';
	import * as Alert from '$lib/components/ui/alert';
	import { ArrowLeft, Settings, CheckCircle, AlertCircle, Eye } from '@lucide/svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let settingsOpen = $state(false);
	let saveStatus = $state<'idle' | 'saving' | 'saved' | 'error'>('idle');

	let title = $state(data.page.title);
	let slug = $state(data.page.slug);
	let seoTitle = $state(data.page.seo_title || '');
	let seoDescription = $state(data.page.seo_description || '');

	let pageBlocks = $state<PageBlock[]>(parseBlocks(data.page.blocks));

	function parseBlocks(raw: unknown): PageBlock[] {
		if (!raw) return [];
		if (typeof raw === 'string') {
			try { return JSON.parse(raw); } catch { return []; }
		}
		return Array.isArray(raw) ? raw : [];
	}

	let blocksForm: HTMLFormElement;
	let blocksInput: HTMLInputElement;

	function handleBlocksChange(blocks: PageBlock[]) {
		pageBlocks = blocks;
	}

	function saveBlocks() {
		if (!blocksForm || !blocksInput) return;
		blocksInput.value = JSON.stringify(pageBlocks);
		saveStatus = 'saving';
		blocksForm.requestSubmit();
	}
</script>

<svelte:head>
	<title>Edit: {data.page.title} | Admin</title>
</svelte:head>

<!-- Hidden form for block saves -->
<form
	bind:this={blocksForm}
	method="POST"
	action="?/saveBlocks"
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
	<input bind:this={blocksInput} type="hidden" name="blocks" />
</form>

<div class="flex h-screen flex-col">
	<!-- Top bar -->
	<div class="bg-background flex items-center justify-between border-b px-4 py-2">
		<div class="flex items-center gap-4">
			<Button href="/admin/pages" variant="ghost" size="icon">
				<ArrowLeft class="h-4 w-4" />
			</Button>
			<div>
				<h1 class="font-semibold">{data.page.title}</h1>
				<p class="text-muted-foreground text-sm">/{data.page.slug}</p>
			</div>
		</div>

		<div class="flex items-center gap-4">
			{#if saveStatus === 'saved'}
				<span class="flex items-center gap-1 text-sm text-green-600">
					<CheckCircle class="h-4 w-4" />
					Saved
				</span>
			{:else if saveStatus === 'error'}
				<span class="flex items-center gap-1 text-sm text-red-600">
					<AlertCircle class="h-4 w-4" />
					Error saving
				</span>
			{/if}

			<Badge variant={data.page.status === 'published' ? 'default' : 'secondary'}>
				{data.page.status}
			</Badge>

			<Button variant="default" size="sm" onclick={saveBlocks}>
				Save
			</Button>

			<Sheet.Root bind:open={settingsOpen}>
				<Sheet.Trigger>
					{#snippet child({ props })}
						<Button variant="outline" size="sm" {...props}>
							<Settings class="mr-2 h-4 w-4" />
							Settings
						</Button>
					{/snippet}
				</Sheet.Trigger>
				<Sheet.Content>
					<Sheet.Header>
						<Sheet.Title>Page Settings</Sheet.Title>
					</Sheet.Header>
					<form method="POST" action="?/updateMeta" use:enhance class="mt-6 space-y-4">
						<div>
							<Label for="title">Page Title</Label>
							<Input id="title" name="title" bind:value={title} />
						</div>
						<div>
							<Label for="slug">URL Slug</Label>
							<Input id="slug" name="slug" bind:value={slug} />
						</div>
						<div>
							<Label for="seo_title">SEO Title</Label>
							<Input id="seo_title" name="seo_title" bind:value={seoTitle} />
						</div>
						<div>
							<Label for="seo_description">SEO Description</Label>
							<Textarea id="seo_description" name="seo_description" bind:value={seoDescription} />
						</div>
						<Button type="submit" class="w-full">Save Settings</Button>
					</form>

					<div class="mt-8 border-t pt-6">
						<h3 class="mb-4 font-medium">Publish</h3>
						{#if data.page.status === 'draft'}
							<form method="POST" action="?/publish" use:enhance>
								<Button type="submit" class="w-full">Publish Page</Button>
							</form>
						{:else}
							<form method="POST" action="?/unpublish" use:enhance>
								<Button type="submit" variant="outline" class="w-full">Unpublish</Button>
							</form>
						{/if}
					</div>

					<div class="mt-8 border-t pt-6">
						<h3 class="text-destructive mb-4 font-medium">Danger Zone</h3>
						<form
							method="POST"
							action="?/delete"
							use:enhance={() => {
								if (!confirm('Are you sure you want to delete this page?')) {
									return async () => {};
								}
								return async ({ update }) => update();
							}}
						>
							<Button type="submit" variant="destructive" class="w-full">Delete Page</Button>
						</form>
					</div>
				</Sheet.Content>
			</Sheet.Root>

			{#if data.page.status === 'published'}
				<Button href="/{data.page.slug}" target="_blank" variant="outline" size="sm">
					<Eye class="mr-1 h-4 w-4" />
					View Live
				</Button>
			{/if}
		</div>
	</div>

	{#if form?.error}
		<Alert.Root variant="destructive" class="m-4">
			<AlertCircle class="h-4 w-4" />
			<Alert.Title>Error</Alert.Title>
			<Alert.Description>{form.error}</Alert.Description>
		</Alert.Root>
	{/if}

	<!-- Block Editor -->
	<div class="flex-1 overflow-auto p-6">
		<div class="mx-auto max-w-3xl">
			<PageBlockEditor
				blocks={pageBlocks}
				templates={data.templates}
				onchange={handleBlocksChange}
			/>
		</div>
	</div>
</div>
