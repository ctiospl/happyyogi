<script lang="ts">
	import type { PageContent, ContentBlock } from '$lib/types';
	import type { FormFieldDef, FormConditionalRule, FormSettings } from '$lib/server/db/schema';
	import FormRenderer from '$lib/components/forms/FormRenderer.svelte';
	import { onMount } from 'svelte';

	interface Props {
		content: PageContent;
		extraCss?: string;
	}

	let { content, extraCss }: Props = $props();

	const sortedBlocks = $derived(
		[...content.blocks].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
	);

	// Blocks that need client hydration
	const hydratableBlocks = $derived(
		sortedBlocks.filter(
			(b): b is ContentBlock & { type: 'html'; clientJs: string } =>
				b.type === 'html' && !!b.clientJs
		)
	);

	onMount(() => {
		if (hydratableBlocks.length === 0) return;

		// Load shared Svelte client runtime, then hydrate blocks
		const script = document.createElement('script');
		script.src = '/api/templates/client-runtime';
		script.onload = () => {
			hydrateBlocks();
		};
		script.onerror = () => {
			console.warn('Failed to load Svelte client runtime');
		};
		document.head.appendChild(script);

		return () => {
			script.remove();
		};
	});

	function hydrateBlocks() {
		for (const block of hydratableBlocks) {
			const target = document.querySelector(`[data-hydrate="${block.id}"]`);
			if (!target) continue;

			try {
				// Evaluate the per-template client bundle (sets window.__component_client)
				const fn = new Function(block.clientJs);
				fn();

				const ClientComponent = (globalThis as any).__component_client?.default;
				if (!ClientComponent) continue;

				const svelteClient = (globalThis as any).__svelte_client;
				if (!svelteClient?.hydrate) continue;

				svelteClient.hydrate(ClientComponent, {
					target,
					props: block.hydrationProps ?? {}
				});
			} catch (err) {
				console.warn(`Hydration failed for block ${block.id}:`, err);
				// SSR HTML remains visible — graceful degradation
			}
		}
	}
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
		{#if block.clientJs}
			<div data-hydrate={block.id}>
				{@html block.html}
			</div>
		{:else}
			{@html block.html}
		{/if}
	{/if}
{/each}
