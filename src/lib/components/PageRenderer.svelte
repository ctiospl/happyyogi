<script lang="ts">
	import type { PageContent, ContentBlock, InstructorItem } from '$lib/types';
	import type { FormFieldDef, FormConditionalRule, FormSettings } from '$lib/server/db/schema';
	import {
		HeroSection,
		ServicesGridSection,
		AboutSnippetSection,
		InstructorGridSection,
		TestimonialCarouselSection,
		CtaBannerSection,
		ValuesGridSection,
		StorySection,
		HtmlSection
	} from '$lib/components/sections';
	import FormRenderer from '$lib/components/forms/FormRenderer.svelte';

	interface Props {
		content: PageContent;
		instructors?: InstructorItem[];
		extraCss?: string;
	}

	let { content, instructors = [], extraCss }: Props = $props();

	// Sort blocks by order if present
	const sortedBlocks = $derived(
		[...content.blocks].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
	);
</script>

{#if extraCss}
	{@html `<style>${extraCss}</style>`}
{/if}

{#each sortedBlocks as block, index (block.id ?? `block-${index}`)}
	{#if block.type === 'hero'}
		<HeroSection {block} />
	{:else if block.type === 'services-grid'}
		<ServicesGridSection {block} />
	{:else if block.type === 'about-snippet'}
		<AboutSnippetSection {block} />
	{:else if block.type === 'instructor-grid'}
		<InstructorGridSection {block} />
	{:else if block.type === 'testimonial-carousel'}
		<TestimonialCarouselSection {block} />
	{:else if block.type === 'cta-banner'}
		<CtaBannerSection {block} {instructors} />
	{:else if block.type === 'values-grid'}
		<ValuesGridSection {block} />
	{:else if block.type === 'story'}
		<StorySection {block} />
	{:else if block.type === 'html'}
		<HtmlSection {block} />
	{:else if block.type === 'form'}
		<section class="mx-auto max-w-2xl px-4 py-8">
			<FormRenderer
				formId={block.form_id}
				fields={block.fields as FormFieldDef[] ?? []}
				settings={block.settings as FormSettings ?? {}}
				conditionalRules={block.conditional_rules as FormConditionalRule[] ?? []}
				submitMethod="fetch"
			/>
		</section>
	{/if}
{/each}
