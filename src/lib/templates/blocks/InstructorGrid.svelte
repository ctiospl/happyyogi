<script lang="ts">
	interface Instructor {
		name: string;
		role?: string;
		specialty?: string;
		image: string;
	}

	interface Props {
		heading: string;
		subheading?: string;
		instructors: Instructor[];
	}

	let { heading = 'Meet Our Team', subheading, instructors = [] }: Props = $props();
</script>

<section class="bg-muted px-4 py-20">
	<div class="mx-auto max-w-4xl text-center">
		<h2 class="mb-2 text-3xl font-bold text-foreground">{heading}</h2>
		{#if subheading}
			<p class="mb-12 text-lg text-muted-foreground">{subheading}</p>
		{/if}

		<div class="flex flex-wrap justify-center gap-12">
			{#each instructors as instructor}
				<div class="w-48 text-center">
					<img
						src={instructor.image}
						alt={instructor.name}
						class="mx-auto mb-4 h-40 w-40 rounded-full border-4 border-white object-cover shadow-md"
					/>
					<p class="mb-1 text-lg font-semibold text-foreground">{instructor.name}</p>
					<p class="text-sm text-primary">{instructor.specialty || instructor.role || ''}</p>
				</div>
			{:else}
				<p class="text-muted-foreground">(No instructors configured)</p>
			{/each}
		</div>
	</div>
</section>
