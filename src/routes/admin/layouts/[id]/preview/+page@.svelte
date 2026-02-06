<script lang="ts">
	import type { PageData } from './$types';
	import PageRenderer from '$lib/components/PageRenderer.svelte';
	import '../../../../layout.css';
	import { onMount } from 'svelte';

	let { data }: { data: PageData } = $props();

	let layout = $state(data.layout);

	onMount(() => {
		function handleMessage(e: MessageEvent) {
			if (e.data?.type === 'layout-preview-update') {
				layout = e.data.layout;
			}
		}
		window.addEventListener('message', handleMessage);
		return () => window.removeEventListener('message', handleMessage);
	});
</script>

<svelte:head>
	<title>Layout Preview</title>
</svelte:head>

<div class="flex min-h-screen flex-col">
	{#if layout.regions.announcement_bar}
		<PageRenderer
			content={layout.regions.announcement_bar.content}
			extraCss={layout.regions.announcement_bar.extraCss}
		/>
	{/if}

	{#if layout.regions.header}
		<PageRenderer
			content={layout.regions.header.content}
			extraCss={layout.regions.header.extraCss}
		/>
	{/if}

	<main class="flex-1">
		{#if layout.regions.sidebar}
			<div class="flex">
				<div class="flex-1 p-8">
					<div class="mx-auto max-w-3xl space-y-4">
						<div class="rounded-lg border-2 border-dashed p-8 text-center text-muted-foreground">
							<p class="text-lg font-medium">Page Content Area</p>
							<p class="text-sm">Your page content will appear here</p>
						</div>
					</div>
				</div>
				<aside class="hidden w-72 shrink-0 border-l p-6 lg:block">
					<PageRenderer
						content={layout.regions.sidebar.content}
						extraCss={layout.regions.sidebar.extraCss}
					/>
				</aside>
			</div>
		{:else}
			<div class="mx-auto max-w-5xl p-8">
				<div class="rounded-lg border-2 border-dashed p-8 text-center text-muted-foreground">
					<p class="text-lg font-medium">Page Content Area</p>
					<p class="text-sm">Your page content will appear here</p>
				</div>
			</div>
		{/if}
	</main>

	{#if layout.regions.footer}
		<PageRenderer
			content={layout.regions.footer.content}
			extraCss={layout.regions.footer.extraCss}
		/>
	{/if}
</div>
