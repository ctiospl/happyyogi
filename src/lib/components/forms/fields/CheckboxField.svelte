<script lang="ts">
	import type { FormFieldDef } from '$lib/server/db/schema';
	import { Label } from '$lib/components/ui/label';

	interface Props {
		field: FormFieldDef;
		value: boolean;
		onchange: (value: boolean) => void;
	}

	let { field, value = false, onchange }: Props = $props();
</script>

<div>
	<label class="flex items-center gap-2">
		<input
			type="checkbox"
			id={field.id}
			name={field.id}
			checked={value}
			required={field.required}
			onchange={(e: Event) => onchange((e.target as HTMLInputElement).checked)}
			class="rounded"
		/>
		<span class="text-sm">
			{field.label}
			{#if field.required}<span class="text-destructive">*</span>{/if}
		</span>
	</label>
</div>
