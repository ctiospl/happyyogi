<script lang="ts">
	interface Testimonial {
		quote: string;
		author: string;
		role?: string;
		avatar?: string;
	}

	interface Props {
		headline: string;
		testimonials: Testimonial[];
	}

	let { headline = 'What Our Clients Say', testimonials = [] }: Props = $props();
</script>

<section class="bg-muted/30 px-4 py-16">
	<div class="container mx-auto">
		<h2 class="mb-12 text-center text-3xl font-bold text-foreground md:text-4xl">
			{headline}
		</h2>

		<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
			{#each testimonials as testimonial}
				<div class="card relative overflow-hidden">
					<div class="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-primary/5"></div>
					<div class="relative p-6">
						<svg
							class="mb-4 h-8 w-8 text-primary opacity-30"
							viewBox="0 0 24 24"
							fill="currentColor"
						>
							<path
								d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"
							/>
						</svg>
						<p class="mb-4 italic text-muted-foreground">"{testimonial.quote}"</p>
						<div class="flex items-center gap-3">
							{#if testimonial.avatar}
								<img
									src={testimonial.avatar}
									alt={testimonial.author}
									class="h-10 w-10 rounded-full object-cover"
								/>
							{:else}
								<div
									class="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent"
								>
									<svg class="h-5 w-5 text-primary-foreground" viewBox="0 0 24 24" fill="currentColor">
										<path
											d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
										/>
									</svg>
								</div>
							{/if}
							<div>
								<p class="font-semibold text-foreground">{testimonial.author}</p>
								{#if testimonial.role}
									<p class="text-sm text-muted-foreground">{testimonial.role}</p>
								{/if}
							</div>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>
