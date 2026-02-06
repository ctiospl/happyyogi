<script lang="ts">
	import type { PageBlock, Template } from '$lib/server/db/schema';
	import BlockPropsForm from './BlockPropsForm.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Collapsible from '$lib/components/ui/collapsible';
	import { Plus, Trash2, ChevronUp, ChevronDown, GripVertical } from '@lucide/svelte';
	const randomUUID = () => crypto.randomUUID();

	interface Props {
		blocks: PageBlock[];
		templates: Template[];
		onchange: (blocks: PageBlock[]) => void;
		categoryFilter?: string;
	}

	let { blocks, templates, onchange, categoryFilter = 'section' }: Props = $props();

	let addDialogOpen = $state(false);
	let expandedBlock = $state<string | null>(null);

	const templateMap = $derived(new Map(templates.map(t => [t.id, t])));

	function getTemplateName(templateId: string): string {
		return templateMap.get(templateId)?.name ?? 'Unknown Template';
	}

	function getTemplateSlug(templateId: string): string {
		return templateMap.get(templateId)?.slug ?? '';
	}

	function addBlock(template: Template) {
		const defaultProps: Record<string, unknown> = {};
		if (template.schema?.fields) {
			for (const field of template.schema.fields) {
				if (template.sample_data?.[field.key] !== undefined) {
					defaultProps[field.key] = template.sample_data[field.key];
				} else {
					defaultProps[field.key] = field.type === 'boolean' ? false : '';
				}
			}
		}

		const newBlock: PageBlock = {
			id: randomUUID(),
			template_id: template.id,
			props: defaultProps
		};

		onchange([...blocks, newBlock]);
		addDialogOpen = false;
		expandedBlock = newBlock.id;
	}

	function removeBlock(index: number) {
		const updated = blocks.filter((_, i) => i !== index);
		onchange(updated);
	}

	function moveBlock(index: number, direction: -1 | 1) {
		const newIndex = index + direction;
		if (newIndex < 0 || newIndex >= blocks.length) return;
		const updated = [...blocks];
		[updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
		onchange(updated);
	}

	function updateBlockProps(index: number, props: Record<string, unknown>) {
		const updated = [...blocks];
		updated[index] = { ...updated[index], props };
		onchange(updated);
	}

	// Filter templates by category
	const sectionTemplates = $derived(
		templates.filter(t => t.category === categoryFilter)
	);
</script>

<div class="space-y-3">
	{#each blocks as block, i (block.id)}
		{@const template = templateMap.get(block.template_id)}
		<Card class="relative">
			<Collapsible.Root open={expandedBlock === block.id}>
				<div class="flex items-center gap-2 px-4 py-2">
					<GripVertical class="text-muted-foreground h-4 w-4 cursor-grab" />
					<div class="flex-1">
						<span class="text-sm font-medium">{getTemplateName(block.template_id)}</span>
						<span class="text-muted-foreground ml-2 text-xs">{getTemplateSlug(block.template_id)}</span>
					</div>
					<div class="flex items-center gap-1">
						<Button
							variant="ghost"
							size="icon"
							class="h-7 w-7"
							disabled={i === 0}
							onclick={() => moveBlock(i, -1)}
						>
							<ChevronUp class="h-4 w-4" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							class="h-7 w-7"
							disabled={i === blocks.length - 1}
							onclick={() => moveBlock(i, 1)}
						>
							<ChevronDown class="h-4 w-4" />
						</Button>
						<Collapsible.Trigger>
							{#snippet child({ props })}
								<Button
									variant="ghost"
									size="sm"
									{...props}
									onclick={() => {
										expandedBlock = expandedBlock === block.id ? null : block.id;
									}}
								>
									{expandedBlock === block.id ? 'Collapse' : 'Edit'}
								</Button>
							{/snippet}
						</Collapsible.Trigger>
						<Button
							variant="ghost"
							size="icon"
							class="h-7 w-7"
							onclick={() => removeBlock(i)}
						>
							<Trash2 class="h-4 w-4 text-red-500" />
						</Button>
					</div>
				</div>
				<Collapsible.Content>
					<CardContent class="border-t pt-4">
						{#if template?.schema?.fields?.length}
							<BlockPropsForm
								fields={template.schema.fields}
								values={block.props}
								onchange={(v) => updateBlockProps(i, v)}
								prefix="block-{i}-"
							/>
						{:else}
							<p class="text-muted-foreground text-sm">No editable fields for this template.</p>
						{/if}
					</CardContent>
				</Collapsible.Content>
			</Collapsible.Root>
		</Card>
	{/each}

	{#if blocks.length === 0}
		<div class="text-muted-foreground rounded-lg border-2 border-dashed py-12 text-center">
			<p class="mb-2">No blocks yet</p>
			<Button variant="outline" onclick={() => (addDialogOpen = true)}>
				<Plus class="mr-1 h-4 w-4" />
				Add First Block
			</Button>
		</div>
	{:else}
		<Button variant="outline" class="w-full" onclick={() => (addDialogOpen = true)}>
			<Plus class="mr-1 h-4 w-4" />
			Add Block
		</Button>
	{/if}
</div>

<!-- Add block dialog -->
<Dialog.Root bind:open={addDialogOpen}>
	<Dialog.Content class="max-w-lg">
		<Dialog.Header>
			<Dialog.Title>Add Block</Dialog.Title>
		</Dialog.Header>
		<div class="grid gap-2 py-4">
			{#each sectionTemplates as template (template.id)}
				<button
					class="hover:bg-muted flex items-center gap-3 rounded-lg border p-3 text-left transition-colors"
					onclick={() => addBlock(template)}
				>
					<div>
						<p class="font-medium">{template.name}</p>
						{#if template.description}
							<p class="text-muted-foreground text-sm">{template.description}</p>
						{/if}
					</div>
				</button>
			{/each}
		</div>
	</Dialog.Content>
</Dialog.Root>
