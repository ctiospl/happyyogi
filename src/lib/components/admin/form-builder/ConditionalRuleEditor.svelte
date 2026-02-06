<script lang="ts">
	import type { FormConditionalRule, FormFieldDef } from '$lib/server/db/schema';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Plus, Trash2 } from '@lucide/svelte';

	interface Props {
		rules: FormConditionalRule[];
		fields: FormFieldDef[];
		onchange: (rules: FormConditionalRule[]) => void;
	}

	let { rules, fields, onchange }: Props = $props();

	const OPERATORS: { value: FormConditionalRule['operator']; label: string }[] = [
		{ value: 'equals', label: 'equals' },
		{ value: 'not_equals', label: 'not equals' },
		{ value: 'contains', label: 'contains' },
		{ value: 'not_empty', label: 'is not empty' },
		{ value: 'empty', label: 'is empty' },
		{ value: 'gt', label: '>' },
		{ value: 'lt', label: '<' }
	];

	function addRule() {
		if (fields.length < 2) return;
		onchange([
			...rules,
			{
				field_id: fields[0].id,
				operator: 'equals',
				value: '',
				target_field_id: fields[1]?.id ?? fields[0].id,
				action: 'show'
			}
		]);
	}

	function removeRule(index: number) {
		onchange(rules.filter((_, i) => i !== index));
	}

	function updateRule(index: number, patch: Partial<FormConditionalRule>) {
		const updated = [...rules];
		updated[index] = { ...updated[index], ...patch };
		onchange(updated);
	}

	const needsValue = (op: string) => !['not_empty', 'empty'].includes(op);
</script>

<div class="space-y-3">
	<div class="flex items-center justify-between">
		<h3 class="text-sm font-semibold">Conditional Logic</h3>
		<Button variant="outline" size="sm" onclick={addRule} disabled={fields.length < 2}>
			<Plus class="mr-1 h-3 w-3" /> Add Rule
		</Button>
	</div>

	{#if rules.length === 0}
		<p class="text-muted-foreground text-sm">No conditional rules. Add rules to show/hide fields based on other field values.</p>
	{:else}
		{#each rules as rule, i}
			<div class="rounded-md border p-3 text-sm">
				<div class="mb-2 flex items-center justify-between">
					<span class="text-muted-foreground text-xs">Rule {i + 1}</span>
					<Button variant="ghost" size="icon" class="h-6 w-6" onclick={() => removeRule(i)}>
						<Trash2 class="h-3 w-3 text-red-500" />
					</Button>
				</div>
				<div class="grid grid-cols-2 gap-2">
					<div>
						<Label class="text-xs">When field</Label>
						<select
							value={rule.field_id}
							onchange={(e: Event) => updateRule(i, { field_id: (e.target as HTMLSelectElement).value })}
							class="border-input bg-background flex h-8 w-full rounded-md border px-2 text-xs"
						>
							{#each fields as f}
								<option value={f.id}>{f.label}</option>
							{/each}
						</select>
					</div>
					<div>
						<Label class="text-xs">Operator</Label>
						<select
							value={rule.operator}
							onchange={(e: Event) => updateRule(i, { operator: (e.target as HTMLSelectElement).value as FormConditionalRule['operator'] })}
							class="border-input bg-background flex h-8 w-full rounded-md border px-2 text-xs"
						>
							{#each OPERATORS as op}
								<option value={op.value}>{op.label}</option>
							{/each}
						</select>
					</div>
					{#if needsValue(rule.operator)}
						<div>
							<Label class="text-xs">Value</Label>
							<Input
								class="h-8 text-xs"
								value={rule.value}
								oninput={(e: Event) => updateRule(i, { value: (e.target as HTMLInputElement).value })}
							/>
						</div>
					{/if}
					<div>
						<Label class="text-xs">Then</Label>
						<select
							value={rule.action}
							onchange={(e: Event) => updateRule(i, { action: (e.target as HTMLSelectElement).value as 'show' | 'hide' })}
							class="border-input bg-background flex h-8 w-full rounded-md border px-2 text-xs"
						>
							<option value="show">Show</option>
							<option value="hide">Hide</option>
						</select>
					</div>
					<div>
						<Label class="text-xs">Target field</Label>
						<select
							value={rule.target_field_id}
							onchange={(e: Event) => updateRule(i, { target_field_id: (e.target as HTMLSelectElement).value })}
							class="border-input bg-background flex h-8 w-full rounded-md border px-2 text-xs"
						>
							{#each fields as f}
								<option value={f.id}>{f.label}</option>
							{/each}
						</select>
					</div>
				</div>
			</div>
		{/each}
	{/if}
</div>
