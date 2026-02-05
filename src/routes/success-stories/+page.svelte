<script lang="ts">
	import type { PageData } from './$types';
	import { SEOHead } from '$lib/components/seo';
	import { testimonialsPage } from '$lib/content/pages/testimonials';
	import { Badge } from '$lib/components/ui/badge';
	import { Quote } from '@lucide/svelte';
	import PageRenderer from '$lib/components/PageRenderer.svelte';

	let { data }: { data: PageData } = $props();

	const useStructured = $derived(data.useStructuredContent && data.structuredContent);

	const { seo, testimonials } = testimonialsPage;

	function getInitials(name: string): string {
		return name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase();
	}

	function getServiceColor(service: string): 'default' | 'secondary' | 'outline' {
		switch (service) {
			case 'online':
				return 'secondary';
			case 'corporate':
				return 'default';
			default:
				return 'outline';
		}
	}

	function getServiceLabel(service: string): string {
		switch (service) {
			case 'online':
				return 'Online Classes';
			case 'in-person':
				return 'In-Person';
			case 'corporate':
				return 'Corporate Wellness';
			default:
				return service;
		}
	}
</script>

<SEOHead
	title={data.seo?.title ?? seo.title}
	description={data.seo?.description ?? seo.description}
/>

{#if useStructured}
	<PageRenderer content={data.structuredContent} />
{:else}
<!-- Hero Section with Image -->
<section class="relative min-h-[50vh] overflow-hidden">
	<div class="absolute inset-0">
		<img
			src="/images/success-stories-hero.jpg"
			alt="Yoga transformation journey"
			class="h-full w-full object-cover"
		/>
		<div class="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/40"></div>
	</div>
	<div class="container relative z-10 mx-auto flex min-h-[50vh] items-center justify-center px-4 text-center">
		<div>
			<h1 class="text-foreground mb-4 text-4xl font-bold md:text-5xl">Success Stories</h1>
			<p class="text-muted-foreground mx-auto max-w-2xl text-lg md:text-xl">
				Real transformations from our community. Discover how yoga has changed lives through
				dedication, practice, and the right guidance.
			</p>
		</div>
	</div>
	<!-- Decorative wave -->
	<div class="absolute bottom-0 left-0 right-0">
		<svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full">
			<path
				d="M0 80L48 74.7C96 69 192 59 288 53.3C384 48 480 48 576 53.3C672 59 768 69 864 69.3C960 69 1056 59 1152 53.3C1248 48 1344 48 1392 48L1440 48V80H1392C1344 80 1248 80 1152 80C1056 80 960 80 864 80C768 80 672 80 576 80C480 80 384 80 288 80C192 80 96 80 48 80H0Z"
				class="fill-background"
			/>
		</svg>
	</div>
</section>

<!-- Testimonials Grid -->
<section class="py-16">
	<div class="container mx-auto px-4">
		<div class="columns-1 gap-6 md:columns-2 lg:columns-3">
			{#each testimonials as testimonial, i (testimonial.name)}
				<article
					class="bg-card mb-6 break-inside-avoid rounded-xl p-6 shadow-soft transition-all hover:shadow-lifted hover:-translate-y-1"
					style="animation: fadeInUp 0.5s ease-out {i * 0.1}s both"
				>
					<!-- Quote Icon -->
					<div class="bg-primary/10 mb-4 inline-flex rounded-full p-2">
						<Quote class="text-primary h-5 w-5" />
					</div>

					<!-- Quote Text -->
					<blockquote class="text-foreground mb-6 text-base leading-relaxed">
						"{testimonial.quote}"
					</blockquote>

					<!-- Service Badge -->
					<div class="mb-4">
						<Badge variant={getServiceColor(testimonial.service)}>
							{getServiceLabel(testimonial.service)}
						</Badge>
					</div>

					<!-- Author Footer -->
					<footer class="flex items-center gap-3">
						<!-- Avatar with Initials -->
						<div
							class="bg-gradient-to-br from-primary to-accent text-primary-foreground flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium"
						>
							{getInitials(testimonial.name)}
						</div>

						<div>
							<p class="text-foreground font-medium">{testimonial.name}</p>
							<p class="text-muted-foreground text-sm">
								{testimonial.role} &middot; {testimonial.duration}
							</p>
						</div>
					</footer>
				</article>
			{/each}
		</div>
	</div>
</section>

<!-- CTA Section -->
<section class="relative overflow-hidden py-16">
	<div class="absolute inset-0">
		<img src="/images/meditation-hands.jpg" alt="" class="h-full w-full object-cover" />
		<div class="absolute inset-0 bg-primary/90"></div>
	</div>
	<div class="container relative z-10 mx-auto px-4 text-center text-primary-foreground">
		<h2 class="mb-4 text-3xl font-bold md:text-4xl">Start Your Transformation</h2>
		<p class="mb-8 mx-auto max-w-2xl text-lg opacity-90">
			Join our community and write your own success story. Your journey to wellness begins with a single step.
		</p>
		<a
			href="/contact"
			class="inline-flex items-center justify-center rounded-xl bg-accent px-8 py-3 text-lg font-medium text-accent-foreground transition-colors hover:bg-accent/90"
		>
			Begin Your Journey
		</a>
	</div>
</section>
{/if}

<style>
	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
