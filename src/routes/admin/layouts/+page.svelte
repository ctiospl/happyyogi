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
	import { Plus, Edit, Star, Download, Trash2 } from '@lucide/svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let dialogOpen = $state(false);
	let seeding = $state(false);
	let newName = $state('');
	let newSlug = $state('');

	function generateSlug(name: string) {
		return name
			.toLowerCase()
			.replace(/[^a-z0-9\s-]/g, '')
			.replace(/\s+/g, '-')
			.replace(/-+/g, '-')
			.trim();
	}

	$effect(() => {
		newSlug = generateSlug(newName);
	});
</script>

<svelte:head>
	<title>Layouts | Admin | {data.tenant.name}</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<div class="mb-8 flex items-center justify-between">
		<h1 class="text-3xl font-bold">Layouts</h1>
		<div class="flex gap-2">
			{#if data.layouts.length === 0}
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
						{seeding ? 'Seeding...' : 'Seed Default Layout'}
					</Button>
				</form>
			{/if}

			<Dialog.Root bind:open={dialogOpen}>
				<Dialog.Trigger>
					{#snippet child({ props })}
						<Button {...props}>
							<Plus class="mr-2 h-4 w-4" />
							New Layout
						</Button>
					{/snippet}
				</Dialog.Trigger>
				<Dialog.Content>
					<Dialog.Header>
						<Dialog.Title>Create New Layout</Dialog.Title>
					</Dialog.Header>
					<form method="POST" action="?/create" use:enhance>
						<div class="space-y-4 py-4">
							<div>
								<Label for="name">Layout Name</Label>
								<Input id="name" name="name" placeholder="Default Layout" bind:value={newName} required />
							</div>
							<div>
								<Label for="slug">Slug</Label>
								<Input id="slug" name="slug" placeholder="default" bind:value={newSlug} required />
							</div>
						</div>
						<Dialog.Footer>
							<Button type="button" variant="outline" onclick={() => (dialogOpen = false)}>Cancel</Button>
							<Button type="submit">Create</Button>
						</Dialog.Footer>
					</form>
				</Dialog.Content>
			</Dialog.Root>
		</div>
	</div>

	{#if form?.success}
		<div class="mb-6 rounded-lg bg-green-500/10 p-4 text-green-600">
			{form.message || 'Done!'}
		</div>
	{/if}

	{#if form?.error}
		<div class="bg-destructive/10 text-destructive mb-6 rounded-lg p-4">{form.error}</div>
	{/if}

	<Card>
		<CardHeader>
			<CardTitle>All Layouts</CardTitle>
		</CardHeader>
		<CardContent>
			{#if data.layouts.length === 0}
				<div class="text-muted-foreground py-8 text-center">
					<p>No layouts yet. Seed the default layout or create one.</p>
				</div>
			{:else}
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>Name</Table.Head>
							<Table.Head>Slug</Table.Head>
							<Table.Head>Status</Table.Head>
							<Table.Head>Default</Table.Head>
							<Table.Head>Updated</Table.Head>
							<Table.Head class="text-right">Actions</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each data.layouts as layout}
							<Table.Row>
								<Table.Cell class="font-medium">{layout.name}</Table.Cell>
								<Table.Cell class="text-muted-foreground">{layout.slug}</Table.Cell>
								<Table.Cell>
									<Badge variant={layout.status === 'published' ? 'default' : 'secondary'}>
										{layout.status}
									</Badge>
								</Table.Cell>
								<Table.Cell>
									{#if layout.is_default}
										<Badge variant="outline" class="gap-1">
											<Star class="h-3 w-3" />
											Default
										</Badge>
									{:else}
										<form method="POST" action="?/setDefault" use:enhance class="inline">
											<input type="hidden" name="layoutId" value={layout.id} />
											<Button type="submit" variant="ghost" size="sm">Set Default</Button>
										</form>
									{/if}
								</Table.Cell>
								<Table.Cell class="text-muted-foreground">
									{new Date(layout.updated_at).toLocaleDateString()}
								</Table.Cell>
								<Table.Cell class="text-right">
									<div class="flex justify-end gap-2">
										<Button href="/admin/layouts/{layout.id}/edit" variant="ghost" size="icon">
											<Edit class="h-4 w-4" />
										</Button>
										{#if !layout.is_default}
											<form method="POST" action="?/delete" use:enhance class="inline">
												<input type="hidden" name="layoutId" value={layout.id} />
												<Button type="submit" variant="ghost" size="icon">
													<Trash2 class="h-4 w-4 text-red-500" />
												</Button>
											</form>
										{/if}
									</div>
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			{/if}
		</CardContent>
	</Card>
</div>
