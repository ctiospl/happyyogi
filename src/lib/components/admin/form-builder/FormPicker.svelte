<script lang="ts">
	import type { Form } from '$lib/server/db/schema';
	import { Label } from '$lib/components/ui/label';

	interface Props {
		forms: Form[];
		value: string;
		onchange: (formId: string) => void;
	}

	let { forms, value, onchange }: Props = $props();

	const publishedForms = $derived(forms.filter((f) => f.status === 'published'));
</script>

<div>
	<Label for="form-picker">Select Form</Label>
	<select
		id="form-picker"
		{value}
		onchange={(e: Event) => onchange((e.target as HTMLSelectElement).value)}
		class="border-input bg-background ring-offset-background flex h-10 w-full rounded-md border px-3 py-2 text-sm"
	>
		<option value="">Choose a form...</option>
		{#each publishedForms as form}
			<option value={form.id}>{form.title}</option>
		{/each}
	</select>
</div>
