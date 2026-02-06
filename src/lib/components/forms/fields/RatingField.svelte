<script lang="ts">
	import type { FormFieldDef } from '$lib/server/db/schema';
	import { Label } from '$lib/components/ui/label';
	import { Star } from '@lucide/svelte';

	interface Props {
		field: FormFieldDef;
		value: number;
		onchange: (value: number) => void;
	}

	let { field, value = 0, onchange }: Props = $props();

	const max = $derived(field.scale_max ?? 5);
	let hovered = $state(0);
</script>

<div>
	<Label>
		{field.label}
		{#if field.required}<span class="text-destructive">*</span>{/if}
	</Label>
	<div class="mt-1 flex gap-1">
		{#each Array.from({ length: max }, (_, i) => i + 1) as star}
			<button
				type="button"
				class="transition-transform hover:scale-110"
				onmouseenter={() => (hovered = star)}
				onmouseleave={() => (hovered = 0)}
				onclick={() => onchange(star)}
			>
				<Star
					class="h-6 w-6 {star <= (hovered || value) ? 'text-yellow-400' : 'text-muted-foreground'}"
					fill={star <= (hovered || value) ? 'currentColor' : 'none'}
				/>
			</button>
		{/each}
	</div>
	<input type="hidden" name={field.id} value={String(value)} />
</div>
