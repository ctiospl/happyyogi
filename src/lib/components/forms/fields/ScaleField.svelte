<script lang="ts">
	import type { FormFieldDef } from '$lib/server/db/schema';
	import { Label } from '$lib/components/ui/label';

	interface Props {
		field: FormFieldDef;
		value: number;
		onchange: (value: number) => void;
	}

	let { field, value, onchange }: Props = $props();

	const min = $derived(field.scale_min ?? 1);
	const max = $derived(field.scale_max ?? 10);
</script>

<div>
	<Label for={field.id}>
		{field.label}
		{#if field.required}<span class="text-destructive">*</span>{/if}
	</Label>
	<div class="mt-2">
		<input
			id={field.id}
			name={field.id}
			type="range"
			{min}
			{max}
			value={value ?? min}
			oninput={(e: Event) => onchange(Number((e.target as HTMLInputElement).value))}
			class="w-full"
		/>
		<div class="flex justify-between text-xs text-muted-foreground">
			<span>{field.scale_labels?.min ?? min}</span>
			<span class="font-medium text-foreground">{value ?? min}</span>
			<span>{field.scale_labels?.max ?? max}</span>
		</div>
	</div>
</div>
