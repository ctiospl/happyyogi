<script lang="ts">
	import type { HeroBlock } from '$lib/types';
	import { Button } from '$lib/components/ui/button';
	import { MapPin } from '@lucide/svelte';
	import { toWebpUrl } from '$lib/utils/image.js';

	interface Props {
		block: HeroBlock;
	}

	let { block }: Props = $props();
</script>

<svelte:head>
	{#if block.backgroundImage}
		{@const webpSrc = toWebpUrl(block.backgroundImage)}
		{#if webpSrc !== block.backgroundImage}
			<link rel="preload" as="image" href={webpSrc} type="image/webp" />
		{:else}
			<link rel="preload" as="image" href={block.backgroundImage} />
		{/if}
	{/if}
</svelte:head>

<section class="relative min-h-[90vh] overflow-hidden">
	<!-- Background Image -->
	{#if block.backgroundImage}
		<div class="absolute inset-0">
			<picture>
				{#if toWebpUrl(block.backgroundImage) !== block.backgroundImage}
					<source srcset={toWebpUrl(block.backgroundImage)} type="image/webp" />
				{/if}
				<img
					src={block.backgroundImage}
					alt=""
					fetchpriority="high"
					decoding="auto"
					class="h-full w-full object-cover"
				/>
			</picture>
			<div class="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-background/30"></div>
		</div>
	{:else}
		<div class="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-background/30"></div>
	{/if}

	<div class="container relative z-10 mx-auto flex min-h-[90vh] items-center px-4 py-20">
		<div class="max-w-2xl">
			<h1 class="mb-6 text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
				{@html block.headline}
			</h1>
			{#if block.subheadline}
				<p class="mb-8 text-lg text-muted-foreground md:text-xl">
					{block.subheadline}
				</p>
			{/if}
			{#if block.cta || block.secondaryCta}
				<div class="flex flex-col gap-4 sm:flex-row">
					{#if block.cta}
						<Button href={block.cta.href} size="lg" class="text-lg">
							{block.cta.text}
						</Button>
					{/if}
					{#if block.secondaryCta}
						<Button href={block.secondaryCta.href} variant="outline" size="lg" class="text-lg">
							{block.secondaryCta.text}
						</Button>
					{/if}
				</div>
			{/if}
			{#if block.location}
				<p class="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
					<MapPin class="h-4 w-4 text-primary" />
					{block.location}
				</p>
			{/if}
		</div>
	</div>

	<!-- Decorative bottom wave -->
	<div class="absolute bottom-0 left-0 right-0">
		<svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full">
			<path
				d="M0 120L60 110C120 100 240 80 360 75C480 70 600 80 720 85C840 90 960 90 1080 85C1200 80 1320 70 1380 65L1440 60V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
				class="fill-background"
			/>
		</svg>
	</div>
</section>
