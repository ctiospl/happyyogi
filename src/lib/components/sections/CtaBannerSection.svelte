<script lang="ts">
	import type { CtaBannerBlock, InstructorItem } from '$lib/types';
	import { Button } from '$lib/components/ui/button';
	import { toWebpUrl } from '$lib/utils/image.js';

	interface Props {
		block: CtaBannerBlock;
		instructors?: InstructorItem[];
	}

	let { block, instructors = [] }: Props = $props();
</script>

<section class="relative overflow-hidden py-16 md:py-24">
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
				decoding="async"
				class="h-full w-full object-cover"
			/>
			</picture>
			<div class="absolute inset-0 bg-primary/85"></div>
		</div>
	{:else}
		<div class="absolute inset-0 bg-primary"></div>
	{/if}

	<div class="container relative z-10 mx-auto px-4">
		<div class="grid items-center gap-8 lg:grid-cols-2">
			<div class="text-primary-foreground">
				<h2 class="mb-4 text-3xl font-bold md:text-4xl">
					{block.headline}
				</h2>
				{#if block.subheadline}
					<p class="mb-8 text-lg opacity-90">
						{block.subheadline}
					</p>
				{/if}
				{#if block.cta || block.secondaryCta}
					<div class="flex flex-col gap-4 sm:flex-row">
						{#if block.cta}
							<Button href={block.cta.href} variant="secondary" size="lg">
								{block.cta.text}
							</Button>
						{/if}
						{#if block.secondaryCta}
							<Button href={block.secondaryCta.href} variant="outline" size="lg" class="border-primary-foreground bg-transparent text-primary-foreground hover:bg-primary-foreground hover:text-primary">
								{block.secondaryCta.text}
							</Button>
						{/if}
					</div>
				{/if}
			</div>

			<!-- Instructor showcase -->
			{#if block.showInstructors && instructors.length > 0}
				<div class="hidden justify-center lg:flex">
					<div class="flex -space-x-4">
						{#each instructors as instructor, i}
							<div
								class="h-20 w-20 overflow-hidden rounded-full border-4 border-primary shadow-lg"
								style="z-index: {instructors.length - i}"
							>
								<picture>
									{#if toWebpUrl(instructor.image) !== instructor.image}
										<source srcset={toWebpUrl(instructor.image)} type="image/webp" />
									{/if}
									<img
									src={instructor.image}
									alt={instructor.name}
									loading="lazy"
									decoding="async"
									class="h-full w-full object-cover"
								/>
								</picture>
							</div>
						{/each}
						<div class="flex h-20 w-20 items-center justify-center rounded-full border-4 border-primary bg-accent text-accent-foreground shadow-lg">
							<span class="text-lg font-bold">You?</span>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>
</section>
