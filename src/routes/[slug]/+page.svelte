<script lang="ts">
	import type { PageData } from './$types';
	import type { PageContent } from '$lib/types';
	import { Badge } from '$lib/components/ui/badge';
	import PageRenderer from '$lib/components/PageRenderer.svelte';

	let { data }: { data: PageData } = $props();

	// Parse structured content if available
	const structuredContent = $derived.by(() => {
		if (!data.page.content_json) return null;
		try {
			const parsed = typeof data.page.content_json === 'string'
				? JSON.parse(data.page.content_json)
				: data.page.content_json;
			// Check for new wrapper format {grapes, structured}
			const content = parsed.structured ?? parsed;
			// Validate it has version and blocks
			if (content.version && Array.isArray(content.blocks)) {
				return content as PageContent;
			}
			return null;
		} catch {
			return null;
		}
	});
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
	{#if structuredContent?.blocks}
		<PageRenderer content={structuredContent} />
	{:else if data.page.content_html}
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
