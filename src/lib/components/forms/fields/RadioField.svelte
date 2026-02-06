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
	<Label>
		{field.label}
		{#if field.required}<span class="text-destructive">*</span>{/if}
	</Label>
	<div class="mt-1 space-y-1">
		{#each field.options || [] as opt}
			<label class="flex items-center gap-2 text-sm">
				<input
					type="radio"
					name={field.id}
					value={opt.value}
					checked={value === opt.value}
					required={field.required}
					onchange={() => onchange(opt.value)}
				/>
				{opt.label}
			</label>
		{/each}
	</div>
</div>
