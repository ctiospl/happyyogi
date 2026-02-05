<script lang="ts">
	interface Stat {
		value: string;
		label: string;
	}

	interface Props {
		headline: string;
		content: string;
		highlights?: string[];
		cta?: { text: string; href: string };
		image?: string;
		stats?: Stat[];
	}

	let {
		headline = 'About Us',
		content = '',
		highlights = [],
		cta,
		image,
		stats = []
	}: Props = $props();
</script>

<section class="bg-secondary/30 px-4 py-20">
	<div
		class="mx-auto grid max-w-4xl items-center gap-12 {image
			? 'grid-cols-1 lg:grid-cols-2'
			: 'grid-cols-1'}"
	>
		{#if image}
			<div class="relative">
				<div
					class="absolute -inset-4 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 blur-3xl"
				></div>
				<div class="relative overflow-hidden rounded-2xl shadow-lg">
					<img src={image} class="block w-full" alt="About" />
				</div>

				{#if stats.length > 0}
					<div
						class="absolute -bottom-4 -right-4 flex items-center gap-3 rounded-xl bg-card p-4 shadow-lg"
					>
						<div class="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
							<span class="text-xl">👥</span>
						</div>
						<div>
							<p class="text-2xl font-bold text-foreground">{stats[0].value}</p>
							<p class="text-sm text-muted-foreground">{stats[0].label}</p>
						</div>
					</div>
				{/if}
			</div>
		{/if}

		<div>
			<h2 class="mb-6 text-3xl font-bold text-foreground">{headline}</h2>
			<p class="mb-8 text-lg leading-relaxed text-muted-foreground">{content}</p>

			{#if highlights.length > 0}
				<ul class="mb-8 space-y-2">
					{#each highlights as highlight}
						<li class="flex items-center gap-3 py-2 text-foreground">
							<span
								class="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-sm text-primary"
							>
								✓
							</span>
							{highlight}
						</li>
					{/each}
				</ul>
			{/if}

			{#if cta}
				<a href={cta.href} class="btn btn-outline">{cta.text}</a>
			{/if}
		</div>
	</div>
</section>
