<script lang="ts">
	import type { ServicesGridBlock } from '$lib/types';
	import { Card, CardContent } from '$lib/components/ui/card';
	import * as Icons from '@lucide/svelte';

	interface Props {
		block: ServicesGridBlock;
	}

	let { block }: Props = $props();

	const iconMap: Record<string, typeof Icons.Video> = {
		video: Icons.Video,
		users: Icons.Users,
		activity: Icons.Activity,
		user: Icons.User,
		briefcase: Icons.Briefcase,
		calendar: Icons.Calendar
	};
</script>

<section class="py-16 md:py-24">
	<div class="container mx-auto px-4">
		<div class="mb-12 text-center">
			<h2 class="mb-4 text-3xl font-bold text-foreground md:text-4xl">
				{block.headline}
			</h2>
			{#if block.subheadline}
				<p class="text-lg text-muted-foreground">{block.subheadline}</p>
			{/if}
		</div>

		<div class="grid gap-8 lg:grid-cols-2 lg:gap-12">
			<!-- Services Cards -->
			<div class="grid gap-4 sm:grid-cols-2">
				{#each block.services as service}
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

			<!-- Featured Image -->
			{#if block.featureImage}
				<div class="relative hidden lg:block">
					<div class="absolute -inset-4 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 blur-2xl"></div>
					<img
						src={block.featureImage}
						alt=""
						class="relative rounded-2xl object-cover shadow-lifted"
					/>
				</div>
			{/if}
		</div>
	</div>
</section>
