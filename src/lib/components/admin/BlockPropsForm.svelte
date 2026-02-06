<script lang="ts">
	import type { TemplateSchemaField } from '$lib/server/db/schema';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Label } from '$lib/components/ui/label';
	import { Switch } from '$lib/components/ui/switch';
	import { Button } from '$lib/components/ui/button';
	import * as Select from '$lib/components/ui/select';
	import { Plus, Trash2 } from '@lucide/svelte';

	interface Props {
		fields: TemplateSchemaField[];
		values: Record<string, unknown>;
		onchange: (values: Record<string, unknown>) => void;
		prefix?: string;
	}

	let { fields, values, onchange, prefix = '' }: Props = $props();

	function getValue(key: string): unknown {
		return values[key];
	}

	function setValue(key: string, value: unknown) {
		onchange({ ...values, [key]: value });
	}

	function getArrayValue(key: string): unknown[] {
		const val = getValue(key);
		return Array.isArray(val) ? val : [];
	}

	function addArrayItem(key: string, field: TemplateSchemaField) {
		const arr = getArrayValue(key);
		const newItem = field.itemType === 'object' && field.fields
			? Object.fromEntries(field.fields.map(f => [f.key, '']))
			: '';
		setValue(key, [...arr, newItem]);
	}

	function removeArrayItem(key: string, index: number) {
		const arr = getArrayValue(key);
		setValue(key, arr.filter((_, i) => i !== index));
	}

	function updateArrayItem(key: string, index: number, value: unknown) {
		const arr = [...getArrayValue(key)];
		arr[index] = value;
		setValue(key, arr);
	}

	function updateObjectField(key: string, fieldKey: string, value: unknown) {
		const obj = (getValue(key) as Record<string, unknown>) || {};
		setValue(key, { ...obj, [fieldKey]: value });
	}

	const fieldId = (key: string) => `${prefix}${key}`;
</script>

<div class="space-y-4">
	{#each fields as field (field.key)}
		{@const id = fieldId(field.key)}

		{#if field.type === 'text'}
			<div>
				<Label for={id}>{field.label}</Label>
				<Input
					{id}
					value={(getValue(field.key) as string) ?? ''}
					placeholder={field.placeholder}
					oninput={(e: Event) => setValue(field.key, (e.target as HTMLInputElement).value)}
				/>
			</div>

		{:else if field.type === 'textarea' || field.type === 'richtext'}
			<div>
				<Label for={id}>{field.label}</Label>
				<Textarea
					{id}
					value={(getValue(field.key) as string) ?? ''}
					placeholder={field.placeholder}
					rows={4}
					oninput={(e: Event) => setValue(field.key, (e.target as HTMLTextAreaElement).value)}
				/>
			</div>

		{:else if field.type === 'number'}
			<div>
				<Label for={id}>{field.label}</Label>
				<Input
					{id}
					type="number"
					value={String(getValue(field.key) ?? '')}
					oninput={(e: Event) => setValue(field.key, Number((e.target as HTMLInputElement).value))}
				/>
			</div>

		{:else if field.type === 'boolean'}
			<div class="flex items-center gap-2">
				<Switch
					checked={(getValue(field.key) as boolean) ?? false}
					onCheckedChange={(checked: boolean) => setValue(field.key, checked)}
				/>
				<Label for={id}>{field.label}</Label>
			</div>

		{:else if field.type === 'image'}
			<div>
				<Label for={id}>{field.label}</Label>
				<Input
					{id}
					value={(getValue(field.key) as string) ?? ''}
					placeholder={field.placeholder || 'Image URL'}
					oninput={(e: Event) => setValue(field.key, (e.target as HTMLInputElement).value)}
				/>
				{#if getValue(field.key)}
					<img
						src={getValue(field.key) as string}
						alt="Preview"
						class="mt-2 h-20 w-auto rounded border object-cover"
					/>
				{/if}
			</div>

		{:else if field.type === 'select' && field.options}
			<div>
				<Label for={id}>{field.label}</Label>
				<Select.Root
					type="single"
					value={(getValue(field.key) as string) ?? ''}
					onValueChange={(v: string) => setValue(field.key, v)}
				>
					<Select.Trigger class="w-full">
						{(getValue(field.key) as string) || 'Select...'}
					</Select.Trigger>
					<Select.Content>
						{#each field.options as option (option.value)}
							<Select.Item value={option.value}>{option.label}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>

		{:else if field.type === 'object' && field.fields}
			<div class="rounded-lg border p-3">
				<Label class="mb-2 block font-medium">{field.label}</Label>
				<svelte:self
					fields={field.fields}
					values={(getValue(field.key) as Record<string, unknown>) || {}}
					onchange={(v: Record<string, unknown>) => setValue(field.key, v)}
					prefix="{prefix}{field.key}."
				/>
			</div>

		{:else if field.type === 'array'}
			<div class="rounded-lg border p-3">
				<div class="mb-2 flex items-center justify-between">
					<Label class="font-medium">{field.label}</Label>
					<Button variant="outline" size="sm" onclick={() => addArrayItem(field.key, field)}>
						<Plus class="mr-1 h-3 w-3" />
						Add
					</Button>
				</div>
				{#each getArrayValue(field.key) as item, i (i)}
					<div class="mb-2 flex items-start gap-2">
						{#if field.itemType === 'object' && field.fields}
							<div class="flex-1 rounded border p-2">
								<svelte:self
									fields={field.fields}
									values={(item as Record<string, unknown>) || {}}
									onchange={(v: Record<string, unknown>) => updateArrayItem(field.key, i, v)}
									prefix="{prefix}{field.key}.{i}."
								/>
							</div>
						{:else}
							<Input
								class="flex-1"
								value={(item as string) ?? ''}
								oninput={(e: Event) => updateArrayItem(field.key, i, (e.target as HTMLInputElement).value)}
							/>
						{/if}
						<Button variant="ghost" size="icon" onclick={() => removeArrayItem(field.key, i)}>
							<Trash2 class="h-4 w-4 text-red-500" />
						</Button>
					</div>
				{/each}
			</div>
		{/if}
	{/each}
</div>
