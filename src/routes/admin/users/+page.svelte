<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Badge } from '$lib/components/ui/badge';
	import * as Table from '$lib/components/ui/table';
	import { Search, User, ChevronLeft, ChevronRight } from '@lucide/svelte';

	let { data }: { data: PageData } = $props();

	let searchValue = $state(data.search ?? '');
	let searchTimeout: ReturnType<typeof setTimeout>;

	function handleSearch() {
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => {
			const params = new URLSearchParams();
			if (searchValue) params.set('search', searchValue);
			goto(`/admin/users?${params.toString()}`, { replaceState: true });
		}, 300);
	}

	function getRoleBadgeVariant(role: string | undefined) {
		if (role === 'admin' || role === 'superadmin') return 'default';
		return 'secondary';
	}

	function getRoleLabel(role: string | undefined) {
		if (!role) return 'user';
		return role;
	}

	const totalPages = $derived(Math.ceil(data.total / data.limit));
</script>

<svelte:head>
	<title>Users | Admin | {data.tenant.name}</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<div class="mb-8 flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold">Users</h1>
			<p class="text-muted-foreground">{data.total} total users</p>
		</div>
	</div>

	<Card class="mb-6">
		<CardContent class="pt-6">
			<div class="relative">
				<Search class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					type="search"
					placeholder="Search by name, phone, or email..."
					class="pl-10"
					bind:value={searchValue}
					oninput={handleSearch}
				/>
			</div>
		</CardContent>
	</Card>

	<Card>
		<CardHeader>
			<CardTitle>All Users</CardTitle>
		</CardHeader>
		<CardContent>
			{#if data.users.length === 0}
				<div class="py-8 text-center text-muted-foreground">
					{#if data.search}
						<p>No users found matching "{data.search}"</p>
					{:else}
						<p>No users yet.</p>
					{/if}
				</div>
			{:else}
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>User</Table.Head>
							<Table.Head>Phone</Table.Head>
							<Table.Head>Email</Table.Head>
							<Table.Head>Role</Table.Head>
							<Table.Head>Bookings</Table.Head>
							<Table.Head>Joined</Table.Head>
							<Table.Head class="text-right">Actions</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each data.users as user (user.id)}
							<Table.Row>
								<Table.Cell class="font-medium">
									<div class="flex items-center gap-2">
										{#if user.avatar_url}
											<img
												src={user.avatar_url}
												alt={user.name || 'User'}
												class="h-8 w-8 rounded-full object-cover"
											/>
										{:else}
											<div class="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
												<User class="h-4 w-4 text-muted-foreground" />
											</div>
										{/if}
										<span>{user.name || '-'}</span>
									</div>
								</Table.Cell>
								<Table.Cell>
									<div class="flex items-center gap-1">
										{user.phone}
										{#if user.phone_verified_at}
											<span class="text-green-600" title="Verified">✓</span>
										{/if}
									</div>
								</Table.Cell>
								<Table.Cell>
									{#if user.email}
										<div class="flex items-center gap-1">
											{user.email}
											{#if user.email_verified_at}
												<span class="text-green-600" title="Verified">✓</span>
											{/if}
										</div>
									{:else}
										<span class="text-muted-foreground">-</span>
									{/if}
								</Table.Cell>
								<Table.Cell>
									<Badge variant={getRoleBadgeVariant(user.tenantLink?.role)}>
										{getRoleLabel(user.tenantLink?.role)}
									</Badge>
								</Table.Cell>
								<Table.Cell>{user.bookingsCount}</Table.Cell>
								<Table.Cell class="text-muted-foreground">
									{new Date(user.created_at as unknown as string).toLocaleDateString()}
								</Table.Cell>
								<Table.Cell class="text-right">
									<Button href="/admin/users/{user.id}" variant="outline" size="sm">View</Button>
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>

				{#if totalPages > 1}
					<div class="mt-4 flex items-center justify-between">
						<p class="text-sm text-muted-foreground">
							Showing {(data.page - 1) * data.limit + 1} to {Math.min(
								data.page * data.limit,
								data.total
							)} of {data.total}
						</p>
						<div class="flex gap-2">
							<Button
								variant="outline"
								size="sm"
								disabled={data.page <= 1}
								onclick={() => {
									const params = new URLSearchParams();
									if (data.search) params.set('search', data.search);
									params.set('page', String(data.page - 1));
									goto(`/admin/users?${params.toString()}`);
								}}
							>
								<ChevronLeft class="h-4 w-4" />
								Previous
							</Button>
							<Button
								variant="outline"
								size="sm"
								disabled={data.page >= totalPages}
								onclick={() => {
									const params = new URLSearchParams();
									if (data.search) params.set('search', data.search);
									params.set('page', String(data.page + 1));
									goto(`/admin/users?${params.toString()}`);
								}}
							>
								Next
								<ChevronRight class="h-4 w-4" />
							</Button>
						</div>
					</div>
				{/if}
			{/if}
		</CardContent>
	</Card>
</div>
