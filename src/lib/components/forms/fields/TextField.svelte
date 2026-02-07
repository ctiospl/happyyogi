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

	const inputType = $derived(
		field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : 'text'
	);
</script>

<div>
	<Label for={field.id}>
		{field.label}
		{#if field.required}<span class="text-destructive">*</span>{/if}
	</Label>
	<Input
		id={field.id}
		name={field.id}
		type={inputType}
		placeholder={field.placeholder}
		{value}
		required={field.required}
		minlength={field.validation?.min_length}
		maxlength={field.validation?.max_length}
		pattern={field.validation?.pattern}
		oninput={(e: Event) => onchange((e.target as HTMLInputElement).value)}
	/>
</div>
