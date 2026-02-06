<script lang="ts">
	import type { PageBlock, Template, Form } from '$lib/server/db/schema';
	import BlockPropsForm from './BlockPropsForm.svelte';
	import FormPicker from './form-builder/FormPicker.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Collapsible from '$lib/components/ui/collapsible';
	import { Plus, Trash2, GripVertical, ClipboardList } from '@lucide/svelte';
	import { dndzone } from 'svelte-dnd-action';
	import { flip } from 'svelte/animate';
	const randomUUID = () => crypto.randomUUID();

	interface Props {
		blocks: PageBlock[];
		templates: Template[];
		forms?: Form[];
		onchange: (blocks: PageBlock[]) => void;
		categoryFilter?: string;
	}

	let { blocks, templates, forms = [], onchange, categoryFilter = 'section' }: Props = $props();

	let addDialogOpen = $state(false);
	let expandedBlock = $state<string | null>(null);

	const templateMap = $derived(new Map(templates.map(t => [t.id, t])));

	const formMap = $derived(new Map(forms.map(f => [f.id, f])));

	function getTemplateName(block: PageBlock): string {
		if (block.template_id === '__form__') {
			const form = formMap.get(block.props.form_id as string);
			return form ? `Form: ${form.title}` : 'Form Block';
		}
		return templateMap.get(block.template_id)?.name ?? 'Unknown Template';
	}

	function getTemplateSlug(block: PageBlock): string {
		if (block.template_id === '__form__') return 'form';
		return templateMap.get(block.template_id)?.slug ?? '';
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

	function addFormBlock(formId: string) {
		const newBlock: PageBlock = {
			id: randomUUID(),
			template_id: '__form__',
			props: { form_id: formId }
		};
		onchange([...blocks, newBlock]);
		addDialogOpen = false;
		expandedBlock = newBlock.id;
	}

	function removeBlock(index: number) {
		const updated = blocks.filter((_, i) => i !== index);
		onchange(updated);
	}

	function handleDndConsider(e: CustomEvent<{ items: PageBlock[] }>) {
		onchange(e.detail.items);
	}

	function handleDndFinalize(e: CustomEvent<{ items: PageBlock[] }>) {
		onchange(e.detail.items);
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

<div
	class="space-y-3"
	use:dndzone={{ items: blocks, flipDurationMs: 200, type: 'page-blocks' }}
	onconsider={handleDndConsider}
	onfinalize={handleDndFinalize}
>
	{#each blocks as block, i (block.id)}
		{@const template = templateMap.get(block.template_id)}
		<div animate:flip={{ duration: 200 }}>
		<Card class="relative">
			<Collapsible.Root open={expandedBlock === block.id}>
				<div class="flex items-center gap-2 px-4 py-2">
					<GripVertical class="text-muted-foreground h-4 w-4 cursor-grab" />
					<div class="flex-1">
						<span class="text-sm font-medium">{getTemplateName(block)}</span>
						<span class="text-muted-foreground ml-2 text-xs">{getTemplateSlug(block)}</span>
					</div>
					<div class="flex items-center gap-1">
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
						{#if block.template_id === '__form__'}
							<FormPicker
								{forms}
								value={block.props.form_id as string ?? ''}
								onchange={(formId) => updateBlockProps(i, { form_id: formId })}
							/>
						{:else if template?.schema?.fields?.length}
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
		</div>
	{/each}
</div>

{#if blocks.length === 0}
	<div class="text-muted-foreground rounded-lg border-2 border-dashed py-12 text-center">
		<p class="mb-2">No blocks yet</p>
		<Button variant="outline" onclick={() => (addDialogOpen = true)}>
			<Plus class="mr-1 h-4 w-4" />
			Add First Block
		</Button>
	</div>
{:else}
	<Button variant="outline" class="mt-3 w-full" onclick={() => (addDialogOpen = true)}>
		<Plus class="mr-1 h-4 w-4" />
		Add Block
	</Button>
{/if}

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
			{#if forms.length > 0}
				<div class="border-t pt-2">
					<p class="text-muted-foreground mb-2 text-xs font-medium uppercase">Forms</p>
					{#each forms.filter(f => f.status === 'published') as formItem (formItem.id)}
						<button
							class="hover:bg-muted flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors"
							onclick={() => addFormBlock(formItem.id)}
						>
							<ClipboardList class="text-muted-foreground h-5 w-5 shrink-0" />
							<div>
								<p class="font-medium">{formItem.title}</p>
								<p class="text-muted-foreground text-sm">Inline form</p>
							</div>
						</button>
					{/each}
				</div>
			{/if}
		</div>
	</Dialog.Content>
</Dialog.Root>
