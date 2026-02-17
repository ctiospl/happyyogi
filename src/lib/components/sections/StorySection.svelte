<script lang="ts">
	import type { StoryBlock } from '$lib/types';
	import { toWebpUrl } from '$lib/utils/image.js';

	interface Props {
		block: StoryBlock;
	}

	let { block }: Props = $props();
</script>

<section class="py-16 md:py-24">
	<div class="container mx-auto px-4">
		<div class="mx-auto max-w-3xl">
			<div class="mb-8 text-center">
				<h2 class="mb-2 text-3xl font-bold text-foreground md:text-4xl">
					{block.heading}
				</h2>
				{#if block.subheading}
					<p class="text-lg text-muted-foreground">{block.subheading}</p>
				{/if}
			</div>

			{#if block.image}
				<div class="mb-8">
					<picture>
						{#if toWebpUrl(block.image) !== block.image}
							<source srcset={toWebpUrl(block.image)} type="image/webp" />
						{/if}
						<img
						src={block.image}
						alt=""
						loading="lazy"
						decoding="async"
						class="w-full rounded-2xl shadow-lifted"
					/>
					</picture>
				</div>
			{/if}

			<div class="prose prose-lg mx-auto text-muted-foreground">
				{#each block.content as paragraph}
					<p>{paragraph}</p>
				{/each}
			</div>
		</div>
	</div>
</section>
