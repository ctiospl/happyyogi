<script lang="ts">
	interface Value {
		title: string;
		description: string;
		icon?: string;
	}

	interface Props {
		heading: string;
		values: Value[];
	}

	let { heading = 'Our Values', values = [] }: Props = $props();
</script>

<section class="bg-card px-4 py-16">
	<div class="mx-auto max-w-4xl text-center">
		<h2 class="mb-8 text-3xl font-bold text-foreground">{heading}</h2>

		<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
			{#each values as value}
				<div class="p-6 text-center">
					{#if value.icon}
						<div
							class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10"
						>
							<span class="text-2xl">{value.icon}</span>
						</div>
					{/if}
					<h3 class="mb-2 font-semibold text-foreground">{value.title}</h3>
					<p class="text-sm text-muted-foreground">{value.description}</p>
				</div>
			{/each}
		</div>
	</div>
</section>
