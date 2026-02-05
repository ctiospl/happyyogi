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
	import { Plus, Edit, Eye, Trash2, Download } from '@lucide/svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let dialogOpen = $state(false);
	let seeding = $state(false);
	let newTitle = $state('');
	let newSlug = $state('');

	function generateSlug(title: string) {
		return title
			.toLowerCase()
			.replace(/[^a-z0-9\s-]/g, '')
			.replace(/\s+/g, '-')
			.replace(/-+/g, '-')
			.trim();
	}

	$effect(() => {
		newSlug = generateSlug(newTitle);
	});
</script>

<svelte:head>
	<title>Pages | Admin | {data.tenant.name}</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<div class="mb-8 flex items-center justify-between">
		<h1 class="text-3xl font-bold">Pages</h1>
		<div class="flex gap-2">
			{#if !data.hasCorePages}
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
						{seeding ? 'Seeding...' : 'Seed Core Pages'}
					</Button>
				</form>
			{/if}
			<Dialog.Root bind:open={dialogOpen}>
			<Dialog.Trigger>
				{#snippet child({ props })}
					<Button {...props}>
						<Plus class="mr-2 h-4 w-4" />
						New Page
					</Button>
				{/snippet}
			</Dialog.Trigger>
			<Dialog.Content>
				<Dialog.Header>
					<Dialog.Title>Create New Page</Dialog.Title>
				</Dialog.Header>
				<form method="POST" action="?/create" use:enhance>
					<div class="space-y-4 py-4">
						<div>
							<Label for="title">Page Title</Label>
							<Input
								id="title"
								name="title"
								placeholder="About Us"
								bind:value={newTitle}
								required
							/>
						</div>
						<div>
							<Label for="slug">URL Slug</Label>
							<Input id="slug" name="slug" placeholder="about-us" bind:value={newSlug} required />
							<p class="text-muted-foreground mt-1 text-sm">
								Page will be available at: /{newSlug}
							</p>
						</div>
					</div>
					<Dialog.Footer>
						<Button type="button" variant="outline" onclick={() => (dialogOpen = false)}>
							Cancel
						</Button>
						<Button type="submit">Create Page</Button>
					</Dialog.Footer>
				</form>
			</Dialog.Content>
		</Dialog.Root>
		</div>
	</div>

	{#if form?.success}
		<div class="mb-6 rounded-lg bg-green-500/10 p-4 text-green-600">
			Core pages seeded successfully! Created {form.seedResult?.created?.length ?? 0} pages.
		</div>
	{/if}

	{#if form?.error}
		<div class="bg-destructive/10 text-destructive mb-6 rounded-lg p-4">{form.error}</div>
	{/if}

	<Card>
		<CardHeader>
			<CardTitle>All Pages</CardTitle>
		</CardHeader>
		<CardContent>
			{#if data.pages.length === 0}
				<div class="text-muted-foreground py-8 text-center">
					<p>No pages yet. Create your first page to get started.</p>
				</div>
			{:else}
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>Title</Table.Head>
							<Table.Head>Slug</Table.Head>
							<Table.Head>Status</Table.Head>
							<Table.Head>Updated</Table.Head>
							<Table.Head class="text-right">Actions</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each data.pages as page}
							<Table.Row>
								<Table.Cell class="font-medium">{page.title}</Table.Cell>
								<Table.Cell class="text-muted-foreground">/{page.slug}</Table.Cell>
								<Table.Cell>
									<Badge variant={page.status === 'published' ? 'default' : 'secondary'}>
										{page.status}
									</Badge>
								</Table.Cell>
								<Table.Cell class="text-muted-foreground">
									{new Date(page.updated_at).toLocaleDateString()}
								</Table.Cell>
								<Table.Cell class="text-right">
									<div class="flex justify-end gap-2">
										<Button href="/admin/pages/{page.id}/edit" variant="ghost" size="icon">
											<Edit class="h-4 w-4" />
										</Button>
										{#if page.status === 'published'}
											<Button href="/{page.slug}" variant="ghost" size="icon" target="_blank">
												<Eye class="h-4 w-4" />
											</Button>
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
