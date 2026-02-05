<script lang="ts">
	import type { PageData } from './$types';
	import { servicesPage } from '$lib/content/pages/services';
	import { SEOHead } from '$lib/components/seo';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card';
	import * as Icons from '@lucide/svelte';
	import PageRenderer from '$lib/components/PageRenderer.svelte';

	let { data }: { data: PageData } = $props();

	const useStructured = $derived(data.useStructuredContent && data.structuredContent);

	const { seo, sections } = servicesPage;
	const { hero, services, schedule, cta } = sections;

	const iconMap: Record<string, typeof Icons.Video> = {
		video: Icons.Video,
		users: Icons.Users,
		activity: Icons.Activity,
		home: Icons.Home,
		briefcase: Icons.Briefcase,
		calendar: Icons.Calendar
	};

	// Map service icons to images
	const serviceImages: Record<string, string> = {
		video: '/images/online-class.jpg',
		briefcase: '/images/corporate-yoga.jpg',
		users: '/images/group-class.jpg'
	};
</script>

<SEOHead
	title={data.seo?.title ?? seo.title}
	description={data.seo?.description ?? seo.description}
	ogImage={seo.ogImage}
/>

{#if useStructured}
	<PageRenderer content={data.structuredContent} />
{:else}

<!-- Hero Section with Image -->
<section class="relative min-h-[60vh] overflow-hidden">
	<div class="absolute inset-0">
		<img
			src="/images/services-hero.jpg"
			alt="Yoga class in session"
			class="h-full w-full object-cover"
		/>
		<div class="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/30"></div>
	</div>
	<div class="container relative z-10 mx-auto flex min-h-[60vh] items-center justify-center px-4">
		<div class="max-w-3xl text-center">
			<h1 class="mb-6 text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
				{hero.headline}
			</h1>
			<p class="text-lg text-muted-foreground md:text-xl">
				{hero.tagline}
			</p>
		</div>
	</div>
	<!-- Decorative wave -->
	<div class="absolute bottom-0 left-0 right-0">
		<svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full">
			<path
				d="M0 120L60 110C120 100 240 80 360 75C480 70 600 80 720 85C840 90 960 90 1080 85C1200 80 1320 70 1380 65L1440 60V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
				class="fill-background"
			/>
		</svg>
	</div>
</section>

<!-- Services Grid -->
<section class="py-16 md:py-24">
	<div class="container mx-auto px-4">
		<div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
			{#each services as service (service.id)}
				{@const Icon = iconMap[service.icon] || Icons.Circle}
				{@const hasImage = serviceImages[service.icon]}
				<Card class="group overflow-hidden rounded-xl shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lifted">
					{#if hasImage}
						<div class="relative h-40 overflow-hidden">
							<img
								src={hasImage}
								alt={service.title}
								class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
							/>
							<div class="absolute inset-0 bg-gradient-to-t from-card to-transparent"></div>
						</div>
					{/if}
					<CardHeader class={hasImage ? 'pb-2 pt-4' : 'pb-2'}>
						{#if !hasImage}
							<div class="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
								<Icon class="h-6 w-6" />
							</div>
						{/if}
						<CardTitle class="text-xl">{service.title}</CardTitle>
						{#if service.highlight}
							<span class="inline-block w-fit rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
								{service.highlight}
							</span>
						{/if}
					</CardHeader>
					<CardContent>
						<CardDescription class="mb-4 text-base">
							{service.description}
						</CardDescription>
						{#if service.schedule}
							<p class="flex items-center gap-2 text-sm text-muted-foreground">
								<Icons.Clock class="h-4 w-4 text-primary" />
								{service.schedule}
							</p>
						{/if}
					</CardContent>
				</Card>
			{/each}
		</div>
	</div>
</section>

<!-- Schedule Section -->
<section class="relative overflow-hidden bg-muted/30 py-16 md:py-24">
	<div class="absolute inset-0 opacity-5">
		<img src="/images/abstract-flow.jpg" alt="" class="h-full w-full object-cover" />
	</div>
	<div class="container relative z-10 mx-auto px-4">
		<h2 class="mb-12 text-center text-3xl font-bold text-foreground md:text-4xl">
			{schedule.title}
		</h2>
		<div class="mx-auto max-w-4xl overflow-hidden rounded-xl bg-card shadow-lifted">
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead>
						<tr class="border-b bg-primary/5">
							<th class="px-6 py-4 text-left text-sm font-semibold text-foreground">Day</th>
							<th class="px-6 py-4 text-left text-sm font-semibold text-foreground">Time</th>
							<th class="px-6 py-4 text-left text-sm font-semibold text-foreground">Class</th>
							<th class="px-6 py-4 text-left text-sm font-semibold text-foreground">Location</th>
						</tr>
					</thead>
					<tbody>
						{#each schedule.items as item, i (item.day)}
							<tr class="border-b last:border-b-0 transition-colors hover:bg-primary/5 {i % 2 === 1 ? 'bg-muted/30' : ''}">
								<td class="px-6 py-4 font-medium text-foreground">{item.day}</td>
								<td class="px-6 py-4 text-muted-foreground">{item.time}</td>
								<td class="px-6 py-4 text-foreground">{item.class}</td>
								<td class="px-6 py-4 text-muted-foreground">
									<span class="inline-flex items-center gap-1">
										<Icons.MapPin class="h-4 w-4 text-primary" />
										{item.location}
									</span>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>
</section>

<!-- CTA Section -->
<section class="py-16 md:py-24">
	<div class="container mx-auto px-4">
		<div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-accent/10 to-primary/10 p-8 md:p-12">
			<div class="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl"></div>
			<div class="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-accent/10 blur-3xl"></div>
			<div class="relative z-10 mx-auto max-w-2xl text-center">
				<h2 class="mb-4 text-3xl font-bold text-foreground md:text-4xl">
					{cta.title}
				</h2>
				<p class="mb-8 text-lg text-muted-foreground">
					{cta.description}
				</p>
				<div class="flex flex-col justify-center gap-4 sm:flex-row">
					<Button href={cta.primaryButton.href} size="lg" class="bg-primary hover:bg-primary/90">
						{cta.primaryButton.label}
					</Button>
					{#if cta.secondaryButton}
						<Button href={cta.secondaryButton.href} variant="outline" size="lg">
							{cta.secondaryButton.label}
						</Button>
					{/if}
				</div>
			</div>
		</div>
	</div>
</section>
{/if}
