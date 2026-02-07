<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import type { FormFieldDef, FormConditionalRule, FormSettings } from '$lib/server/db/schema';
	import { contactPage } from '$lib/content/pages/contact';
	import { SEOHead } from '$lib/components/seo';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent } from '$lib/components/ui/card';
	import { Phone, Mail, Instagram, MapPin, Clock } from '@lucide/svelte';
	import PageRenderer from '$lib/components/PageRenderer.svelte';
	import FormRenderer from '$lib/components/forms/FormRenderer.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const useStructured = $derived(data.useStructuredContent && data.structuredContent);

	const hero = contactPage.sections.find((s) => s.type === 'hero') as {
		type: 'hero';
		tagline: string;
		heading: string;
		subheading: string;
	};
	const contactInfo = contactPage.sections.find((s) => s.type === 'contact-info') as {
		type: 'contact-info';
		cards: Array<{
			icon: string;
			title: string;
			items: Array<{ label: string; value: string; href: string }>;
		}>;
	};
	const location = contactPage.sections.find((s) => s.type === 'location') as {
		type: 'location';
		heading: string;
		address: {
			name: string;
			lines: string[];
			landmark?: string;
		};
	};
	const contactFormContent = contactPage.sections.find((s) => s.type === 'contact-form') as {
		type: 'contact-form';
		heading: string;
		subheading: string;
		fields: Array<{
			name: string;
			label: string;
			type: string;
			placeholder: string;
			required: boolean;
		}>;
		submitLabel: string;
	};
	const hours = contactPage.sections.find((s) => s.type === 'hours') as {
		type: 'hours';
		heading: string;
		schedule: Array<{ day: string; hours: string }>;
		note?: string;
	};

	const iconMap: Record<string, typeof Phone> = {
		phone: Phone,
		mail: Mail,
		instagram: Instagram
	};

	function parseJson<T>(raw: unknown, fallback: T): T {
		if (!raw) return fallback;
		if (typeof raw === 'string') {
			try { return JSON.parse(raw); } catch { return fallback; }
		}
		return raw as T;
	}

	const dbForm = $derived(data.contactForm);
	const fields = $derived(dbForm ? parseJson<FormFieldDef[]>(dbForm.fields, []) : []);
	const settings = $derived(dbForm ? parseJson<FormSettings>(dbForm.settings, {}) : {});
	const conditionalRules = $derived(dbForm ? parseJson<FormConditionalRule[]>(dbForm.conditional_rules, []) : []);
</script>

<SEOHead
	title={data.seo?.title ?? contactPage.seo.title}
	description={data.seo?.description ?? contactPage.seo.description}
/>

{#if useStructured}
	<PageRenderer content={data.structuredContent} />
{:else}
<!-- Hero Section with Image -->
<section class="relative min-h-[50vh] overflow-hidden">
	<div class="absolute inset-0">
		<img
			src="/images/contact-studio.jpg"
			alt="Happy Yogi studio entrance"
			class="h-full w-full object-cover"
		/>
		<div class="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/40"></div>
	</div>
	<div class="container relative z-10 mx-auto flex min-h-[50vh] items-center justify-center px-4 text-center">
		<div>
			<p class="mb-2 text-sm font-medium uppercase tracking-wider text-primary">{hero.tagline}</p>
			<h1 class="mb-4 text-4xl font-bold text-foreground md:text-5xl">{hero.heading}</h1>
			<p class="mx-auto max-w-2xl text-lg text-muted-foreground">{hero.subheading}</p>
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

<!-- Main Content: Form + Info -->
<section class="py-16 md:py-24">
	<div class="container mx-auto px-4">
		<div class="grid gap-12 lg:grid-cols-2">
			<!-- Contact Form -->
			<div>
				<h2 class="mb-2 text-2xl font-bold text-foreground">{contactFormContent.heading}</h2>
				<p class="mb-8 text-muted-foreground">{contactFormContent.subheading}</p>

				{#if dbForm}
					{#if form?.success}
						<div class="py-8 text-center">
							<div class="mb-2 text-2xl">&#10003;</div>
							<p class="text-lg font-medium">
								{settings.success_message ?? "Thank you! We'll get back to you shortly."}
							</p>
						</div>
					{:else}
						<FormRenderer
							formId={dbForm.id}
							{fields}
							{settings}
							{conditionalRules}
							submitMethod="form"
						/>
					{/if}
				{:else}
					<!-- Fallback: hardcoded form when DB form not available -->
					<form method="POST" class="space-y-6">
						{#each contactFormContent.fields as field (field.name)}
							<div class="relative">
								{#if field.type === 'textarea'}
									<textarea
										name={field.name}
										id={field.name}
										required={field.required}
										placeholder=" "
										rows={4}
										class="peer w-full resize-none rounded-xl border border-input bg-card px-4 pt-6 pb-2 text-foreground placeholder-transparent shadow-soft transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
									></textarea>
								{:else}
									<input
										type={field.type}
										name={field.name}
										id={field.name}
										required={field.required}
										placeholder=" "
										class="peer w-full rounded-xl border border-input bg-card px-4 pt-6 pb-2 text-foreground placeholder-transparent shadow-soft transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
									/>
								{/if}
								<label
									for={field.name}
									class="pointer-events-none absolute left-4 top-4 origin-left text-muted-foreground transition-all peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-2 peer-focus:scale-75 peer-focus:text-primary peer-[:not(:placeholder-shown)]:-translate-y-2 peer-[:not(:placeholder-shown)]:scale-75"
								>
									{field.label}{#if field.required}<span class="text-destructive">*</span>{/if}
								</label>
							</div>
						{/each}

						<Button type="submit" size="lg" class="w-full bg-accent text-accent-foreground hover:bg-accent/90">
							{contactFormContent.submitLabel}
						</Button>
					</form>
				{/if}
			</div>

			<!-- Contact Info Cards -->
			<div class="space-y-6">
				{#each contactInfo.cards as card (card.icon)}
					{@const Icon = iconMap[card.icon] || Phone}
					<Card class="transition-all hover:shadow-lifted">
						<CardContent class="flex items-start gap-4 p-6">
							<div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
								<Icon class="h-6 w-6 text-primary" />
							</div>
							<div>
								<h3 class="mb-2 font-semibold text-foreground">{card.title}</h3>
								{#each card.items as item (item.href)}
									<div class="mb-1">
										<span class="text-sm text-muted-foreground">{item.label}: </span>
										<a
											href={item.href}
											class="text-foreground transition-colors hover:text-primary"
											target={item.href.startsWith('http') ? '_blank' : undefined}
											rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
										>
											{item.value}
										</a>
									</div>
								{/each}
							</div>
						</CardContent>
					</Card>
				{/each}

				<!-- Location Card -->
				<Card class="transition-all hover:shadow-lifted">
					<CardContent class="flex items-start gap-4 p-6">
						<div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
							<MapPin class="h-6 w-6 text-primary" />
						</div>
						<div>
							<h3 class="mb-2 font-semibold text-foreground">{location.heading}</h3>
							<p class="font-medium text-foreground">{location.address.name}</p>
							{#each location.address.lines as line, i (i)}
								<p class="text-muted-foreground">{line}</p>
							{/each}
							{#if location.address.landmark}
								<p class="mt-2 text-sm text-muted-foreground">
									<span class="font-medium">Landmark:</span>
									{location.address.landmark}
								</p>
							{/if}
						</div>
					</CardContent>
				</Card>

				<!-- Hours Card -->
				<Card class="transition-all hover:shadow-lifted">
					<CardContent class="p-6">
						<div class="mb-4 flex items-center gap-3">
							<div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
								<Clock class="h-6 w-6 text-primary" />
							</div>
							<h3 class="font-semibold text-foreground">{hours.heading}</h3>
						</div>
						<table class="w-full">
							<tbody>
								{#each hours.schedule as row (row.day)}
									<tr class="border-b border-border last:border-0">
										<td class="py-2 text-foreground">{row.day}</td>
										<td class="py-2 text-right text-muted-foreground">{row.hours}</td>
									</tr>
								{/each}
							</tbody>
						</table>
						{#if hours.note}
							<p class="mt-4 text-sm text-muted-foreground">{hours.note}</p>
						{/if}
					</CardContent>
				</Card>
			</div>
		</div>
	</div>
</section>
{/if}
