<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Badge } from '$lib/components/ui/badge';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Table from '$lib/components/ui/table';
	import * as Select from '$lib/components/ui/select';
	import { Plus, Edit, Code, AlertCircle, CheckCircle, Download } from '@lucide/svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let dialogOpen = $state(false);
	let seeding = $state(false);
	let newName = $state('');
	let selectedCategory = $state('section');
	let newSlug = $derived(
		newName
			.toLowerCase()
			.replace(/[^a-z0-9\s-]/g, '')
			.replace(/\s+/g, '-')
			.replace(/-+/g, '-')
			.trim()
	);

	const categoryOptions = [
		{ value: 'layout', label: 'Layout' },
		{ value: 'section', label: 'Section' },
		{ value: 'component', label: 'Component' },
		{ value: 'custom', label: 'Custom' }
	];

	function getCategoryVariant(category: string): 'default' | 'secondary' | 'outline' {
		switch (category) {
			case 'layout':
				return 'default';
			case 'section':
				return 'secondary';
			default:
				return 'outline';
		}
	}

	function formatDate(date: Date | string): string {
		return new Date(date).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>Templates | Admin | {data.tenant.name}</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<div class="mb-8 flex items-center justify-between">
		<h1 class="text-3xl font-bold">Templates</h1>
		<div class="flex gap-2">
			{#if !data.hasCoreTemplates}
				<form
					method="POST"
					action="?/seed"
					use:enhance={() => {
						seeding = true;
						return async ({ update }) => {
							await update();
							seeding = false;
						};
					}}
				>
					<Button type="submit" variant="outline" disabled={seeding}>
						<Download class="mr-2 h-4 w-4" />
						{seeding ? 'Seeding...' : 'Seed Core Templates'}
					</Button>
				</form>
			{/if}
			<Dialog.Root bind:open={dialogOpen}>
			<Dialog.Trigger>
				{#snippet child({ props })}
					<Button {...props}>
						<Plus class="mr-2 h-4 w-4" />
						New Template
					</Button>
				{/snippet}
			</Dialog.Trigger>
			<Dialog.Content>
				<Dialog.Header>
					<Dialog.Title>Create New Template</Dialog.Title>
				</Dialog.Header>
				<form method="POST" action="?/create" use:enhance>
					<div class="space-y-4 py-4">
						<div>
							<Label for="name">Template Name</Label>
							<Input
								id="name"
								name="name"
								placeholder="Hero Section"
								bind:value={newName}
								required
							/>
						</div>
						<div>
							<Label for="slug">Slug</Label>
							<Input
								id="slug"
								name="slug"
								placeholder="hero-section"
								value={newSlug}
								required
							/>
						</div>
						<div>
							<Label for="category">Category</Label>
							<Select.Root type="single" bind:value={selectedCategory} name="category">
								<Select.Trigger class="w-full">
									{categoryOptions.find((o) => o.value === selectedCategory)?.label ?? 'Select category'}
								</Select.Trigger>
								<Select.Content>
									{#each categoryOptions as option}
										<Select.Item value={option.value} label={option.label} />
									{/each}
								</Select.Content>
							</Select.Root>
							<input type="hidden" name="category" value={selectedCategory} />
						</div>
					</div>
					<Dialog.Footer>
						<Button type="button" variant="outline" onclick={() => (dialogOpen = false)}>
							Cancel
						</Button>
						<Button type="submit">Create Template</Button>
					</Dialog.Footer>
				</form>
			</Dialog.Content>
		</Dialog.Root>
		</div>
	</div>

	{#if form?.success}
		<div class="mb-6 rounded-lg bg-green-500/10 p-4 text-green-600">
			Core templates seeded successfully! Created {form.seedResult?.created?.length ?? 0} templates.
		</div>
	{/if}

	{#if form?.error}
		<div class="bg-destructive/10 text-destructive mb-6 rounded-lg p-4">{form.error}</div>
	{/if}

	<Card>
		<CardHeader>
			<CardTitle>All Templates</CardTitle>
		</CardHeader>
		<CardContent>
			{#if data.templates.length === 0}
				<div class="text-muted-foreground py-8 text-center">
					<Code class="mx-auto mb-4 h-12 w-12 opacity-50" />
					<p>No templates yet. Create your first template to get started.</p>
				</div>
			{:else}
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>Name</Table.Head>
							<Table.Head>Category</Table.Head>
							<Table.Head>Status</Table.Head>
							<Table.Head>Updated</Table.Head>
							<Table.Head class="text-right">Actions</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each data.templates as template (template.id)}
							<Table.Row>
								<Table.Cell>
									<div>
										<div class="font-medium">{template.name}</div>
										<div class="text-muted-foreground text-sm">{template.slug}</div>
									</div>
								</Table.Cell>
								<Table.Cell>
									<Badge variant={getCategoryVariant(template.category)}>
										{template.category}
									</Badge>
								</Table.Cell>
								<Table.Cell>
									{#if template.compile_error}
										<Badge variant="destructive" class="gap-1">
											<AlertCircle class="h-3 w-3" />
											Error
										</Badge>
									{:else if template.compiled_js}
										<Badge variant="outline" class="gap-1 text-green-600">
											<CheckCircle class="h-3 w-3" />
											Compiled
										</Badge>
									{:else}
										<Badge variant="secondary">Draft</Badge>
									{/if}
								</Table.Cell>
								<Table.Cell>
									{formatDate(template.updated_at)}
								</Table.Cell>
								<Table.Cell class="text-right">
									<Button href="/admin/templates/{template.id}" variant="ghost" size="icon">
										<Edit class="h-4 w-4" />
									</Button>
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			{/if}
		</CardContent>
	</Card>
</div>
