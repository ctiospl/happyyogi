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
	import { Plus, Edit, Trash2, Eye, Inbox } from '@lucide/svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let dialogOpen = $state(false);
	let newTitle = $state('');
	let newSlug = $state('');
	let newType = $state<'standalone' | 'inline'>('standalone');

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

	const statusVariant = (status: string) =>
		status === 'published' ? 'default' as const : status === 'archived' ? 'outline' as const : 'secondary' as const;

	const typeVariant = (type: string) =>
		type === 'standalone' ? 'default' as const : 'secondary' as const;
</script>

<svelte:head>
	<title>Forms | Admin | {data.tenant.name}</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<div class="mb-8 flex items-center justify-between">
		<h1 class="text-3xl font-bold">Forms</h1>
		<Dialog.Root bind:open={dialogOpen}>
			<Dialog.Trigger>
				{#snippet child({ props })}
					<Button {...props}>
						<Plus class="mr-2 h-4 w-4" />
						New Form
					</Button>
				{/snippet}
			</Dialog.Trigger>
			<Dialog.Content>
				<Dialog.Header>
					<Dialog.Title>Create New Form</Dialog.Title>
				</Dialog.Header>
				<form method="POST" action="?/create" use:enhance>
					<div class="space-y-4 py-4">
						<div>
							<Label for="title">Form Title</Label>
							<Input
								id="title"
								name="title"
								placeholder="Contact Us"
								bind:value={newTitle}
								required
							/>
						</div>
						<div>
							<Label for="slug">URL Slug</Label>
							<Input id="slug" name="slug" placeholder="contact-us" bind:value={newSlug} required />
							<p class="text-muted-foreground mt-1 text-sm">
								Standalone forms at: /forms/{newSlug}
							</p>
						</div>
						<div>
							<Label for="type">Type</Label>
							<select
								id="type"
								name="type"
								bind:value={newType}
								class="border-input bg-background ring-offset-background flex h-10 w-full rounded-md border px-3 py-2 text-sm"
							>
								<option value="standalone">Standalone (own URL)</option>
								<option value="inline">Inline (embed in page)</option>
							</select>
						</div>
					</div>
					<Dialog.Footer>
						<Button type="button" variant="outline" onclick={() => (dialogOpen = false)}>
							Cancel
						</Button>
						<Button type="submit">Create Form</Button>
					</Dialog.Footer>
				</form>
			</Dialog.Content>
		</Dialog.Root>
	</div>

	{#if form?.error}
		<div class="bg-destructive/10 text-destructive mb-6 rounded-lg p-4">{form.error}</div>
	{/if}

	<Card>
		<CardHeader>
			<CardTitle>All Forms</CardTitle>
		</CardHeader>
		<CardContent>
			{#if data.forms.length === 0}
				<div class="text-muted-foreground py-8 text-center">
					<p>No forms yet. Create your first form to get started.</p>
				</div>
			{:else}
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>Title</Table.Head>
							<Table.Head>Slug</Table.Head>
							<Table.Head>Type</Table.Head>
							<Table.Head>Status</Table.Head>
							<Table.Head>Submissions</Table.Head>
							<Table.Head>Updated</Table.Head>
							<Table.Head class="text-right">Actions</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each data.forms as formItem}
							<Table.Row>
								<Table.Cell class="font-medium">{formItem.title}</Table.Cell>
								<Table.Cell class="text-muted-foreground">/{formItem.slug}</Table.Cell>
								<Table.Cell>
									<Badge variant={typeVariant(formItem.type)}>{formItem.type}</Badge>
								</Table.Cell>
								<Table.Cell>
									<Badge variant={statusVariant(formItem.status)}>{formItem.status}</Badge>
								</Table.Cell>
								<Table.Cell>{formItem.submission_count}</Table.Cell>
								<Table.Cell class="text-muted-foreground">
									{new Date(formItem.updated_at).toLocaleDateString()}
								</Table.Cell>
								<Table.Cell class="text-right">
									<div class="flex justify-end gap-2">
										<Button href="/admin/forms/{formItem.id}/edit" variant="ghost" size="icon">
											<Edit class="h-4 w-4" />
										</Button>
										<Button href="/admin/forms/{formItem.id}/submissions" variant="ghost" size="icon">
											<Inbox class="h-4 w-4" />
										</Button>
										{#if formItem.status === 'published' && formItem.type === 'standalone'}
											<Button href="/forms/{formItem.slug}" variant="ghost" size="icon" target="_blank">
												<Eye class="h-4 w-4" />
											</Button>
										{/if}
										<form method="POST" action="?/delete" use:enhance={() => {
											if (!confirm('Delete this form and all submissions?')) {
												return async () => {};
											}
											return async ({ update }) => update();
										}}>
											<input type="hidden" name="id" value={formItem.id} />
											<Button type="submit" variant="ghost" size="icon">
												<Trash2 class="h-4 w-4 text-red-500" />
											</Button>
										</form>
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
