<script lang="ts">
	import type { PageData } from './$types';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { CalendarDays, MapPin, Users, Clock, IndianRupee } from '@lucide/svelte';

	let { data }: { data: PageData } = $props();

	function formatDate(date: Date | string) {
		return new Date(date).toLocaleDateString('en-IN', {
			weekday: 'short',
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	}

	function formatPrice(paise: number) {
		return new Intl.NumberFormat('en-IN', {
			style: 'currency',
			currency: 'INR',
			minimumFractionDigits: 0
		}).format(paise / 100);
	}

	function getWorkshopDates(workshop: (typeof data.workshops)[0]) {
		if (workshop.sessions.length === 0) return null;
		const first = workshop.sessions[0];
		const last = workshop.sessions[workshop.sessions.length - 1];
		if (first.starts_at === last.starts_at) {
			return formatDate(first.starts_at);
		}
		return `${formatDate(first.starts_at)} - ${formatDate(last.ends_at)}`;
	}
</script>

<svelte:head>
	<title>Workshops | {data.tenant.name}</title>
	<meta name="description" content="Explore our upcoming yoga workshops and retreats" />
</svelte:head>

<!-- Hero Section with Image -->
<section class="relative min-h-[50vh] overflow-hidden">
	<div class="absolute inset-0">
		<img
			src="/images/workshops-hero.jpg"
			alt="Yoga workshop in progress"
			class="h-full w-full object-cover"
		/>
		<div class="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30"></div>
	</div>
	<div class="container relative z-10 mx-auto flex min-h-[50vh] items-center justify-center px-4">
		<div class="text-center">
			<h1 class="mb-4 text-4xl font-bold text-foreground md:text-5xl">Upcoming Workshops</h1>
			<p class="text-muted-foreground mx-auto max-w-2xl text-lg md:text-xl">
				Join us for transformative yoga experiences led by our expert instructors
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

<!-- Workshops Grid -->
<div class="container mx-auto px-4 py-12">
	{#if data.workshops.length === 0}
		<div class="py-20 text-center">
			<div class="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
				<CalendarDays class="h-12 w-12 text-muted-foreground" />
			</div>
			<p class="text-muted-foreground text-lg">No workshops scheduled at the moment.</p>
			<p class="text-muted-foreground mt-2">Check back soon for new offerings!</p>
		</div>
	{:else}
		<div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
			{#each data.workshops as workshop}
				{@const dates = getWorkshopDates(workshop)}
				{@const available = workshop.capacity ? workshop.capacity - (workshop.bookings_count || 0) : null}
				<Card class="group flex flex-col overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lifted">
					<!-- Workshop Image Placeholder with Gradient -->
					<div class="relative h-40 bg-gradient-to-br from-primary/20 via-accent/20 to-primary/10">
						<div class="absolute inset-0 flex items-center justify-center">
							<CalendarDays class="h-16 w-16 text-primary/30" />
						</div>
						{#if available !== null && available <= 5 && available > 0}
							<Badge variant="destructive" class="absolute right-3 top-3">Only {available} spots left</Badge>
						{:else if available === 0}
							<Badge variant="outline" class="absolute right-3 top-3 bg-card">Sold Out</Badge>
						{/if}
					</div>
					<CardHeader class="pb-2">
						<div class="mb-2 flex items-center gap-2">
							<Badge variant={workshop.mode === 'online' ? 'secondary' : 'default'}>
								{workshop.mode}
							</Badge>
						</div>
						<CardTitle class="line-clamp-2">{workshop.title}</CardTitle>
						{#if workshop.instructor}
							<CardDescription>with {workshop.instructor.name}</CardDescription>
						{/if}
					</CardHeader>
					<CardContent class="flex-1">
						{#if workshop.description}
							<p class="text-muted-foreground mb-4 line-clamp-3">{workshop.description}</p>
						{/if}
						<div class="text-muted-foreground space-y-2 text-sm">
							{#if dates}
								<div class="flex items-center gap-2">
									<CalendarDays class="h-4 w-4 text-primary" />
									<span>{dates}</span>
								</div>
							{/if}
							{#if workshop.venue_name}
								<div class="flex items-center gap-2">
									<MapPin class="h-4 w-4 text-primary" />
									<span>{workshop.venue_name}</span>
								</div>
							{/if}
							{#if workshop.capacity}
								<div class="flex items-center gap-2">
									<Users class="h-4 w-4 text-primary" />
									<span>{available !== null ? `${available} of ${workshop.capacity}` : workshop.capacity} spots</span>
								</div>
							{/if}
						</div>
					</CardContent>
					<CardFooter class="flex items-center justify-between border-t pt-4">
						<div class="flex items-center text-lg font-semibold text-foreground">
							<IndianRupee class="h-4 w-4" />
							{formatPrice(workshop.price_paise)}
						</div>
						<Button href="/workshops/{workshop.slug}" variant={available === 0 ? 'outline' : 'default'}>
							{available === 0 ? 'View Details' : 'Register'}
						</Button>
					</CardFooter>
				</Card>
			{/each}
		</div>
	{/if}
</div>
