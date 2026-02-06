<script lang="ts">
	import type { FormFieldDef } from '$lib/server/db/schema';
	import { Textarea } from '$lib/components/ui/textarea';
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
	<Textarea
		id={field.id}
		name={field.id}
		placeholder={field.placeholder}
		{value}
		required={field.required}
		minlength={field.validation?.min_length}
		maxlength={field.validation?.max_length}
		rows={4}
		oninput={(e: Event) => onchange((e.target as HTMLTextAreaElement).value)}
	/>
</div>
