<script lang="ts">
	import type { FormFieldDef, FormConditionalRule, FormSettings, FormFieldType } from '$lib/server/db/schema';
	import FieldPalette from './FieldPalette.svelte';
	import FieldList from './FieldList.svelte';
	import FieldConfig from './FieldConfig.svelte';
	import ConditionalRuleEditor from './ConditionalRuleEditor.svelte';
	import { createFieldDef } from './field-types';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Switch } from '$lib/components/ui/switch';
	import { Button } from '$lib/components/ui/button';
	import * as Tabs from '$lib/components/ui/tabs';
	import { Plus, Trash2 } from '@lucide/svelte';

	interface Props {
		fields: FormFieldDef[];
		settings: FormSettings;
		conditionalRules: FormConditionalRule[];
		onchange: (data: {
			fields: FormFieldDef[];
			settings: FormSettings;
			conditional_rules: FormConditionalRule[];
		}) => void;
	}

	let { fields, settings, conditionalRules, onchange }: Props = $props();

	let selectedFieldId = $state<string | null>(null);

	const selectedField = $derived(fields.find((f) => f.id === selectedFieldId) ?? null);
	const stepCount = $derived(settings.multi_step && settings.steps ? settings.steps.length : 1);

	function emit() {
		onchange({ fields, settings, conditional_rules: conditionalRules });
	}

	function addField(type: FormFieldType) {
		const def = createFieldDef(type);
		fields = [...fields, def];
		selectedFieldId = def.id;
		emit();
	}

	function removeField(id: string) {
		fields = fields.filter((f) => f.id !== id);
		if (selectedFieldId === id) selectedFieldId = null;
		// Remove rules referencing this field
		conditionalRules = conditionalRules.filter(
			(r) => r.field_id !== id && r.target_field_id !== id
		);
		emit();
	}

	function reorderFields(newFields: FormFieldDef[]) {
		fields = newFields;
		emit();
	}

	function updateField(updated: FormFieldDef) {
		fields = fields.map((f) => (f.id === updated.id ? updated : f));
		emit();
	}

	function updateSettings(patch: Partial<FormSettings>) {
		settings = { ...settings, ...patch };
		emit();
	}

	function updateRules(newRules: FormConditionalRule[]) {
		conditionalRules = newRules;
		emit();
	}

	function addStep() {
		const steps = [...(settings.steps || [])];
		steps.push({ label: `Step ${steps.length + 1}` });
		updateSettings({ steps });
	}

	function removeStep(index: number) {
		const steps = (settings.steps || []).filter((_, i) => i !== index);
		updateSettings({ steps });
	}
</script>

<div class="flex h-full gap-0">
	<!-- Left: palette -->
	<div class="w-56 shrink-0 overflow-auto border-r p-3">
		<FieldPalette onadd={addField} />
	</div>

	<!-- Center: field list -->
	<div class="flex-1 overflow-auto p-4">
		<Tabs.Root value="fields">
			<Tabs.List>
				<Tabs.Trigger value="fields">Fields ({fields.length})</Tabs.Trigger>
				<Tabs.Trigger value="rules">Logic ({conditionalRules.length})</Tabs.Trigger>
				<Tabs.Trigger value="settings">Settings</Tabs.Trigger>
			</Tabs.List>

			<Tabs.Content value="fields" class="mt-3">
				<FieldList
					{fields}
					{selectedFieldId}
					onselect={(id: string) => (selectedFieldId = id)}
					onremove={removeField}
					onreorder={reorderFields}
				/>
			</Tabs.Content>

			<Tabs.Content value="rules" class="mt-3">
				<ConditionalRuleEditor
					rules={conditionalRules}
					{fields}
					onchange={updateRules}
				/>
			</Tabs.Content>

			<Tabs.Content value="settings" class="mt-3 space-y-4">
				<div>
					<Label for="submit-label">Submit Button Label</Label>
					<Input
						id="submit-label"
						value={settings.submit_label ?? 'Submit'}
						oninput={(e: Event) => updateSettings({ submit_label: (e.target as HTMLInputElement).value })}
					/>
				</div>
				<div>
					<Label for="success-msg">Success Message</Label>
					<Input
						id="success-msg"
						value={settings.success_message ?? 'Thank you for your submission!'}
						oninput={(e: Event) => updateSettings({ success_message: (e.target as HTMLInputElement).value })}
					/>
				</div>
				<div>
					<Label for="redirect-url">Redirect URL (optional)</Label>
					<Input
						id="redirect-url"
						value={settings.redirect_url ?? ''}
						placeholder="/thank-you"
						oninput={(e: Event) => updateSettings({ redirect_url: (e.target as HTMLInputElement).value || undefined })}
					/>
				</div>

				<div class="border-t pt-4">
					<div class="flex items-center justify-between">
						<Label for="multi-step">Multi-Step Form</Label>
						<Switch
							id="multi-step"
							checked={settings.multi_step ?? false}
							onCheckedChange={(v: boolean) => {
								updateSettings({
									multi_step: v,
									steps: v ? (settings.steps?.length ? settings.steps : [{ label: 'Step 1' }, { label: 'Step 2' }]) : undefined
								});
							}}
						/>
					</div>

					{#if settings.multi_step && settings.steps}
						<div class="mt-3 space-y-1">
							{#each settings.steps as step, i}
								<div class="flex items-center gap-2">
									<span class="text-muted-foreground w-6 text-xs">{i + 1}.</span>
									<Input
										value={step.label}
										class="h-8 text-sm"
										oninput={(e: Event) => {
											const steps = [...(settings.steps || [])];
											steps[i] = { label: (e.target as HTMLInputElement).value };
											updateSettings({ steps });
										}}
									/>
									<Button variant="ghost" size="icon" class="h-6 w-6 shrink-0" onclick={() => removeStep(i)} disabled={settings.steps!.length <= 2}>
										<Trash2 class="h-3 w-3 text-red-500" />
									</Button>
								</div>
							{/each}
							<Button variant="outline" size="sm" onclick={addStep}>
								<Plus class="mr-1 h-3 w-3" /> Add Step
							</Button>
						</div>
					{/if}
				</div>
			</Tabs.Content>
		</Tabs.Root>
	</div>

	<!-- Right: field config -->
	<div class="w-72 shrink-0 overflow-auto border-l p-3">
		{#if selectedField}
			<FieldConfig
				field={selectedField}
				{stepCount}
				onchange={updateField}
			/>
		{:else}
			<div class="text-muted-foreground py-8 text-center text-sm">
				Select a field to configure
			</div>
		{/if}
	</div>
</div>
