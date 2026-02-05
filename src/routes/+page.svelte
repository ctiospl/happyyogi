<script lang="ts">
	import type { PageData } from './$types';
	import { homePage } from '$lib/content/pages';
	import { SEOHead } from '$lib/components/seo';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent } from '$lib/components/ui/card';
	import * as Icons from '@lucide/svelte';
	import PageRenderer from '$lib/components/PageRenderer.svelte';

	let { data }: { data: PageData } = $props();

	// Use DB content if available, otherwise fallback to hardcoded
	const useStructured = $derived(data.useStructuredContent && data.structuredContent);

	const hero = homePage.sections.find((s) => s.type === 'hero')!;
	const services = homePage.sections.find((s) => s.type === 'services-grid')!;
	const about = homePage.sections.find((s) => s.type === 'about-snippet')!;
	const testimonials = homePage.sections.find((s) => s.type === 'testimonial-carousel')!;
	const ctaBanner = homePage.sections.find((s) => s.type === 'cta-banner')!;

	const iconMap: Record<string, typeof Icons.Video> = {
		video: Icons.Video,
		users: Icons.Users,
		activity: Icons.Activity,
		user: Icons.User,
		briefcase: Icons.Briefcase,
		calendar: Icons.Calendar
	};

	// Instructor data - default fallback
	const defaultInstructors = [
		{
			name: 'Deepa Rao',
			role: '',
			image: '/images/instructors/deepa-rao.webp',
			specialty: 'Hatha & Vinyasa'
		},
		{
			name: 'Divya Rao',
			role: '',
			image: '/images/instructors/divya-rao.webp',
			specialty: 'Prenatal & Restorative'
		},
		{
			name: 'Vijesh Nair',
			role: '',
			image: '/images/instructors/vijesh-nair.webp',
			specialty: 'Ashtanga & Inversions'
		}
	];
	const instructors = $derived(data.instructors ?? defaultInstructors);
</script>

<SEOHead
	title={data.seo?.title ?? homePage.seo.title}
	description={data.seo?.description ?? homePage.seo.description}
	organization={{
		name: 'Happy Yogi Shaala',
		url: 'https://happyyogi.in',
		description: data.seo?.description ?? homePage.seo.description,
		contactPoint: {
			telephone: '+919820009173',
			contactType: 'customer service',
			areaServed: 'IN',
			availableLanguage: ['English', 'Hindi']
		}
	}}
	localBusiness={{
		name: 'Happy Yogi Shaala',
		url: 'https://happyyogi.in',
		telephone: '+919820009173',
		address: {
			streetAddress: '2nd Floor, Parel Premises, Sayani & Gokhale Road South Junction',
			addressLocality: 'Mumbai',
			addressRegion: 'Maharashtra',
			postalCode: '400025',
			addressCountry: 'IN'
		},
		geo: { latitude: 19.0048, longitude: 72.8366 },
		priceRange: '₹₹'
	}}
/>

{#if useStructured && data.structuredContent}
	<PageRenderer content={data.structuredContent} {instructors} />
{:else}
<!-- Hero Section with Divya Teaching Class -->
<section class="relative min-h-[90vh] overflow-hidden">
	<!-- Background Image - Divya teaching a full class with depth -->
	<div class="absolute inset-0">
		<img
			src="/images/hero-divya-indian.jpg"
			alt="Divya Rao teaching yoga class at Happy Yogi"
			class="h-full w-full object-cover"
		/>
		<div class="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-background/30"></div>
	</div>

	<div class="container relative z-10 mx-auto flex min-h-[90vh] items-center px-4 py-20">
		<div class="max-w-2xl">
			<h1 class="mb-6 text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
				{@html hero.headline}
			</h1>
			<p class="mb-8 text-lg text-muted-foreground md:text-xl">
				{hero.subheadline}
			</p>
			<div class="flex flex-col gap-4 sm:flex-row">
				<Button href={hero.cta.href} size="lg" class="text-lg">
					{hero.cta.text}
				</Button>
				<Button href={hero.secondaryCta.href} variant="outline" size="lg" class="text-lg">
					{hero.secondaryCta.text}
				</Button>
			</div>
			<p class="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
				<Icons.MapPin class="h-4 w-4 text-primary" />
				{hero.location}
			</p>
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

<!-- Services Section with Deepa Teaching Image -->
<section class="py-16 md:py-24">
	<div class="container mx-auto px-4">
		<div class="mb-12 text-center">
			<h2 class="mb-4 text-3xl font-bold text-foreground md:text-4xl">
				{services.headline}
			</h2>
			<p class="text-lg text-muted-foreground">{services.subheadline}</p>
		</div>

		<div class="grid gap-8 lg:grid-cols-2 lg:gap-12">
			<!-- Services Cards -->
			<div class="grid gap-4 sm:grid-cols-2">
				{#each services.services as service}
					{@const Icon = iconMap[service.icon] || Icons.Circle}
					<Card class="group transition-all hover:shadow-lifted hover:-translate-y-1">
						<CardContent class="p-6">
							<div class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
								<Icon class="h-6 w-6" />
							</div>
							<h3 class="mb-2 text-lg font-semibold text-foreground">
								{service.title}
							</h3>
							<p class="text-sm text-muted-foreground">
								{service.description}
							</p>
						</CardContent>
					</Card>
				{/each}
			</div>

			<!-- Featured Image - Deepa teaching -->
			<div class="relative hidden lg:block">
				<div class="absolute -inset-4 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 blur-2xl"></div>
				<img
					src="/images/deepa-teaching.jpg"
					alt="Deepa Rao demonstrating tree pose"
					class="relative rounded-2xl object-cover shadow-lifted"
				/>
			</div>
		</div>
	</div>
</section>

<!-- About Section - Vijesh in Action -->
<section class="relative overflow-hidden bg-muted/30 py-16 md:py-24">
	<div class="container relative z-10 mx-auto px-4">
		<div class="grid items-center gap-12 lg:grid-cols-2">
			<!-- Vijesh Image -->
			<div class="relative">
				<div class="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-accent/30 to-primary/30 blur-3xl"></div>
				<div class="relative overflow-hidden rounded-2xl shadow-lifted">
					<img
						src="/images/vijesh-pose.jpg"
						alt="Vijesh Nair demonstrating handstand"
						class="w-full"
					/>
				</div>
				<!-- Floating stats card -->
				<div class="absolute -bottom-6 -right-6 rounded-xl bg-card p-4 shadow-lifted">
					<div class="flex items-center gap-4">
						<div class="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
							<Icons.Users class="h-6 w-6 text-primary" />
						</div>
						<div>
							<p class="text-2xl font-bold text-foreground">500+</p>
							<p class="text-sm text-muted-foreground">Happy Students</p>
						</div>
					</div>
				</div>
			</div>

			<!-- Content -->
			<div>
				<h2 class="mb-6 text-3xl font-bold text-foreground md:text-4xl">
					{about.headline}
				</h2>
				<p class="mb-8 text-lg text-muted-foreground">
					{about.content}
				</p>
				<ul class="mb-8 space-y-3">
					{#each about.highlights as highlight}
						<li class="flex items-center gap-3 text-foreground">
							<span class="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
								<Icons.Check class="h-4 w-4 text-primary" />
							</span>
							{highlight}
						</li>
					{/each}
				</ul>
				<Button href={about.cta.href} variant="outline" size="lg">
					{about.cta.text}
				</Button>
			</div>
		</div>
	</div>
</section>

<!-- Meet Our Instructors Section -->
<section class="py-16 md:py-24">
	<div class="container mx-auto px-4">
		<div class="mb-12 text-center">
			<h2 class="mb-4 text-3xl font-bold text-foreground md:text-4xl">
				Meet Your Guides
			</h2>
			<p class="text-lg text-muted-foreground">Experienced instructors dedicated to your yoga journey</p>
		</div>

		<div class="grid gap-8 md:grid-cols-3">
			{#each instructors as instructor}
				<div class="group text-center">
					<div class="relative mx-auto mb-4 h-64 w-64 overflow-hidden rounded-2xl shadow-soft">
						<img
							src={instructor.image}
							alt={instructor.name}
							class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
						/>
						<div class="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>
						<div class="absolute bottom-0 left-0 right-0 p-4 text-white opacity-0 transition-opacity group-hover:opacity-100">
							<p class="text-sm font-medium">{instructor.specialty}</p>
						</div>
					</div>
					<h3 class="text-xl font-semibold text-foreground">{instructor.name}</h3>
					{#if instructor.role}
						<p class="text-muted-foreground">{instructor.role}</p>
					{/if}
				</div>
			{/each}
		</div>

		<div class="mt-10 text-center">
			<Button href="/about-us" variant="outline" size="lg">
				Learn More About Us
			</Button>
		</div>
	</div>
</section>

<!-- Testimonials Section -->
<section class="bg-muted/30 py-16 md:py-24">
	<div class="container mx-auto px-4">
		<h2 class="mb-12 text-center text-3xl font-bold text-foreground md:text-4xl">
			{testimonials.headline}
		</h2>
		<div class="grid gap-6 md:grid-cols-3">
			{#each testimonials.testimonials as testimonial}
				<Card class="relative overflow-hidden">
					<div class="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-primary/5"></div>
					<CardContent class="relative p-6">
						<Icons.Quote class="mb-4 h-8 w-8 text-primary/30" />
						<p class="mb-4 italic text-muted-foreground">
							"{testimonial.quote}"
						</p>
						<div class="flex items-center gap-3">
							<div class="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground">
								<Icons.User class="h-5 w-5" />
							</div>
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

<!-- CTA Banner with Divya Meditation -->
<section class="relative overflow-hidden py-16 md:py-24">
	<!-- Background Image - Divya meditation -->
	<div class="absolute inset-0">
		<img
			src="/images/divya-meditation.jpg"
			alt="Divya Rao leading meditation"
			class="h-full w-full object-cover"
		/>
		<div class="absolute inset-0 bg-primary/85"></div>
	</div>

	<div class="container relative z-10 mx-auto px-4">
		<div class="grid items-center gap-8 lg:grid-cols-2">
			<div class="text-primary-foreground">
				<h2 class="mb-4 text-3xl font-bold md:text-4xl">
					{ctaBanner.headline}
				</h2>
				<p class="mb-8 text-lg opacity-90">
					{ctaBanner.subheadline}
				</p>
				<div class="flex flex-col gap-4 sm:flex-row">
					<Button href={ctaBanner.cta.href} variant="secondary" size="lg">
						{ctaBanner.cta.text}
					</Button>
					<Button href={ctaBanner.secondaryCta.href} variant="outline" size="lg" class="border-primary-foreground bg-transparent text-primary-foreground hover:bg-primary-foreground hover:text-primary">
						{ctaBanner.secondaryCta.text}
					</Button>
				</div>
			</div>

			<!-- Instructor showcase -->
			<div class="hidden justify-center lg:flex">
				<div class="flex -space-x-4">
					{#each instructors as instructor, i}
						<div
							class="h-20 w-20 overflow-hidden rounded-full border-4 border-primary shadow-lg"
							style="z-index: {instructors.length - i}"
						>
							<img
								src={instructor.image}
								alt={instructor.name}
								class="h-full w-full object-cover"
							/>
						</div>
					{/each}
					<div class="flex h-20 w-20 items-center justify-center rounded-full border-4 border-primary bg-accent text-accent-foreground shadow-lg">
						<span class="text-lg font-bold">You?</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>
{/if}
