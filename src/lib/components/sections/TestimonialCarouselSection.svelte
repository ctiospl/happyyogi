<script lang="ts">
	import type { TestimonialCarouselBlock } from '$lib/types';
	import { Card, CardContent } from '$lib/components/ui/card';
	import { Quote, User } from '@lucide/svelte';
	import { toWebpUrl } from '$lib/utils/image.js';

	interface Props {
		block: TestimonialCarouselBlock;
	}

	let { block }: Props = $props();
</script>

<section class="bg-muted/30 py-16 md:py-24">
	<div class="container mx-auto px-4">
		<h2 class="mb-12 text-center text-3xl font-bold text-foreground md:text-4xl">
			{block.headline}
		</h2>
		<div class="grid gap-6 md:grid-cols-3">
			{#each block.testimonials as testimonial}
				<Card class="relative overflow-hidden">
					<div class="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-primary/5"></div>
					<CardContent class="relative p-6">
						<Quote class="mb-4 h-8 w-8 text-primary/30" />
						<p class="mb-4 italic text-muted-foreground">
							"{testimonial.quote}"
						</p>
						<div class="flex items-center gap-3">
							{#if testimonial.avatar}
								<picture>
									{#if toWebpUrl(testimonial.avatar) !== testimonial.avatar}
										<source srcset={toWebpUrl(testimonial.avatar)} type="image/webp" />
									{/if}
									<img
									src={testimonial.avatar}
									alt={testimonial.author}
									loading="lazy"
									decoding="async"
									class="h-10 w-10 rounded-full object-cover"
								/>
								</picture>
							{:else}
								<div class="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground">
									<User class="h-5 w-5" />
								</div>
							{/if}
							<div>
								<p class="font-semibold text-foreground">{testimonial.author}</p>
								<p class="text-sm text-muted-foreground">{testimonial.role}</p>
							</div>
						</div>
					</CardContent>
				</Card>
			{/each}
		</div>
	</div>
</section>
