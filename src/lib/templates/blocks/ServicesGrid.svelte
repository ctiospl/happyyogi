<script lang="ts">
	interface Service {
		title: string;
		description: string;
		icon?: string;
	}

	interface Props {
		headline: string;
		subheadline?: string;
		services: Service[];
		featureImage?: string;
	}

	let {
		headline = 'Our Services',
		subheadline,
		services = [],
		featureImage
	}: Props = $props();
</script>

<section class="bg-background px-4 py-20">
	<div class="container mx-auto">
		<div class="mb-12 text-center">
			<h2 class="mb-4 text-3xl font-bold tracking-tight text-foreground">
				{headline}
			</h2>
			{#if subheadline}
				<p class="text-lg text-muted-foreground">{subheadline}</p>
			{/if}
		</div>

		<div class="grid items-start gap-12 {featureImage ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}">
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
				{#each services as service}
					<div class="card p-6">
						{#if service.icon}
							<div class="mb-4">
								<span class="text-2xl text-primary">{service.icon}</span>
							</div>
						{/if}
						<h3 class="mb-2 font-semibold text-foreground">{service.title}</h3>
						<p class="text-sm leading-relaxed text-muted-foreground">{service.description}</p>
					</div>
				{/each}
			</div>

			{#if featureImage}
				<div class="relative">
					<div
						class="absolute -inset-4 rounded-3xl bg-gradient-to-br from-accent/20 to-primary/20 blur-3xl"
					></div>
					<img src={featureImage} class="relative w-full rounded-2xl shadow-lg" alt="Feature" />
				</div>
			{/if}
		</div>
	</div>
</section>
