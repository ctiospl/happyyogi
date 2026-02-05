<script lang="ts">
	interface Props {
		heading: string;
		subheading?: string;
		content: string[];
		image?: string;
	}

	let { heading = 'Our Story', subheading, content = [], image }: Props = $props();
</script>

<section class="bg-muted px-4 py-20">
	<div
		class="mx-auto grid max-w-4xl items-center gap-16 {image
			? 'grid-cols-1 lg:grid-cols-2'
			: 'grid-cols-1'}"
	>
		<div>
			<h2 class="mb-2 text-3xl font-bold text-foreground">{heading}</h2>
			{#if subheading}
				<p class="mb-8 text-lg text-primary">{subheading}</p>
			{/if}

			{#each content as paragraph}
				<p class="mb-4 leading-relaxed text-muted-foreground">{paragraph}</p>
			{/each}
		</div>

		{#if image}
			<div>
				<img src={image} class="h-96 w-full rounded-xl object-cover" alt="Story" />
			</div>
		{/if}
	</div>
</section>
