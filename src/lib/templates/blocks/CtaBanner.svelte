<script lang="ts">
	interface Props {
		headline: string;
		subheadline?: string;
		cta?: { text: string; href: string };
		secondaryCta?: { text: string; href: string };
		backgroundImage?: string;
	}

	let {
		headline = 'Ready to Begin?',
		subheadline,
		cta,
		secondaryCta,
		backgroundImage
	}: Props = $props();
</script>

<section class="relative overflow-hidden py-16">
	{#if backgroundImage}
		<div class="absolute inset-0">
			<img src={backgroundImage} class="h-full w-full object-cover" alt="" />
			<div class="absolute inset-0 bg-primary/85"></div>
		</div>
	{:else}
		<div class="absolute inset-0 bg-primary"></div>
	{/if}

	<div class="container relative z-10 mx-auto px-4">
		<div class="grid items-center gap-8 lg:grid-cols-2">
			<div class="text-primary-foreground">
				<h2 class="mb-4 text-3xl font-bold md:text-4xl">{headline}</h2>
				{#if subheadline}
					<p class="mb-8 text-lg opacity-90">{subheadline}</p>
				{/if}
				<div class="flex flex-wrap gap-4">
					{#if cta}
						<a href={cta.href} class="btn btn-lg bg-secondary text-secondary-foreground">
							{cta.text}
						</a>
					{/if}
					{#if secondaryCta}
						<a
							href={secondaryCta.href}
							class="btn btn-lg border-2 border-primary-foreground bg-transparent text-primary-foreground"
						>
							{secondaryCta.text}
						</a>
					{/if}
				</div>
			</div>
		</div>
	</div>
</section>
