<script lang="ts">
	import type { TemplateSchema, TemplateSchemaField } from '$lib/server/db/schema';
	import SchemaFieldEditor from './SchemaFieldEditor.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Plus } from '@lucide/svelte';

	interface Props {
		schema: TemplateSchema;
		onchange?: (schema: TemplateSchema) => void;
		class?: string;
	}

	let { schema, onchange, class: className = '' }: Props = $props();

	let fields = $state<TemplateSchemaField[]>([...schema.fields]);

	function addField() {
		const newField: TemplateSchemaField = {
			key: `field_${fields.length + 1}`,
			type: 'text',
			label: `Field ${fields.length + 1}`
		};
		fields = [...fields, newField];
		emitChange();
	}

	function updateField(index: number, field: TemplateSchemaField) {
		fields = fields.map((f, i) => (i === index ? field : f));
		emitChange();
	}

	function deleteField(index: number) {
		fields = fields.filter((_, i) => i !== index);
		emitChange();
	}

	function emitChange() {
		onchange?.({ fields });
	}
</script>

<div class="schema-editor {className}">
	<div class="schema-header">
		<h4 class="schema-title">Schema Fields</h4>
		<Button variant="outline" size="sm" onclick={addField}>
			<Plus class="mr-1 h-3 w-3" />
			Add Field
		</Button>
	</div>

	{#if fields.length === 0}
		<div class="empty-state">
			<p>No schema fields defined.</p>
			<p class="hint">Add fields to define editable props for this template.</p>
		</div>
	{:else}
		<div class="fields-list">
			{#each fields as field, index (field.key + index)}
				<SchemaFieldEditor
					{field}
					onchange={(f) => updateField(index, f)}
					ondelete={() => deleteField(index)}
				/>
			{/each}
		</div>
	{/if}
</div>

<style>
	.schema-editor {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.schema-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.schema-title {
		font-size: 14px;
		font-weight: 600;
		margin: 0;
	}

	.empty-state {
		text-align: center;
		padding: 24px;
		color: var(--muted-foreground);
	}

	.empty-state p {
		margin: 0;
		font-size: 14px;
	}

	.empty-state .hint {
		font-size: 12px;
		margin-top: 4px;
	}

	.fields-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
</style>
