<script lang="ts">
	import type { PageData } from './$types';
	import { aboutPage } from '$lib/content/pages/about';
	import { SEOHead } from '$lib/components/seo';
	import { Card, CardContent } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Heart, BookOpen, Users, Sparkles } from '@lucide/svelte';
	import PageRenderer from '$lib/components/PageRenderer.svelte';

	let { data }: { data: PageData } = $props();

	const useStructured = $derived(data.useStructuredContent && data.structuredContent);

	const story = aboutPage.sections.find((s) => s.type === 'story')!;
	const values = aboutPage.sections.find((s) => s.type === 'values-grid')!;
	const instructors = aboutPage.sections.find((s) => s.type === 'instructor-grid')!;
	const cta = aboutPage.sections.find((s) => s.type === 'cta-banner')!;

	const valueIcons = [Heart, BookOpen, Users, Sparkles];
</script>

<SEOHead
	title={data.seo?.title ?? aboutPage.seo.title}
	description={data.seo?.description ?? aboutPage.seo.description}
/>

{#if useStructured}
	<PageRenderer content={data.structuredContent} extraCss={data.extraCss} />
{:else}

<!-- Hero Section with Image -->
<section class="relative min-h-[60vh] overflow-hidden">
	<div class="absolute inset-0">
		<img
			src="/images/about-hero.jpg"
			alt="Happy Yogi studio atmosphere"
			class="h-full w-full object-cover"
		/>
		<div class="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-transparent"></div>
	</div>
	<div class="container relative z-10 mx-auto flex min-h-[60vh] items-center px-4">
		<div class="max-w-2xl">
			<h1 class="font-display mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
				{aboutPage.title}
			</h1>
			<p class="text-lg text-muted-foreground md:text-xl">
				An Urban Oasis in the Heart of Mumbai
			</p>
		</div>
	</div>
</section>

<!-- Story Section -->
<section class="py-20">
	<div class="container mx-auto px-4">
		<div class="mx-auto max-w-3xl">
			<h2 class="font-display mb-8 text-3xl font-bold text-foreground md:text-4xl">
				{story.heading}
			</h2>
			<div class="space-y-6">
				{#each story.content as paragraph, i (i)}
					<p class="text-lg leading-relaxed text-muted-foreground">
						{paragraph}
					</p>
				{/each}
			</div>
		</div>
	</div>
</section>

<!-- Values Grid -->
<section class="relative overflow-hidden bg-muted/30 py-20">
	<div class="absolute inset-0 opacity-5">
		<img src="/images/abstract-flow.jpg" alt="" class="h-full w-full object-cover" />
	</div>
	<div class="container relative z-10 mx-auto px-4">
		<h2 class="font-display mb-12 text-center text-3xl font-bold text-foreground md:text-4xl">
			{values.heading}
		</h2>
		<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
			{#each values.values as value, i (value.title)}
				{@const Icon = valueIcons[i]}
				<Card class="group transition-all duration-300 hover:-translate-y-1 hover:shadow-lifted">
					<CardContent class="p-6">
						<div class="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground transition-transform group-hover:scale-110">
							<Icon class="h-6 w-6" />
						</div>
						<h3 class="mb-2 text-xl font-semibold text-foreground">
							{value.title}
						</h3>
						<p class="text-muted-foreground">
							{value.description}
						</p>
					</CardContent>
				</Card>
			{/each}
		</div>
	</div>
</section>

<!-- Instructors Section -->
<section class="py-20">
	<div class="container mx-auto px-4">
		<div class="mb-12 text-center">
			<h2 class="font-display mb-4 text-3xl font-bold text-foreground md:text-4xl">
				{instructors.heading}
			</h2>
			<p class="text-lg text-muted-foreground">
				{instructors.subheading}
			</p>
		</div>
		<div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
			{#each instructors.instructors as instructor (instructor.slug)}
				<Card class="overflow-hidden transition-all hover:shadow-lifted">
					<CardContent class="p-6">
						<div class="mb-4 flex justify-center">
							<div class="relative h-32 w-32 overflow-hidden rounded-full border-4 border-primary/20">
								<img
									src={instructor.image}
									alt={instructor.name}
									class="h-full w-full object-cover"
								/>
								<div class="absolute inset-0 rounded-full bg-gradient-to-t from-primary/10 to-transparent"></div>
							</div>
						</div>
						<div class="text-center">
							<h3 class="mb-2 text-xl font-semibold text-foreground">
								{instructor.name}
							</h3>
							<div class="mb-4 flex flex-wrap justify-center gap-2">
								{#each instructor.specializations as spec (spec)}
									<Badge variant="secondary">{spec}</Badge>
								{/each}
							</div>
						</div>
						<p class="mb-4 text-sm leading-relaxed text-muted-foreground">
							{instructor.bio}
						</p>
						<div class="flex flex-wrap gap-1">
							{#each instructor.credentials as credential (credential)}
								<Badge variant="outline" class="text-xs">{credential}</Badge>
							{/each}
						</div>
					</CardContent>
				</Card>
			{/each}
		</div>
	</div>
</section>

<!-- CTA Banner with Background -->
<section class="relative overflow-hidden py-16 md:py-20">
	<div class="absolute inset-0">
		<img src="/images/meditation-hands.jpg" alt="" class="h-full w-full object-cover" />
		<div class="absolute inset-0 bg-gradient-to-r from-primary/95 to-primary/85"></div>
	</div>
	<div class="container relative z-10 mx-auto px-4 text-center text-primary-foreground">
		<h2 class="font-display mb-4 text-3xl font-bold md:text-4xl">
			{cta.heading}
		</h2>
		<p class="mx-auto mb-8 max-w-2xl text-lg opacity-90">
			{cta.subheadline}
		</p>
		<Button
			href={cta.cta.href}
			size="lg"
			class="bg-accent text-accent-foreground hover:bg-accent/90"
		>
			{cta.cta.text}
		</Button>
	</div>
</section>
{/if}
