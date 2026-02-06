<script lang="ts">
	import type { FormFieldDef } from '$lib/server/db/schema';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';

	interface Props {
		field: FormFieldDef;
		value: string;
		onchange: (value: string) => void;
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
		type="date"
		{value}
		required={field.required}
		oninput={(e: Event) => onchange((e.target as HTMLInputElement).value)}
	/>
</div>
