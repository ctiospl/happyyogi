<script lang="ts">
	import type { PageData } from './$types';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Separator } from '$lib/components/ui/separator';
	import {
		CalendarDays,
		MapPin,
		Users,
		Clock,
		IndianRupee,
		User,
		ChevronDown,
		ChevronUp
	} from '@lucide/svelte';

	let { data }: { data: PageData } = $props();

	let expandedFaqs = $state<Set<number>>(new Set());

	function toggleFaq(index: number) {
		const newSet = new Set(expandedFaqs);
		if (newSet.has(index)) {
			newSet.delete(index);
		} else {
			newSet.add(index);
		}
		expandedFaqs = newSet;
	}

	function formatDate(date: Date | string) {
		return new Date(date).toLocaleDateString('en-IN', {
			weekday: 'long',
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		});
	}

	function formatTime(date: Date | string) {
		return new Date(date).toLocaleTimeString('en-IN', {
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function formatPrice(paise: number) {
		return new Intl.NumberFormat('en-IN', {
			style: 'currency',
			currency: 'INR',
			minimumFractionDigits: 0
		}).format(paise / 100);
	}

	const { workshop, availableCapacity, registrationOpen } = data;
	const faqs = (workshop.faqs as { question: string; answer: string }[]) || [];
	const isSoldOut = availableCapacity === 0;
	const canBook = registrationOpen && !isSoldOut;
</script>

<svelte:head>
	<title>{workshop.seo_title || workshop.title} | {data.tenant.name}</title>
	<meta name="description" content={workshop.seo_description || workshop.description || ''} />
	{#if workshop.og_image_url}
		<meta property="og:image" content={workshop.og_image_url} />
	{/if}
</svelte:head>

<div class="container mx-auto px-4 py-12">
	<div class="mx-auto max-w-4xl">
		<!-- Header -->
		<div class="mb-8">
			<div class="mb-4 flex flex-wrap items-center gap-2">
				<Badge variant={workshop.mode === 'online' ? 'secondary' : 'default'}>
					{workshop.mode}
				</Badge>
				{#if workshop.status === 'draft'}
					<Badge variant="outline">Draft</Badge>
				{/if}
				{#if isSoldOut}
					<Badge variant="destructive">Sold Out</Badge>
				{:else if availableCapacity !== null && availableCapacity <= 5}
					<Badge variant="destructive">Only {availableCapacity} spots left</Badge>
				{/if}
			</div>
			<h1 class="mb-4 text-4xl font-bold">{workshop.title}</h1>
			{#if workshop.instructor}
				<p class="text-muted-foreground flex items-center gap-2 text-lg">
					<User class="h-5 w-5" />
					with <strong>{workshop.instructor.name}</strong>
				</p>
			{/if}
		</div>

		<div class="grid gap-8 lg:grid-cols-3">
			<!-- Main Content -->
			<div class="lg:col-span-2">
				{#if workshop.description}
					<p class="text-muted-foreground mb-8 text-lg">{workshop.description}</p>
				{/if}

				{#if workshop.content_html}
					<div class="prose prose-lg dark:prose-invert mb-8 max-w-none">
						{@html workshop.content_html}
					</div>
				{/if}

				<!-- Schedule -->
				{#if workshop.sessions.length > 0}
					<Card class="mb-8">
						<CardHeader>
							<CardTitle class="flex items-center gap-2">
								<CalendarDays class="h-5 w-5" />
								Schedule
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div class="space-y-4">
								{#each workshop.sessions as session, i}
									<div class="flex items-start gap-4">
										<div
											class="bg-primary/10 text-primary flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full font-semibold"
										>
											{i + 1}
										</div>
										<div class="flex-1">
											{#if session.title}
												<h4 class="font-semibold">{session.title}</h4>
											{/if}
											<p class="text-muted-foreground text-sm">
												{formatDate(session.starts_at)}
											</p>
											<p class="text-muted-foreground flex items-center gap-1 text-sm">
												<Clock class="h-4 w-4" />
												{formatTime(session.starts_at)} - {formatTime(session.ends_at)}
											</p>
										</div>
									</div>
									{#if i < workshop.sessions.length - 1}
										<Separator />
									{/if}
								{/each}
							</div>
						</CardContent>
					</Card>
				{/if}

				<!-- FAQs -->
				{#if faqs.length > 0}
					<Card>
						<CardHeader>
							<CardTitle>Frequently Asked Questions</CardTitle>
						</CardHeader>
						<CardContent>
							<div class="space-y-2">
								{#each faqs as faq, i}
									<div class="border-b last:border-b-0">
										<button
											type="button"
											class="flex w-full items-center justify-between py-4 text-left font-medium"
											onclick={() => toggleFaq(i)}
										>
											{faq.question}
											{#if expandedFaqs.has(i)}
												<ChevronUp class="h-5 w-5 flex-shrink-0" />
											{:else}
												<ChevronDown class="h-5 w-5 flex-shrink-0" />
											{/if}
										</button>
										{#if expandedFaqs.has(i)}
											<p class="text-muted-foreground pb-4">{faq.answer}</p>
										{/if}
									</div>
								{/each}
							</div>
						</CardContent>
					</Card>
				{/if}
			</div>

			<!-- Sidebar -->
			<div class="lg:col-span-1">
				<Card class="sticky top-4">
					<CardContent class="pt-6">
						<div class="mb-6 text-center">
							<div class="mb-2 flex items-center justify-center text-3xl font-bold">
								<IndianRupee class="h-6 w-6" />
								{formatPrice(workshop.price_paise)}
							</div>
							{#if workshop.deposit_amount_paise}
								<p class="text-muted-foreground text-sm">
									{formatPrice(workshop.deposit_amount_paise)} deposit to reserve your spot
								</p>
							{/if}
						</div>

						<div class="mb-6 space-y-3 text-sm">
							{#if workshop.venue_name}
								<div class="flex items-start gap-3">
									<MapPin class="text-muted-foreground mt-0.5 h-4 w-4 flex-shrink-0" />
									<div>
										<p class="font-medium">{workshop.venue_name}</p>
										{#if workshop.venue_address}
											<p class="text-muted-foreground">{workshop.venue_address}</p>
										{/if}
									</div>
								</div>
							{/if}
							{#if workshop.capacity}
								<div class="flex items-center gap-3">
									<Users class="text-muted-foreground h-4 w-4" />
									<span>
										{#if availableCapacity !== null}
											{availableCapacity} of {workshop.capacity} spots available
										{:else}
											{workshop.capacity} spots total
										{/if}
									</span>
								</div>
							{/if}
						</div>

						{#if canBook}
							<Button href="/workshops/{workshop.slug}/book" class="w-full" size="lg">
								Register
							</Button>
						{:else if isSoldOut}
							<Button disabled class="w-full" size="lg" variant="outline">Sold Out</Button>
							<Button href="/workshops/{workshop.slug}/waitlist" variant="ghost" class="mt-2 w-full">
								Join Waitlist
							</Button>
						{:else if !registrationOpen}
							<Button disabled class="w-full" size="lg" variant="outline">
								Registration Closed
							</Button>
						{/if}

						{#if workshop.cancellation_policy}
							<Separator class="my-6" />
							<div class="text-muted-foreground text-xs">
								<p class="mb-1 font-medium">Cancellation Policy</p>
								<p>{workshop.cancellation_policy}</p>
							</div>
						{/if}
					</CardContent>
				</Card>
			</div>
		</div>
	</div>
</div>
