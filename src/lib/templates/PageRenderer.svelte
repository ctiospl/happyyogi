<script lang="ts">
	import { getTemplate } from './registry';

	interface Block {
		id: string;
		templateSlug: string;
		props: Record<string, unknown>;
	}

	interface Props {
		blocks: Block[];
	}

	let { blocks = [] }: Props = $props();
</script>

{#each blocks as block (block.id)}
	{@const Component = getTemplate(block.templateSlug)}
	{#if Component}
		<svelte:component this={Component} {...block.props} />
	{:else}
		<!-- Unknown template: {block.templateSlug} -->
		<div class="bg-destructive/10 p-4 text-destructive">
			Unknown template: {block.templateSlug}
		</div>
	{/if}
{/each}
