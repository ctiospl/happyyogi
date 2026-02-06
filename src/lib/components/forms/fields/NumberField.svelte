<script lang="ts">
	import type { FormFieldDef } from '$lib/server/db/schema';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';

	interface Props {
		field: FormFieldDef;
		value: number | string;
		onchange: (value: number) => void;
	}

	let { field, value, onchange }: Props = $props();
</script>

<div>
	<Label for={field.id}>
		{field.label}
		{#if field.required}<span class="text-destructive">*</span>{/if}
	</Label>
	<Input
		id={field.id}
		name={field.id}
		type="number"
		placeholder={field.placeholder}
		value={String(value ?? '')}
		required={field.required}
		min={field.validation?.min}
		max={field.validation?.max}
		oninput={(e: Event) => onchange(Number((e.target as HTMLInputElement).value))}
	/>
</div>
