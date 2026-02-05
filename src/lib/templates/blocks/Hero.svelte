<script lang="ts">
	interface Props {
		headline: string;
		subheadline?: string;
		cta?: { text: string; href: string };
		secondaryCta?: { text: string; href: string };
		location?: string;
		backgroundImage?: string;
	}

	let {
		headline = 'Welcome',
		subheadline,
		cta,
		secondaryCta,
		location,
		backgroundImage
	}: Props = $props();
</script>

<section class="relative min-h-[500px] overflow-hidden">
	{#if backgroundImage}
		<div class="absolute inset-0">
			<img src={backgroundImage} class="h-full w-full object-cover" alt="" />
			<div
				class="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-background/30"
			></div>
		</div>
	{:else}
		<div
			class="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-background/30"
		></div>
	{/if}

	<div class="container relative z-10 mx-auto flex min-h-[500px] items-center px-6 py-20">
		<div class="max-w-2xl">
			<h1 class="mb-6 text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
				{headline}
			</h1>

			{#if subheadline}
				<p class="mb-8 text-lg leading-relaxed text-muted-foreground md:text-xl">
					{subheadline}
				</p>
			{/if}

			<div class="flex flex-wrap gap-4">
				{#if cta}
					<a href={cta.href} class="btn btn-primary btn-lg">
						{cta.text}
					</a>
				{/if}

				{#if secondaryCta}
					<a href={secondaryCta.href} class="btn btn-outline btn-lg">
						{secondaryCta.text}
					</a>
				{/if}
			</div>

			{#if location}
				<p class="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
					<span class="text-primary">📍</span>
					{location}
				</p>
			{/if}
		</div>
	</div>
</section>
