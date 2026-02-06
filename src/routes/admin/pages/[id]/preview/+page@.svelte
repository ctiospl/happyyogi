<script lang="ts">
	import type { PageData } from './$types';
	import PageRenderer from '$lib/components/PageRenderer.svelte';
	import '../../../../layout.css';
	import { onMount } from 'svelte';

	let { data }: { data: PageData } = $props();

	let content = $state(data.content);
	let extraCss = $state(data.extraCss);

	onMount(() => {
		function handleMessage(e: MessageEvent) {
			if (e.data?.type === 'preview-update') {
				content = e.data.content;
				extraCss = e.data.extraCss;
			}
		}
		window.addEventListener('message', handleMessage);
		return () => window.removeEventListener('message', handleMessage);
	});
</script>

<svelte:head>
	<title>Preview</title>
</svelte:head>

<PageRenderer {content} {extraCss} />
