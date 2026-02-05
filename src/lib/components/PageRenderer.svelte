<script lang="ts">
	import type { PageContent, ContentBlock, InstructorItem } from '$lib/types';
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

	interface Props {
		content: PageContent;
		instructors?: InstructorItem[];
	}

	let { content, instructors = [] }: Props = $props();

	// Sort blocks by order if present
	const sortedBlocks = $derived(
		[...content.blocks].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
	);
</script>

{#each sortedBlocks as block (block.id ?? block.order ?? Math.random())}
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
	{/if}
{/each}
