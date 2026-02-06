<script lang="ts">
	interface Props {
		steps: { label: string }[];
		currentStep: number;
	}

	let { steps, currentStep }: Props = $props();
</script>

<div class="mb-6">
	<div class="flex items-center justify-between">
		{#each steps as step, i}
			<div class="flex items-center gap-2" class:flex-1={i < steps.length - 1}>
				<div
					class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium transition-colors"
					class:bg-primary={i <= currentStep}
					class:text-primary-foreground={i <= currentStep}
					class:bg-muted={i > currentStep}
					class:text-muted-foreground={i > currentStep}
				>
					{i + 1}
				</div>
				<span class="hidden text-sm sm:inline" class:font-medium={i === currentStep}>
					{step.label}
				</span>
				{#if i < steps.length - 1}
					<div
						class="mx-2 h-0.5 flex-1 transition-colors"
						class:bg-primary={i < currentStep}
						class:bg-muted={i >= currentStep}
					></div>
				{/if}
			</div>
		{/each}
	</div>
</div>
