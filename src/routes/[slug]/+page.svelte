<script lang="ts">
	import type { PageData } from './$types';
	import { Badge } from '$lib/components/ui/badge';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{data.page.seo_title || data.page.title} | {data.tenant.name}</title>
	{#if data.page.seo_description}
		<meta name="description" content={data.page.seo_description} />
	{/if}
	{#if data.page.og_image_url}
		<meta property="og:image" content={data.page.og_image_url} />
	{/if}
</svelte:head>

{#if data.page.status === 'draft'}
	<div class="bg-yellow-100 px-4 py-2 text-center text-yellow-800">
		<Badge variant="outline">Preview Mode</Badge>
		This page is not published yet
	</div>
{/if}

<div class="page-content">
	{#if data.page.content_html}
		{@html data.page.content_html}
	{:else}
		<div class="container mx-auto px-4 py-20 text-center">
			<h1 class="text-4xl font-bold">{data.page.title}</h1>
			<p class="text-muted-foreground mt-4">This page has no content yet.</p>
		</div>
	{/if}
</div>

<style>
	.page-content :global(section) {
		width: 100%;
	}

	.page-content :global(img) {
		max-width: 100%;
		height: auto;
	}
</style>
