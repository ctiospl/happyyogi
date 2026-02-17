<script lang="ts">
	import type { InstructorGridBlock } from '$lib/types';
	import { Button } from '$lib/components/ui/button';
	import { toWebpUrl } from '$lib/utils/image.js';

	interface Props {
		block: InstructorGridBlock;
	}

	let { block }: Props = $props();
</script>

<section class="py-16 md:py-24">
	<div class="container mx-auto px-4">
		<div class="mb-12 text-center">
			<h2 class="mb-4 text-3xl font-bold text-foreground md:text-4xl">
				{block.heading}
			</h2>
			{#if block.subheading}
				<p class="text-lg text-muted-foreground">{block.subheading}</p>
			{/if}
		</div>

		<div class="grid gap-8 md:grid-cols-3">
			{#each block.instructors as instructor}
				<div class="group text-center">
					<div class="relative mx-auto mb-4 h-64 w-64 overflow-hidden rounded-2xl shadow-soft">
						<picture>
							{#if toWebpUrl(instructor.image) !== instructor.image}
								<source srcset={toWebpUrl(instructor.image)} type="image/webp" />
							{/if}
							<img
							src={instructor.image}
							alt={instructor.name}
							loading="lazy"
							decoding="async"
							class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
						/>
						</picture>
						<div class="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>
						{#if instructor.specialty}
							<div class="absolute bottom-0 left-0 right-0 p-4 text-white opacity-0 transition-opacity group-hover:opacity-100">
								<p class="text-sm font-medium">{instructor.specialty}</p>
							</div>
						{/if}
					</div>
					<h3 class="text-xl font-semibold text-foreground">{instructor.name}</h3>
					{#if instructor.role}
						<p class="text-muted-foreground">{instructor.role}</p>
					{/if}
				</div>
			{/each}
		</div>

		{#if block.cta}
			<div class="mt-10 text-center">
				<Button href={block.cta.href} variant="outline" size="lg">
					{block.cta.text}
				</Button>
			</div>
		{/if}
	</div>
</section>
