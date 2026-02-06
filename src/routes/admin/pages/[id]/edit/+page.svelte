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
	import {
		ArrowLeft,
		Settings,
		CheckCircle,
		AlertCircle,
		Eye,
		EyeOff,
		Monitor,
		Tablet,
		Smartphone
	} from '@lucide/svelte';
	import { onMount } from 'svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let settingsOpen = $state(false);
	let saveStatus = $state<'idle' | 'saving' | 'saved' | 'error'>('idle');

	let title = $state(data.page.title);
	let slug = $state(data.page.slug);
	let seoTitle = $state(data.page.seo_title || '');
	let seoDescription = $state(data.page.seo_description || '');
	let layoutId = $state(data.page.layout_id || '');
	let noLayout = $state(data.page.no_layout ?? false);

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

	// Preview state
	let previewOpen = $state(true);
	let splitRatio = $state(0.45);
	let isDragging = $state(false);
	let iframeRef: HTMLIFrameElement | undefined = $state();
	let containerRef: HTMLDivElement | undefined = $state();
	let debounceTimer: ReturnType<typeof setTimeout> | undefined;

	type DeviceSize = 'desktop' | 'tablet' | 'mobile';
	let activeDevice: DeviceSize = $state('desktop');

	const deviceWidths: Record<DeviceSize, string> = {
		desktop: '100%',
		tablet: '768px',
		mobile: '375px'
	};

	// Resizable divider
	function onDividerDown(e: MouseEvent) {
		e.preventDefault();
		isDragging = true;

		function onMove(e: MouseEvent) {
			if (!containerRef) return;
			const rect = containerRef.getBoundingClientRect();
			let ratio = (e.clientX - rect.left) / rect.width;
			// Enforce min widths (~300px each side)
			const minRatio = 300 / rect.width;
			const maxRatio = 1 - minRatio;
			ratio = Math.max(minRatio, Math.min(maxRatio, ratio));
			splitRatio = ratio;
		}

		function onUp() {
			isDragging = false;
			window.removeEventListener('mousemove', onMove);
			window.removeEventListener('mouseup', onUp);
		}

		window.addEventListener('mousemove', onMove);
		window.addEventListener('mouseup', onUp);
	}

	// Debounced preview sync
	function syncPreview() {
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(async () => {
			if (!previewOpen || !iframeRef) return;
			try {
				const res = await fetch(`/api/pages/${data.page.id}/preview`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ blocks: pageBlocks })
				});
				if (!res.ok) return;
				const { content, extraCss } = await res.json();
				iframeRef.contentWindow?.postMessage({ type: 'preview-update', content, extraCss }, '*');
			} catch {
				// silently ignore preview errors
			}
		}, 400);
	}

	function handleBlocksChange(blocks: PageBlock[]) {
		pageBlocks = blocks;
		syncPreview();
	}

	function saveBlocks() {
		if (!blocksForm || !blocksInput) return;
		blocksInput.value = JSON.stringify(pageBlocks);
		saveStatus = 'saving';
		blocksForm.requestSubmit();
	}

	onMount(() => {
		return () => clearTimeout(debounceTimer);
	});
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

			<Button
				variant="outline"
				size="sm"
				onclick={() => (previewOpen = !previewOpen)}
				title={previewOpen ? 'Hide preview' : 'Show preview'}
			>
				{#if previewOpen}
					<EyeOff class="mr-1 h-4 w-4" />
					Preview
				{:else}
					<Eye class="mr-1 h-4 w-4" />
					Preview
				{/if}
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

						<div class="border-t pt-4">
							<h4 class="mb-3 text-sm font-medium">Layout Override</h4>
							<div class="space-y-3">
								<div>
									<Label for="layout_id">Layout</Label>
									<select
										id="layout_id"
										name="layout_id"
										bind:value={layoutId}
										class="border-input bg-background ring-offset-background flex h-10 w-full rounded-md border px-3 py-2 text-sm"
										disabled={noLayout}
									>
										<option value="">Default (tenant layout)</option>
										{#each data.layouts as layout}
											<option value={layout.id}>{layout.name}</option>
										{/each}
									</select>
								</div>
								<label class="flex items-center gap-2 text-sm">
									<input
										type="checkbox"
										bind:checked={noLayout}
										class="rounded"
									/>
									No Layout (render without header/footer)
								</label>
								<input type="hidden" name="no_layout" value={noLayout ? 'true' : 'false'} />
							</div>
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

	<!-- Split pane: editor + preview -->
	<div class="flex flex-1 overflow-hidden" bind:this={containerRef}>
		<!-- Block Editor (left) -->
		<div
			class="overflow-auto p-6"
			style:flex-basis={previewOpen ? `${splitRatio * 100}%` : '100%'}
			style:min-width="300px"
		>
			<div class="mx-auto max-w-3xl">
				<PageBlockEditor
					blocks={pageBlocks}
					templates={data.templates}
					forms={data.forms}
					onchange={handleBlocksChange}
				/>
			</div>
		</div>

		{#if previewOpen}
			<!-- Drag handle -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				class="divider-handle"
				class:active={isDragging}
				onmousedown={onDividerDown}
			></div>

			<!-- Preview panel (right) -->
			<div
				class="flex flex-col overflow-hidden"
				style:flex-basis={`${(1 - splitRatio) * 100}%`}
				style:min-width="300px"
			>
				<!-- Device toolbar -->
				<div class="bg-muted/50 flex items-center gap-1 border-b px-3 py-1.5">
					<button
						class="rounded p-1.5 transition-colors"
						class:bg-primary={activeDevice === 'desktop'}
						class:text-primary-foreground={activeDevice === 'desktop'}
						class:text-muted-foreground={activeDevice !== 'desktop'}
						class:hover:bg-muted={activeDevice !== 'desktop'}
						onclick={() => (activeDevice = 'desktop')}
						title="Desktop"
					>
						<Monitor class="h-4 w-4" />
					</button>
					<button
						class="rounded p-1.5 transition-colors"
						class:bg-primary={activeDevice === 'tablet'}
						class:text-primary-foreground={activeDevice === 'tablet'}
						class:text-muted-foreground={activeDevice !== 'tablet'}
						class:hover:bg-muted={activeDevice !== 'tablet'}
						onclick={() => (activeDevice = 'tablet')}
						title="Tablet"
					>
						<Tablet class="h-4 w-4" />
					</button>
					<button
						class="rounded p-1.5 transition-colors"
						class:bg-primary={activeDevice === 'mobile'}
						class:text-primary-foreground={activeDevice === 'mobile'}
						class:text-muted-foreground={activeDevice !== 'mobile'}
						class:hover:bg-muted={activeDevice !== 'mobile'}
						onclick={() => (activeDevice = 'mobile')}
						title="Mobile"
					>
						<Smartphone class="h-4 w-4" />
					</button>
				</div>

				<!-- Iframe container -->
				<div class="flex flex-1 justify-center overflow-auto bg-neutral-100">
					<iframe
						bind:this={iframeRef}
						src="./preview?_preview"
						title="Page Preview"
						class="h-full border-none bg-white transition-[width] duration-200"
						style:width={deviceWidths[activeDevice]}
						style:pointer-events={isDragging ? 'none' : 'auto'}
					></iframe>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.divider-handle {
		width: 4px;
		cursor: col-resize;
		background: hsl(var(--border));
		flex-shrink: 0;
		transition: background 0.15s;
	}
	.divider-handle:hover,
	.divider-handle.active {
		background: hsl(var(--primary));
	}
</style>
