<script lang="ts">
	import type { FormFieldDef } from '$lib/server/db/schema';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';

	interface Props {
		field: FormFieldDef;
		value: { start: string; end: string };
		onchange: (value: { start: string; end: string }) => void;
	}

	let { field, value = { start: '', end: '' }, onchange }: Props = $props();
</script>

<div>
	<Label>
		{field.label}
		{#if field.required}<span class="text-destructive">*</span>{/if}
	</Label>
	<div class="mt-1 grid grid-cols-2 gap-2">
		<Input
			name="{field.id}_start"
			type="date"
			value={value.start}
			required={field.required}
			oninput={(e: Event) => onchange({ ...value, start: (e.target as HTMLInputElement).value })}
		/>
		<Input
			name="{field.id}_end"
			type="date"
			value={value.end}
			required={field.required}
			oninput={(e: Event) => onchange({ ...value, end: (e.target as HTMLInputElement).value })}
		/>
	</div>
	<input type="hidden" name={field.id} value={JSON.stringify(value)} />
</div>
