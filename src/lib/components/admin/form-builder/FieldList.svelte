<script lang="ts">
	import type { FormFieldDef } from '$lib/server/db/schema';
	import { dndzone } from 'svelte-dnd-action';
	import { FIELD_TYPE_MAP } from './field-types';
	import { Button } from '$lib/components/ui/button';
	import { GripVertical, Trash2, Settings2 } from '@lucide/svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { flip } from 'svelte/animate';

	interface Props {
		fields: FormFieldDef[];
		selectedFieldId: string | null;
		onselect: (id: string) => void;
		onremove: (id: string) => void;
		onreorder: (fields: FormFieldDef[]) => void;
	}

	let { fields, selectedFieldId, onselect, onremove, onreorder }: Props = $props();

	// DnD items need an `id` property
	let items = $derived(fields.map((f) => ({ ...f, id: f.id })));

	function handleDndConsider(e: CustomEvent<{ items: FormFieldDef[] }>) {
		onreorder(e.detail.items);
	}

	function handleDndFinalize(e: CustomEvent<{ items: FormFieldDef[] }>) {
		onreorder(e.detail.items);
	}
</script>

{#if fields.length === 0}
	<div class="text-muted-foreground rounded-lg border-2 border-dashed py-12 text-center text-sm">
		Add fields from the palette on the left
	</div>
{:else}
	<div
		use:dndzone={{ items, flipDurationMs: 200, type: 'form-fields' }}
		onconsider={handleDndConsider}
		onfinalize={handleDndFinalize}
		class="space-y-1"
	>
		{#each items as field (field.id)}
			{@const info = FIELD_TYPE_MAP.get(field.type)}
			<div animate:flip={{ duration: 200 }}>
				<button
					class="flex w-full items-center gap-2 rounded-md border p-2.5 text-left transition-colors {selectedFieldId === field.id ? 'border-primary bg-primary/5' : 'hover:bg-muted'}"
					onclick={() => onselect(field.id)}
				>
					<GripVertical class="text-muted-foreground h-4 w-4 shrink-0 cursor-grab" />
					{#if info}
						<svelte:component this={info.icon} class="text-muted-foreground h-4 w-4 shrink-0" />
					{/if}
					<span class="flex-1 truncate text-sm">{field.label}</span>
					{#if field.required}
						<span class="text-destructive text-xs">*</span>
					{/if}
					<Badge variant="outline" class="text-[10px]">{field.type}</Badge>
					<Button
						variant="ghost"
						size="icon"
						class="h-6 w-6 shrink-0"
						onclick={(e: MouseEvent) => {
							e.stopPropagation();
							onremove(field.id);
						}}
					>
						<Trash2 class="h-3 w-3 text-red-500" />
					</Button>
				</button>
			</div>
		{/each}
	</div>
{/if}
