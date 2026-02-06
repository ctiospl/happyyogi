<script lang="ts">
	import type { LayoutData } from './$types';
	import { page } from '$app/state';
	import { locales, localizeHref } from '$lib/paraglide/runtime';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import PageRenderer from '$lib/components/PageRenderer.svelte';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { data, children }: { data: LayoutData; children: any } = $props();

	const isPreview = $derived(page.url.searchParams.has('_preview'));

	const layout = $derived(data.layout);
	const hasHeader = $derived((layout?.regions?.header?.content?.blocks?.length ?? 0) > 0);
	const hasFooter = $derived((layout?.regions?.footer?.content?.blocks?.length ?? 0) > 0);
	const hasAnnouncement = $derived((layout?.regions?.announcement_bar?.content?.blocks?.length ?? 0) > 0);
	const hasSidebar = $derived((layout?.regions?.sidebar?.content?.blocks?.length ?? 0) > 0);
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

{#if isPreview}
	{@render children()}
{:else}
	<div class="flex min-h-screen flex-col">
		{#if hasAnnouncement}
			<PageRenderer
				content={layout!.regions.announcement_bar!.content}
				extraCss={layout!.regions.announcement_bar!.extraCss}
			/>
		{/if}

		{#if hasHeader}
			<PageRenderer
				content={layout!.regions.header!.content}
				extraCss={layout!.regions.header!.extraCss}
			/>
		{:else}
			<Header />
		{/if}

		{#if hasSidebar}
			<div class="flex flex-1">
				<main class="flex-1">
					{@render children()}
				</main>
				<aside class="hidden w-72 shrink-0 border-l p-6 lg:block">
					<PageRenderer
						content={layout!.regions.sidebar!.content}
						extraCss={layout!.regions.sidebar!.extraCss}
					/>
				</aside>
			</div>
		{:else}
			<main class="flex-1">
				{@render children()}
			</main>
		{/if}

		{#if hasFooter}
			<PageRenderer
				content={layout!.regions.footer!.content}
				extraCss={layout!.regions.footer!.extraCss}
			/>
		{:else}
			<Footer />
		{/if}
	</div>

	<div style="display:none">
		{#each locales as locale}
			<a href={localizeHref(page.url.pathname, { locale })}>
				{locale}
			</a>
		{/each}
	</div>
{/if}
