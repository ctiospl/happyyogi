<script lang="ts">
	import type { HtmlBlock } from '$lib/types';

	interface Props {
		block: HtmlBlock;
	}

	let { block }: Props = $props();
</script>

{#if block.css}
	{@html `<style>${block.css}</style>`}
{/if}
{@html block.html}
