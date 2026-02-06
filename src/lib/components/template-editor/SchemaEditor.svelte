<script lang="ts">
	import type { TemplateSchema, TemplateSchemaField } from '$lib/server/db/schema';
	import SchemaFieldEditor from './SchemaFieldEditor.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Plus } from '@lucide/svelte';
	import { dndzone } from 'svelte-dnd-action';
	import { flip } from 'svelte/animate';

	interface Props {
		schema: TemplateSchema;
		onchange?: (schema: TemplateSchema) => void;
		class?: string;
	}

	let { schema, onchange, class: className = '' }: Props = $props();

	type DndField = TemplateSchemaField & { id: string };
	let fields = $state<DndField[]>(schema.fields.map(f => ({ ...f, id: f.key })));

	function addField() {
		const key = `field_${fields.length + 1}`;
		const newField: DndField = {
			key,
			id: key,
			type: 'text',
			label: `Field ${fields.length + 1}`
		};
		fields = [...fields, newField];
		emitChange();
	}

	function updateField(index: number, field: TemplateSchemaField) {
		fields = fields.map((f, i) => (i === index ? { ...field, id: field.key } : f));
		emitChange();
	}

	function handleDndConsider(e: CustomEvent<{ items: DndField[] }>) {
		fields = e.detail.items;
	}

	function handleDndFinalize(e: CustomEvent<{ items: DndField[] }>) {
		fields = e.detail.items;
		emitChange();
	}

	function deleteField(index: number) {
		fields = fields.filter((_, i) => i !== index);
		emitChange();
	}

	function emitChange() {
		// Strip DnD `id` property before emitting
		const clean = fields.map(({ id, ...rest }) => rest);
		onchange?.({ fields: clean });
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
		<div
			class="fields-list"
			use:dndzone={{ items: fields, flipDurationMs: 200, type: 'schema-fields' }}
			onconsider={handleDndConsider}
			onfinalize={handleDndFinalize}
		>
			{#each fields as field, index (field.id)}
				<div animate:flip={{ duration: 200 }}>
					<SchemaFieldEditor
						{field}
						onchange={(f) => updateField(index, f)}
						ondelete={() => deleteField(index)}
					/>
				</div>
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
