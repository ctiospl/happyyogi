<script lang="ts">
	import type { FormFieldDef } from '$lib/server/db/schema';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';

	interface Props {
		field: FormFieldDef;
		value: Record<string, string>;
		onchange: (value: Record<string, string>) => void;
	}

	let { field, value = {}, onchange }: Props = $props();

	const subFields = $derived(field.address_fields ?? ['street', 'city', 'state', 'zip', 'country']);

	const labels: Record<string, string> = {
		street: 'Street Address',
		city: 'City',
		state: 'State / Province',
		zip: 'ZIP / Postal Code',
		country: 'Country'
	};

	function updateSub(key: string, val: string) {
		onchange({ ...value, [key]: val });
	}
</script>

<div>
	<Label>
		{field.label}
		{#if field.required}<span class="text-destructive">*</span>{/if}
	</Label>
	<div class="mt-1 space-y-2">
		{#each subFields as sub}
			<Input
				name="{field.id}_{sub}"
				placeholder={labels[sub] ?? sub}
				value={value[sub] ?? ''}
				required={field.required}
				oninput={(e: Event) => updateSub(sub, (e.target as HTMLInputElement).value)}
			/>
		{/each}
	</div>
	<input type="hidden" name={field.id} value={JSON.stringify(value)} />
</div>
