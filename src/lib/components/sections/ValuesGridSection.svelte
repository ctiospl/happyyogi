<script lang="ts">
	import type { ValuesGridBlock } from '$lib/types';
	import { Card, CardContent } from '$lib/components/ui/card';

	interface Props {
		block: ValuesGridBlock;
	}

	let { block }: Props = $props();
</script>

<section class="py-16 md:py-24">
	<div class="container mx-auto px-4">
		<div class="mb-12 text-center">
			<h2 class="text-3xl font-bold text-foreground md:text-4xl">
				{block.heading}
			</h2>
		</div>

		<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
			{#each block.values as value}
				<Card class="group transition-all hover:shadow-lifted hover:-translate-y-1">
					<CardContent class="p-6">
						<h3 class="mb-3 text-lg font-semibold text-foreground">
							{value.title}
						</h3>
						<p class="text-sm text-muted-foreground">
							{value.description}
						</p>
					</CardContent>
				</Card>
			{/each}
		</div>
	</div>
</section>
