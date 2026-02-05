<script lang="ts">
	import type { AboutSnippetBlock } from '$lib/types';
	import { Button } from '$lib/components/ui/button';
	import { Users, Check } from '@lucide/svelte';

	interface Props {
		block: AboutSnippetBlock;
	}

	let { block }: Props = $props();
</script>

<section class="relative overflow-hidden bg-muted/30 py-16 md:py-24">
	<div class="container relative z-10 mx-auto px-4">
		<div class="grid items-center gap-12 lg:grid-cols-2">
			<!-- Image -->
			{#if block.image}
				<div class="relative">
					<div class="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-accent/30 to-primary/30 blur-3xl"></div>
					<div class="relative overflow-hidden rounded-2xl shadow-lifted">
						<img
							src={block.image}
							alt=""
							class="w-full"
						/>
					</div>
					<!-- Floating stats card -->
					{#if block.stats && block.stats.length > 0}
						<div class="absolute -bottom-6 -right-6 rounded-xl bg-card p-4 shadow-lifted">
							<div class="flex items-center gap-4">
								<div class="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
									<Users class="h-6 w-6 text-primary" />
								</div>
								<div>
									<p class="text-2xl font-bold text-foreground">{block.stats[0].value}</p>
									<p class="text-sm text-muted-foreground">{block.stats[0].label}</p>
								</div>
							</div>
						</div>
					{/if}
				</div>
			{/if}

			<!-- Content -->
			<div>
				<h2 class="mb-6 text-3xl font-bold text-foreground md:text-4xl">
					{block.headline}
				</h2>
				<p class="mb-8 text-lg text-muted-foreground">
					{block.content}
				</p>
				{#if block.highlights && block.highlights.length > 0}
					<ul class="mb-8 space-y-3">
						{#each block.highlights as highlight}
							<li class="flex items-center gap-3 text-foreground">
								<span class="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
									<Check class="h-4 w-4 text-primary" />
								</span>
								{highlight}
							</li>
						{/each}
					</ul>
				{/if}
				{#if block.cta}
					<Button href={block.cta.href} variant="outline" size="lg">
						{block.cta.text}
					</Button>
				{/if}
			</div>
		</div>
	</div>
</section>
