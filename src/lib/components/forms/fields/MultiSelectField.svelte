<script lang="ts">
	import type { FormFieldDef } from '$lib/server/db/schema';
	import { Label } from '$lib/components/ui/label';

	interface Props {
		field: FormFieldDef;
		value: string[];
		onchange: (value: string[]) => void;
	}

	let { field, value = [], onchange }: Props = $props();

	function toggle(optValue: string) {
		if (value.includes(optValue)) {
			onchange(value.filter((v) => v !== optValue));
		} else {
			onchange([...value, optValue]);
		}
	}
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
					type="checkbox"
					checked={value.includes(opt.value)}
					onchange={() => toggle(opt.value)}
					class="rounded"
				/>
				{opt.label}
			</label>
		{/each}
	</div>
	<!-- Hidden input for form submission -->
	<input type="hidden" name={field.id} value={JSON.stringify(value)} />
</div>
