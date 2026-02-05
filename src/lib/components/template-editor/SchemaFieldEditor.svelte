<script lang="ts">
	import type { TemplateSchemaField } from '$lib/server/db/schema';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import * as Select from '$lib/components/ui/select';
	import { Trash2, ChevronDown, ChevronUp, GripVertical } from '@lucide/svelte';

	interface Props {
		field: TemplateSchemaField;
		onchange?: (field: TemplateSchemaField) => void;
		ondelete?: () => void;
		class?: string;
	}

	let { field, onchange, ondelete, class: className = '' }: Props = $props();

	const fieldTypes = [
		{ value: 'text', label: 'Text' },
		{ value: 'textarea', label: 'Textarea' },
		{ value: 'richtext', label: 'Rich Text' },
		{ value: 'number', label: 'Number' },
		{ value: 'boolean', label: 'Boolean' },
		{ value: 'select', label: 'Select' },
		{ value: 'image', label: 'Image' },
		{ value: 'object', label: 'Object' },
		{ value: 'array', label: 'Array' }
	];

	let expanded = $state(false);
	let fieldKey = $state(field.key);
	let fieldLabel = $state(field.label);
	let fieldType = $state(field.type);
	let fieldRequired = $state(field.required ?? false);
	let fieldPlaceholder = $state(field.placeholder ?? '');

	function updateField() {
		onchange?.({
			...field,
			key: fieldKey,
			label: fieldLabel,
			type: fieldType,
			required: fieldRequired,
			placeholder: fieldPlaceholder || undefined
		});
	}

	function handleTypeChange(newType: string) {
		fieldType = newType as TemplateSchemaField['type'];
		updateField();
	}
</script>

<div class="schema-field {className}">
	<div class="field-header">
		<button type="button" class="drag-handle" title="Drag to reorder">
			<GripVertical class="h-4 w-4" />
		</button>
		<div class="field-summary" onclick={() => (expanded = !expanded)}>
			<code class="field-key">{fieldKey || 'new_field'}</code>
			<span class="field-type">{fieldType}</span>
			{#if fieldRequired}
				<span class="field-required">*</span>
			{/if}
		</div>
		<button type="button" class="expand-btn" onclick={() => (expanded = !expanded)}>
			{#if expanded}
				<ChevronUp class="h-4 w-4" />
			{:else}
				<ChevronDown class="h-4 w-4" />
			{/if}
		</button>
		<button type="button" class="delete-btn" onclick={ondelete} title="Delete field">
			<Trash2 class="h-4 w-4" />
		</button>
	</div>

	{#if expanded}
		<div class="field-details">
			<div class="field-row">
				<div class="field-col">
					<Label for="key-{field.key}">Key</Label>
					<Input
						id="key-{field.key}"
						bind:value={fieldKey}
						onblur={updateField}
						placeholder="field_key"
					/>
				</div>
				<div class="field-col">
					<Label for="label-{field.key}">Label</Label>
					<Input
						id="label-{field.key}"
						bind:value={fieldLabel}
						onblur={updateField}
						placeholder="Field Label"
					/>
				</div>
			</div>

			<div class="field-row">
				<div class="field-col">
					<Label for="type-{field.key}">Type</Label>
					<Select.Root type="single" value={fieldType} onValueChange={handleTypeChange}>
						<Select.Trigger class="w-full">
							{fieldTypes.find((t) => t.value === fieldType)?.label ?? 'Select type'}
						</Select.Trigger>
						<Select.Content>
							{#each fieldTypes as type}
								<Select.Item value={type.value} label={type.label} />
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
				<div class="field-col">
					<Label for="placeholder-{field.key}">Placeholder</Label>
					<Input
						id="placeholder-{field.key}"
						bind:value={fieldPlaceholder}
						onblur={updateField}
						placeholder="Optional"
					/>
				</div>
			</div>

			<div class="field-row">
				<label class="checkbox-label">
					<Checkbox
						checked={fieldRequired}
						onCheckedChange={(checked) => {
							fieldRequired = checked === true;
							updateField();
						}}
					/>
					<span>Required</span>
				</label>
			</div>
		</div>
	{/if}
</div>

<style>
	.schema-field {
		border: 1px solid var(--border);
		border-radius: 6px;
		background: var(--card);
		overflow: hidden;
	}

	.field-header {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px 12px;
		background: var(--muted);
		cursor: pointer;
	}

	.drag-handle {
		cursor: grab;
		color: var(--muted-foreground);
		background: none;
		border: none;
		padding: 2px;
	}

	.field-summary {
		flex: 1;
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.field-key {
		font-size: 13px;
		background: var(--background);
		padding: 2px 6px;
		border-radius: 4px;
	}

	.field-type {
		font-size: 12px;
		color: var(--muted-foreground);
	}

	.field-required {
		color: #ef4444;
		font-weight: bold;
	}

	.expand-btn,
	.delete-btn {
		background: none;
		border: none;
		padding: 4px;
		cursor: pointer;
		color: var(--muted-foreground);
		border-radius: 4px;
	}

	.expand-btn:hover,
	.delete-btn:hover {
		background: var(--background);
		color: var(--foreground);
	}

	.delete-btn:hover {
		color: #ef4444;
	}

	.field-details {
		padding: 12px;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.field-row {
		display: flex;
		gap: 12px;
	}

	.field-col {
		flex: 1;
	}

	.checkbox-label {
		display: flex;
		align-items: center;
		gap: 8px;
		cursor: pointer;
		font-size: 14px;
	}
</style>
