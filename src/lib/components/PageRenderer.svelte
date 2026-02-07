<script lang="ts">
	import type { PageContent } from '$lib/types';
	import type { FormFieldDef, FormConditionalRule, FormSettings } from '$lib/server/db/schema';
	import FormRenderer from '$lib/components/forms/FormRenderer.svelte';

	interface Props {
		content: PageContent;
		extraCss?: string;
	}

	let { content, extraCss }: Props = $props();

	const sortedBlocks = $derived(
		[...content.blocks].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
	);
</script>

{#if extraCss}
	{@html `<style>${extraCss}</style>`}
{/if}

{#each sortedBlocks as block, index (block.id ?? `block-${index}`)}
	{#if block.type === 'form'}
		<section class="mx-auto max-w-2xl px-4 py-8">
			<FormRenderer
				formId={block.form_id}
				fields={block.fields as FormFieldDef[] ?? []}
				settings={block.settings as FormSettings ?? {}}
				conditionalRules={block.conditional_rules as FormConditionalRule[] ?? []}
				submitMethod="fetch"
			/>
		</section>
	{:else if block.type === 'html'}
		{@html block.html}
	{/if}
{/each}
