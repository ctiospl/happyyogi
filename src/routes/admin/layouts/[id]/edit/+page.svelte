<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import type { PageBlock, LayoutRegionName } from '$lib/server/db/schema';
	import { enhance } from '$app/forms';
	import LayoutRegionEditor from '$lib/components/admin/LayoutRegionEditor.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
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

	let name = $state(data.layout.name);
	let slug = $state(data.layout.slug);

	function parseRegions(raw: unknown): Partial<Record<LayoutRegionName, PageBlock[]>> {
		if (!raw) return {};
		if (typeof raw === 'string') {
			try { return JSON.parse(raw); } catch { return {}; }
		}
		return (raw as Partial<Record<LayoutRegionName, PageBlock[]>>) ?? {};
	}

	let regions = $state(parseRegions(data.layout.regions));

	let regionsForm: HTMLFormElement;
	let regionsInput: HTMLInputElement;

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

	function onDividerDown(e: MouseEvent) {
		e.preventDefault();
		isDragging = true;

		function onMove(e: MouseEvent) {
			if (!containerRef) return;
			const rect = containerRef.getBoundingClientRect();
			let ratio = (e.clientX - rect.left) / rect.width;
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

	function syncPreview() {
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(async () => {
			if (!previewOpen || !iframeRef) return;
			try {
				const res = await fetch(`/api/layouts/${data.layout.id}/preview`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ regions })
				});
				if (!res.ok) return;
				const resolved = await res.json();
				iframeRef.contentWindow?.postMessage({ type: 'layout-preview-update', layout: resolved }, '*');
			} catch {
				// silently ignore
			}
		}, 400);
	}

	function handleRegionsChange(newRegions: Partial<Record<LayoutRegionName, PageBlock[]>>) {
		regions = newRegions;
		syncPreview();
	}

	function saveRegions() {
		if (!regionsForm || !regionsInput) return;
		regionsInput.value = JSON.stringify(regions);
		saveStatus = 'saving';
		regionsForm.requestSubmit();
	}

	onMount(() => {
		return () => clearTimeout(debounceTimer);
	});
</script>

<svelte:head>
	<title>Edit: {data.layout.name} | Layouts | Admin</title>
</svelte:head>

<!-- Hidden form for region saves -->
<form
	bind:this={regionsForm}
	method="POST"
	action="?/saveRegions"
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
	<input bind:this={regionsInput} type="hidden" name="regions" />
</form>

<div class="flex h-screen flex-col">
	<!-- Top bar -->
	<div class="bg-background flex items-center justify-between border-b px-4 py-2">
		<div class="flex items-center gap-4">
			<Button href="/admin/layouts" variant="ghost" size="icon">
				<ArrowLeft class="h-4 w-4" />
			</Button>
			<div>
				<h1 class="font-semibold">{data.layout.name}</h1>
				<p class="text-muted-foreground text-sm">{data.layout.slug}</p>
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
					Error
				</span>
			{/if}

			<Badge variant={data.layout.status === 'published' ? 'default' : 'secondary'}>
				{data.layout.status}
			</Badge>

			<Button variant="default" size="sm" onclick={saveRegions}>Save</Button>

			<Button
				variant="outline"
				size="sm"
				onclick={() => (previewOpen = !previewOpen)}
			>
				{#if previewOpen}
					<EyeOff class="mr-1 h-4 w-4" />
				{:else}
					<Eye class="mr-1 h-4 w-4" />
				{/if}
				Preview
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
						<Sheet.Title>Layout Settings</Sheet.Title>
					</Sheet.Header>
					<form method="POST" action="?/updateMeta" use:enhance class="mt-6 space-y-4">
						<div>
							<Label for="name">Layout Name</Label>
							<Input id="name" name="name" bind:value={name} />
						</div>
						<div>
							<Label for="slug">Slug</Label>
							<Input id="slug" name="slug" bind:value={slug} />
						</div>
						<Button type="submit" class="w-full">Save Settings</Button>
					</form>

					<div class="mt-8 border-t pt-6">
						<h3 class="mb-4 font-medium">Publish</h3>
						{#if data.layout.status === 'draft'}
							<form method="POST" action="?/publish" use:enhance>
								<Button type="submit" class="w-full">Publish Layout</Button>
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
								if (!confirm('Delete this layout?')) {
									return async () => {};
								}
								return async ({ update }) => update();
							}}
						>
							<Button type="submit" variant="destructive" class="w-full">Delete Layout</Button>
						</form>
					</div>
				</Sheet.Content>
			</Sheet.Root>
		</div>
	</div>

	{#if form?.error}
		<Alert.Root variant="destructive" class="m-4">
			<AlertCircle class="h-4 w-4" />
			<Alert.Title>Error</Alert.Title>
			<Alert.Description>{form.error}</Alert.Description>
		</Alert.Root>
	{/if}

	<!-- Split pane -->
	<div class="flex flex-1 overflow-hidden" bind:this={containerRef}>
		<!-- Region editor (left) -->
		<div
			class="overflow-auto p-6"
			style:flex-basis={previewOpen ? `${splitRatio * 100}%` : '100%'}
			style:min-width="300px"
		>
			<div class="mx-auto max-w-3xl">
				<LayoutRegionEditor
					{regions}
					templates={data.templates}
					onchange={handleRegionsChange}
				/>
			</div>
		</div>

		{#if previewOpen}
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				class="divider-handle"
				class:active={isDragging}
				onmousedown={onDividerDown}
			></div>

			<div
				class="flex flex-col overflow-hidden"
				style:flex-basis={`${(1 - splitRatio) * 100}%`}
				style:min-width="300px"
			>
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

				<div class="flex flex-1 justify-center overflow-auto bg-neutral-100">
					<iframe
						bind:this={iframeRef}
						src="./preview?_preview"
						title="Layout Preview"
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
