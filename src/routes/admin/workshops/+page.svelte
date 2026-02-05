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
	import { Plus, Edit, Eye, Users } from '@lucide/svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let dialogOpen = $state(false);
	let newTitle = $state('');
	let newSlug = $derived(
		newTitle
			.toLowerCase()
			.replace(/[^a-z0-9\s-]/g, '')
			.replace(/\s+/g, '-')
			.replace(/-+/g, '-')
			.trim()
	);

	function getStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
		switch (status) {
			case 'published':
				return 'default';
			case 'cancelled':
				return 'destructive';
			case 'completed':
				return 'outline';
			default:
				return 'secondary';
		}
	}

	function getModeLabel(mode: string): string {
		switch (mode) {
			case 'online':
				return 'Online';
			case 'offline':
				return 'In-Person';
			case 'hybrid':
				return 'Hybrid';
			default:
				return mode;
		}
	}

	function formatPrice(paise: number): string {
		return new Intl.NumberFormat('en-IN', {
			style: 'currency',
			currency: 'INR',
			minimumFractionDigits: 0
		}).format(paise / 100);
	}
</script>

<svelte:head>
	<title>Workshops | Admin | {data.tenant.name}</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<div class="mb-8 flex items-center justify-between">
		<h1 class="text-3xl font-bold">Workshops</h1>
		<Dialog.Root bind:open={dialogOpen}>
			<Dialog.Trigger>
				{#snippet child({ props })}
					<Button {...props}>
						<Plus class="mr-2 h-4 w-4" />
						New Workshop
					</Button>
				{/snippet}
			</Dialog.Trigger>
			<Dialog.Content>
				<Dialog.Header>
					<Dialog.Title>Create New Workshop</Dialog.Title>
				</Dialog.Header>
				<form method="POST" action="?/create" use:enhance>
					<div class="space-y-4 py-4">
						<div>
							<Label for="title">Workshop Title</Label>
							<Input
								id="title"
								name="title"
								placeholder="Yoga Fundamentals"
								bind:value={newTitle}
								required
							/>
						</div>
						<div>
							<Label for="slug">URL Slug</Label>
							<Input
								id="slug"
								name="slug"
								placeholder="yoga-fundamentals"
								value={newSlug}
								required
							/>
							<p class="text-muted-foreground mt-1 text-sm">
								Workshop will be available at: /workshops/{newSlug}
							</p>
						</div>
					</div>
					<Dialog.Footer>
						<Button type="button" variant="outline" onclick={() => (dialogOpen = false)}>
							Cancel
						</Button>
						<Button type="submit">Create Workshop</Button>
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
			<CardTitle>All Workshops</CardTitle>
		</CardHeader>
		<CardContent>
			{#if data.workshops.length === 0}
				<div class="text-muted-foreground py-8 text-center">
					<p>No workshops yet. Create your first workshop to get started.</p>
				</div>
			{:else}
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>Title</Table.Head>
							<Table.Head>Mode</Table.Head>
							<Table.Head>Price</Table.Head>
							<Table.Head>Status</Table.Head>
							<Table.Head>Bookings</Table.Head>
							<Table.Head>Sessions</Table.Head>
							<Table.Head class="text-right">Actions</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each data.workshops as workshop (workshop.id)}
							<Table.Row>
								<Table.Cell>
									<div>
										<div class="font-medium">{workshop.title}</div>
										<div class="text-muted-foreground text-sm">/{workshop.slug}</div>
									</div>
								</Table.Cell>
								<Table.Cell>
									<Badge variant="outline">{getModeLabel(workshop.mode)}</Badge>
								</Table.Cell>
								<Table.Cell>{formatPrice(workshop.price_paise)}</Table.Cell>
								<Table.Cell>
									<Badge variant={getStatusVariant(workshop.status)}>
										{workshop.status}
									</Badge>
								</Table.Cell>
								<Table.Cell>
									<div class="flex items-center gap-1">
										<Users class="h-4 w-4" />
										<span>{workshop.bookings_count || 0}</span>
										{#if workshop.capacity}
											<span class="text-muted-foreground">/ {workshop.capacity}</span>
										{/if}
									</div>
								</Table.Cell>
								<Table.Cell>{workshop.sessions.length}</Table.Cell>
								<Table.Cell class="text-right">
									<div class="flex justify-end gap-2">
										<Button href="/admin/workshops/{workshop.id}" variant="ghost" size="icon">
											<Edit class="h-4 w-4" />
										</Button>
										{#if workshop.status === 'published'}
											<Button
												href="/workshops/{workshop.slug}"
												variant="ghost"
												size="icon"
												target="_blank"
											>
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
