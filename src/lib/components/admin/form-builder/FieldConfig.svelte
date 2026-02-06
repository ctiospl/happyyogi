<script lang="ts">
	import type { FormFieldDef } from '$lib/server/db/schema';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Switch } from '$lib/components/ui/switch';
	import { Plus, Trash2 } from '@lucide/svelte';

	interface Props {
		field: FormFieldDef;
		stepCount: number;
		onchange: (field: FormFieldDef) => void;
	}

	let { field, stepCount, onchange }: Props = $props();

	function update(patch: Partial<FormFieldDef>) {
		onchange({ ...field, ...patch });
	}

	function updateValidation(patch: Record<string, unknown>) {
		onchange({ ...field, validation: { ...field.validation, ...patch } });
	}

	function addOption() {
		const options = [...(field.options || [])];
		const n = options.length + 1;
		options.push({ value: `option${n}`, label: `Option ${n}` });
		update({ options });
	}

	function removeOption(index: number) {
		const options = (field.options || []).filter((_, i) => i !== index);
		update({ options });
	}

	function updateOption(index: number, key: 'value' | 'label', val: string) {
		const options = [...(field.options || [])];
		options[index] = { ...options[index], [key]: val };
		update({ options });
	}

	const hasOptions = $derived(
		['select', 'multi_select', 'radio'].includes(field.type)
	);

	const hasMinMax = $derived(
		['number', 'scale', 'rating'].includes(field.type)
	);

	const isTextLike = $derived(
		['text', 'email', 'phone', 'textarea'].includes(field.type)
	);

	const ADDRESS_FIELD_OPTIONS = ['street', 'city', 'state', 'zip', 'country'] as const;
</script>

<div class="space-y-4">
	<h3 class="text-sm font-semibold">Field Settings</h3>

	<!-- Label -->
	<div>
		<Label for="field-label">Label</Label>
		<Input
			id="field-label"
			value={field.label}
			oninput={(e: Event) => update({ label: (e.target as HTMLInputElement).value })}
		/>
	</div>

	<!-- Placeholder (text-like fields) -->
	{#if isTextLike || field.type === 'number'}
		<div>
			<Label for="field-placeholder">Placeholder</Label>
			<Input
				id="field-placeholder"
				value={field.placeholder ?? ''}
				oninput={(e: Event) => update({ placeholder: (e.target as HTMLInputElement).value })}
			/>
		</div>
	{/if}

	<!-- Required toggle -->
	{#if field.type !== 'heading'}
		<div class="flex items-center justify-between">
			<Label for="field-required">Required</Label>
			<Switch
				id="field-required"
				checked={field.required ?? false}
				onCheckedChange={(v: boolean) => update({ required: v })}
			/>
		</div>
	{/if}

	<!-- Options (select, multi_select, radio) -->
	{#if hasOptions}
		<div>
			<Label>Options</Label>
			<div class="mt-1 space-y-1">
				{#each field.options || [] as opt, i}
					<div class="flex items-center gap-1">
						<Input
							value={opt.label}
							placeholder="Label"
							class="h-8 text-sm"
							oninput={(e: Event) => updateOption(i, 'label', (e.target as HTMLInputElement).value)}
						/>
						<Input
							value={opt.value}
							placeholder="Value"
							class="h-8 w-24 text-sm"
							oninput={(e: Event) => updateOption(i, 'value', (e.target as HTMLInputElement).value)}
						/>
						<Button variant="ghost" size="icon" class="h-8 w-8 shrink-0" onclick={() => removeOption(i)}>
							<Trash2 class="h-3 w-3 text-red-500" />
						</Button>
					</div>
				{/each}
			</div>
			<Button variant="outline" size="sm" class="mt-2" onclick={addOption}>
				<Plus class="mr-1 h-3 w-3" /> Add Option
			</Button>
		</div>
	{/if}

	<!-- Min/Max for number/scale/rating -->
	{#if hasMinMax}
		<div class="grid grid-cols-2 gap-2">
			<div>
				<Label for="field-min">Min</Label>
				<Input
					id="field-min"
					type="number"
					value={field.type === 'number' ? (field.validation?.min ?? '') : (field.scale_min ?? '')}
					oninput={(e: Event) => {
						const val = Number((e.target as HTMLInputElement).value);
						if (field.type === 'number') updateValidation({ min: val });
						else update({ scale_min: val });
					}}
				/>
			</div>
			<div>
				<Label for="field-max">Max</Label>
				<Input
					id="field-max"
					type="number"
					value={field.type === 'number' ? (field.validation?.max ?? '') : (field.scale_max ?? '')}
					oninput={(e: Event) => {
						const val = Number((e.target as HTMLInputElement).value);
						if (field.type === 'number') updateValidation({ max: val });
						else update({ scale_max: val });
					}}
				/>
			</div>
		</div>
	{/if}

	<!-- Scale labels -->
	{#if field.type === 'scale'}
		<div class="grid grid-cols-2 gap-2">
			<div>
				<Label for="scale-min-label">Min Label</Label>
				<Input
					id="scale-min-label"
					value={field.scale_labels?.min ?? ''}
					oninput={(e: Event) =>
						update({ scale_labels: { min: (e.target as HTMLInputElement).value, max: field.scale_labels?.max ?? '' } })}
				/>
			</div>
			<div>
				<Label for="scale-max-label">Max Label</Label>
				<Input
					id="scale-max-label"
					value={field.scale_labels?.max ?? ''}
					oninput={(e: Event) =>
						update({ scale_labels: { min: field.scale_labels?.min ?? '', max: (e.target as HTMLInputElement).value } })}
				/>
			</div>
		</div>
	{/if}

	<!-- Text length validation -->
	{#if isTextLike}
		<div class="grid grid-cols-2 gap-2">
			<div>
				<Label for="field-minlen">Min Length</Label>
				<Input
					id="field-minlen"
					type="number"
					value={field.validation?.min_length ?? ''}
					oninput={(e: Event) => updateValidation({ min_length: Number((e.target as HTMLInputElement).value) || undefined })}
				/>
			</div>
			<div>
				<Label for="field-maxlen">Max Length</Label>
				<Input
					id="field-maxlen"
					type="number"
					value={field.validation?.max_length ?? ''}
					oninput={(e: Event) => updateValidation({ max_length: Number((e.target as HTMLInputElement).value) || undefined })}
				/>
			</div>
		</div>
	{/if}

	<!-- File upload config -->
	{#if field.type === 'file'}
		<div>
			<Label for="field-accept">Accepted File Types</Label>
			<Input
				id="field-accept"
				value={field.validation?.accept ?? ''}
				placeholder="image/*,.pdf,.doc"
				oninput={(e: Event) => updateValidation({ accept: (e.target as HTMLInputElement).value })}
			/>
		</div>
		<div>
			<Label for="field-maxsize">Max File Size (MB)</Label>
			<Input
				id="field-maxsize"
				type="number"
				value={field.validation?.max_size_mb ?? 10}
				oninput={(e: Event) => updateValidation({ max_size_mb: Number((e.target as HTMLInputElement).value) })}
			/>
		</div>
	{/if}

	<!-- Address sub-fields -->
	{#if field.type === 'address'}
		<div>
			<Label>Address Fields</Label>
			<div class="mt-1 space-y-1">
				{#each ADDRESS_FIELD_OPTIONS as af}
					<label class="flex items-center gap-2 text-sm">
						<input
							type="checkbox"
							checked={(field.address_fields ?? ADDRESS_FIELD_OPTIONS).includes(af)}
							onchange={(e: Event) => {
								const checked = (e.target as HTMLInputElement).checked;
								const current = field.address_fields ?? [...ADDRESS_FIELD_OPTIONS];
								const updated = checked
									? [...current, af]
									: current.filter((f) => f !== af);
								update({ address_fields: updated as typeof field.address_fields });
							}}
						/>
						<span class="capitalize">{af}</span>
					</label>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Step assignment (multi-step forms) -->
	{#if stepCount > 1}
		<div>
			<Label for="field-step">Step</Label>
			<select
				id="field-step"
				value={field.step ?? 0}
				onchange={(e: Event) => update({ step: Number((e.target as HTMLSelectElement).value) })}
				class="border-input bg-background flex h-10 w-full rounded-md border px-3 py-2 text-sm"
			>
				{#each Array.from({ length: stepCount }, (_, i) => i) as s}
					<option value={s}>Step {s + 1}</option>
				{/each}
			</select>
		</div>
	{/if}
</div>
