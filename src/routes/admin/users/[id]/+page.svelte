<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardHeader,
		CardTitle,
		CardDescription
	} from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import * as Select from '$lib/components/ui/select';
	import * as Table from '$lib/components/ui/table';
	import * as Alert from '$lib/components/ui/alert';
	import {
		ArrowLeft,
		User,
		Phone,
		Mail,
		Calendar,
		Wallet,
		CheckCircle,
		AlertCircle
	} from '@lucide/svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let selectedRole = $state(data.user.tenantLink?.role ?? 'user');

	function getStatusBadgeVariant(status: string) {
		switch (status) {
			case 'confirmed':
			case 'completed':
				return 'default';
			case 'pending':
				return 'secondary';
			case 'cancelled':
				return 'destructive';
			default:
				return 'outline';
		}
	}

	function formatPaise(paise: number) {
		return new Intl.NumberFormat('en-IN', {
			style: 'currency',
			currency: 'INR'
		}).format(paise / 100);
	}

	const totalSpent = $derived(
		data.bookings.filter((b) => b.status !== 'cancelled').reduce((sum, b) => sum + b.paid_paise, 0)
	);
</script>

<svelte:head>
	<title>{data.user.name || data.user.phone} | Users | Admin</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<div class="mb-8">
		<Button href="/admin/users" variant="ghost" size="sm" class="mb-4">
			<ArrowLeft class="mr-2 h-4 w-4" />
			Back to Users
		</Button>
		<div class="flex items-start justify-between">
			<div class="flex items-center gap-4">
				{#if data.user.avatar_url}
					<img
						src={data.user.avatar_url}
						alt={data.user.name || 'User'}
						class="h-16 w-16 rounded-full object-cover"
					/>
				{:else}
					<div class="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
						<User class="h-8 w-8 text-muted-foreground" />
					</div>
				{/if}
				<div>
					<h1 class="text-3xl font-bold">{data.user.name || 'Unnamed User'}</h1>
					<p class="text-muted-foreground">
						Member since {new Date(data.user.created_at as unknown as string).toLocaleDateString()}
					</p>
				</div>
			</div>
			<Badge
				variant={data.user.tenantLink?.role === 'admin' ||
				data.user.tenantLink?.role === 'superadmin'
					? 'default'
					: 'secondary'}
				class="text-sm"
			>
				{data.user.tenantLink?.role || 'user'}
			</Badge>
		</div>
	</div>

	{#if form?.error}
		<Alert.Root variant="destructive" class="mb-6">
			<AlertCircle class="h-4 w-4" />
			<Alert.Title>Error</Alert.Title>
			<Alert.Description>{form.error}</Alert.Description>
		</Alert.Root>
	{/if}

	{#if form?.success}
		<Alert.Root class="mb-6">
			<CheckCircle class="h-4 w-4" />
			<Alert.Title>Success</Alert.Title>
			<Alert.Description>{form.message}</Alert.Description>
		</Alert.Root>
	{/if}

	<div class="grid gap-6 md:grid-cols-3">
		<!-- User Info -->
		<Card>
			<CardHeader>
				<CardTitle>Contact Info</CardTitle>
			</CardHeader>
			<CardContent class="space-y-4">
				<div class="flex items-center gap-3">
					<Phone class="h-4 w-4 text-muted-foreground" />
					<div>
						<p class="font-medium">{data.user.phone}</p>
						{#if data.user.phone_verified_at}
							<p class="text-xs text-muted-foreground">Verified</p>
						{:else}
							<p class="text-xs text-orange-600">Not verified</p>
						{/if}
					</div>
				</div>
				<div class="flex items-center gap-3">
					<Mail class="h-4 w-4 text-muted-foreground" />
					<div>
						{#if data.user.email}
							<p class="font-medium">{data.user.email}</p>
							{#if data.user.email_verified_at}
								<p class="text-xs text-muted-foreground">Verified</p>
							{:else}
								<p class="text-xs text-orange-600">Not verified</p>
							{/if}
						{:else}
							<p class="text-muted-foreground">No email</p>
						{/if}
					</div>
				</div>
				<div class="flex items-center gap-3">
					<Calendar class="h-4 w-4 text-muted-foreground" />
					<div>
						<p class="font-medium">Auth: {data.user.auth_method}</p>
					</div>
				</div>
			</CardContent>
		</Card>

		<!-- Stats -->
		<Card>
			<CardHeader>
				<CardTitle>Statistics</CardTitle>
			</CardHeader>
			<CardContent class="space-y-4">
				<div>
					<p class="text-sm text-muted-foreground">Total Bookings</p>
					<p class="text-2xl font-bold">{data.user.bookingsCount}</p>
				</div>
				<div>
					<p class="text-sm text-muted-foreground">Total Spent</p>
					<p class="text-2xl font-bold">{formatPaise(totalSpent)}</p>
				</div>
				{#if data.user.tenantLink}
					<div class="flex items-center gap-2">
						<Wallet class="h-4 w-4 text-muted-foreground" />
						<div>
							<p class="text-sm text-muted-foreground">Wallet Balance</p>
							<p class="font-medium">{formatPaise(data.user.tenantLink.wallet_balance_paise)}</p>
						</div>
					</div>
				{/if}
			</CardContent>
		</Card>

		<!-- Role Management -->
		<Card>
			<CardHeader>
				<CardTitle>Role Management</CardTitle>
				<CardDescription>Change user's role for this tenant</CardDescription>
			</CardHeader>
			<CardContent>
				<form method="POST" action="?/updateRole" use:enhance class="space-y-4">
					<Select.Root type="single" name="role" bind:value={selectedRole}>
						<Select.Trigger class="w-full">
							{selectedRole}
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="user">user</Select.Item>
							<Select.Item value="admin">admin</Select.Item>
							<Select.Item value="superadmin">superadmin</Select.Item>
						</Select.Content>
					</Select.Root>
					<Button type="submit" class="w-full">Update Role</Button>
				</form>
			</CardContent>
		</Card>
	</div>

	<!-- Booking History -->
	<Card class="mt-6">
		<CardHeader>
			<CardTitle>Booking History</CardTitle>
			<CardDescription>{data.bookings.length} bookings</CardDescription>
		</CardHeader>
		<CardContent>
			{#if data.bookings.length === 0}
				<div class="py-8 text-center text-muted-foreground">
					<p>No bookings yet.</p>
				</div>
			{:else}
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>Workshop</Table.Head>
							<Table.Head>Status</Table.Head>
							<Table.Head>Price</Table.Head>
							<Table.Head>Paid</Table.Head>
							<Table.Head>Date</Table.Head>
							<Table.Head class="text-right">Actions</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each data.bookings as booking (booking.id)}
							<Table.Row>
								<Table.Cell class="font-medium">{booking.workshop_title}</Table.Cell>
								<Table.Cell>
									<Badge variant={getStatusBadgeVariant(booking.status)}>
										{booking.status}
									</Badge>
								</Table.Cell>
								<Table.Cell>{formatPaise(booking.price_paise)}</Table.Cell>
								<Table.Cell>
									{#if booking.paid_paise > 0}
										{formatPaise(booking.paid_paise)}
									{:else}
										<span class="text-muted-foreground">-</span>
									{/if}
								</Table.Cell>
								<Table.Cell class="text-muted-foreground">
									{new Date(booking.created_at as unknown as string).toLocaleDateString()}
								</Table.Cell>
								<Table.Cell class="text-right">
									<Button href="/admin/bookings/{booking.id}" variant="outline" size="sm">
										View
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
