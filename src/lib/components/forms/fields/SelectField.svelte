<script lang="ts">
	import type { FormFieldDef } from '$lib/server/db/schema';
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
	<select
		id={field.id}
		name={field.id}
		{value}
		required={field.required}
		onchange={(e: Event) => onchange((e.target as HTMLSelectElement).value)}
		class="border-input bg-background ring-offset-background flex h-10 w-full rounded-md border px-3 py-2 text-sm"
	>
		<option value="">Select...</option>
		{#each field.options || [] as opt}
			<option value={opt.value}>{opt.label}</option>
		{/each}
	</select>
</div>
