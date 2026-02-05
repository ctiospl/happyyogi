<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Badge } from '$lib/components/ui/badge';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Table from '$lib/components/ui/table';
	import * as Select from '$lib/components/ui/select';
	import {
		Search,
		Check,
		X,
		Eye,
		Calendar,
		User,
		CreditCard,
		Filter,
		XCircle
	} from '@lucide/svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let statusFilter = $state('');
	let workshopFilter = $state('');
	let searchQuery = $state('');
	let dateFrom = $state('');
	let dateTo = $state('');

	$effect(() => {
		statusFilter = data.filters.status;
		workshopFilter = data.filters.workshopId;
		searchQuery = data.filters.search;
		dateFrom = data.filters.dateFrom;
		dateTo = data.filters.dateTo;
	});

	let cancelDialogOpen = $state(false);
	let cancelReason = $state('');
	let selectedBookingId = $state('');

	const statusOptions = [
		{ value: '', label: 'All Statuses' },
		{ value: 'pending', label: 'Pending' },
		{ value: 'confirmed', label: 'Confirmed' },
		{ value: 'cancelled', label: 'Cancelled' },
		{ value: 'completed', label: 'Completed' }
	];

	const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
		pending: 'secondary',
		confirmed: 'default',
		cancelled: 'destructive',
		completed: 'outline'
	};

	function applyFilters() {
		const params = new URLSearchParams();
		if (statusFilter) params.set('status', statusFilter);
		if (workshopFilter) params.set('workshop', workshopFilter);
		if (searchQuery) params.set('search', searchQuery);
		if (dateFrom) params.set('dateFrom', dateFrom);
		if (dateTo) params.set('dateTo', dateTo);

		goto(`/admin/bookings?${params.toString()}`);
	}

	function clearFilters() {
		statusFilter = '';
		workshopFilter = '';
		searchQuery = '';
		dateFrom = '';
		dateTo = '';
		goto('/admin/bookings');
	}

	function formatDate(date: Date | string | unknown) {
		return new Date(date as string | Date).toLocaleDateString('en-IN', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	}

	function formatCurrency(paise: number) {
		return new Intl.NumberFormat('en-IN', {
			style: 'currency',
			currency: 'INR'
		}).format(paise / 100);
	}

	function getPaymentStatus(booking: (typeof data.bookings)[0]) {
		const completedPayments = booking.payments.filter((p) => p.status === 'completed');
		const totalPaid = completedPayments.reduce((sum, p) => sum + p.amount_paise, 0);
		const totalDue = booking.workshop.price_paise - (booking.discount_amount_paise || 0);

		if (totalPaid >= totalDue) return 'paid';
		if (totalPaid > 0) return 'partial';
		return 'unpaid';
	}

	function openCancelDialog(bookingId: string) {
		selectedBookingId = bookingId;
		cancelReason = '';
		cancelDialogOpen = true;
	}

	const hasFilters = $derived(
		statusFilter || workshopFilter || searchQuery || dateFrom || dateTo
	);
</script>

<svelte:head>
	<title>Bookings | Admin | {data.tenant.name}</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold">Bookings</h1>
			<p class="text-muted-foreground">Manage workshop bookings</p>
		</div>
	</div>

	{#if form?.error}
		<div class="bg-destructive/10 text-destructive rounded-lg p-4">{form.error}</div>
	{/if}

	{#if form?.success}
		<div class="bg-primary/10 text-primary rounded-lg p-4">{form.message}</div>
	{/if}

	<Card>
		<CardHeader>
			<CardTitle class="flex items-center gap-2">
				<Filter class="h-5 w-5" />
				Filters
			</CardTitle>
		</CardHeader>
		<CardContent>
			<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
				<div>
					<Label for="search">Search</Label>
					<div class="relative">
						<Search class="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
						<Input
							id="search"
							placeholder="Name, phone, email"
							class="pl-9"
							bind:value={searchQuery}
							onkeydown={(e) => e.key === 'Enter' && applyFilters()}
						/>
					</div>
				</div>

				<div>
					<Label>Status</Label>
					<Select.Root type="single" bind:value={statusFilter}>
						<Select.Trigger class="w-full">
							{statusOptions.find((o) => o.value === statusFilter)?.label || 'All Statuses'}
						</Select.Trigger>
						<Select.Content>
							{#each statusOptions as option (option.value)}
								<Select.Item value={option.value} label={option.label} />
							{/each}
						</Select.Content>
					</Select.Root>
				</div>

				<div>
					<Label>Workshop</Label>
					<Select.Root type="single" bind:value={workshopFilter}>
						<Select.Trigger class="w-full">
							{data.workshops.find((w) => w.id === workshopFilter)?.title || 'All Workshops'}
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="" label="All Workshops" />
							{#each data.workshops as workshop (workshop.id)}
								<Select.Item value={workshop.id} label={workshop.title} />
							{/each}
						</Select.Content>
					</Select.Root>
				</div>

				<div>
					<Label for="dateFrom">From Date</Label>
					<Input id="dateFrom" type="date" bind:value={dateFrom} />
				</div>

				<div>
					<Label for="dateTo">To Date</Label>
					<Input id="dateTo" type="date" bind:value={dateTo} />
				</div>
			</div>

			<div class="mt-4 flex gap-2">
				<Button onclick={applyFilters}>
					<Filter class="mr-2 h-4 w-4" />
					Apply Filters
				</Button>
				{#if hasFilters}
					<Button variant="outline" onclick={clearFilters}>
						<XCircle class="mr-2 h-4 w-4" />
						Clear
					</Button>
				{/if}
			</div>
		</CardContent>
	</Card>

	<Card>
		<CardHeader>
			<CardTitle>
				{data.bookings.length} Booking{data.bookings.length !== 1 ? 's' : ''}
			</CardTitle>
		</CardHeader>
		<CardContent>
			{#if data.bookings.length === 0}
				<div class="text-muted-foreground py-8 text-center">
					<p>No bookings found{hasFilters ? ' matching filters' : ''}.</p>
				</div>
			{:else}
				<div class="overflow-x-auto">
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head>User</Table.Head>
								<Table.Head>Workshop</Table.Head>
								<Table.Head>Status</Table.Head>
								<Table.Head>Payment</Table.Head>
								<Table.Head>Date</Table.Head>
								<Table.Head class="text-right">Actions</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each data.bookings as booking (booking.id)}
								{@const paymentStatus = getPaymentStatus(booking)}
								<Table.Row>
									<Table.Cell>
										<div class="flex items-center gap-2">
											<User class="text-muted-foreground h-4 w-4" />
											<div>
												<p class="font-medium">{booking.user.name || 'Unknown'}</p>
												<p class="text-muted-foreground text-sm">{booking.user.phone}</p>
											</div>
										</div>
									</Table.Cell>
									<Table.Cell>
										<div>
											<p class="font-medium">{booking.workshop.title}</p>
											<p class="text-muted-foreground text-sm">
												{formatCurrency(booking.workshop.price_paise)}
											</p>
										</div>
									</Table.Cell>
									<Table.Cell>
										<Badge variant={statusColors[booking.status] || 'secondary'}>
											{booking.status}
										</Badge>
										{#if booking.status === 'pending' && booking.hold_expires_at}
											<p class="text-muted-foreground mt-1 text-xs">
												Hold expires: {formatDate(booking.hold_expires_at)}
											</p>
										{/if}
									</Table.Cell>
									<Table.Cell>
										<div class="flex items-center gap-2">
											<CreditCard class="text-muted-foreground h-4 w-4" />
											<Badge
												variant={paymentStatus === 'paid'
													? 'default'
													: paymentStatus === 'partial'
														? 'secondary'
														: 'outline'}
											>
												{paymentStatus}
											</Badge>
										</div>
										{#if booking.discount_amount_paise}
											<p class="text-muted-foreground mt-1 text-xs">
												Discount: {formatCurrency(booking.discount_amount_paise)}
											</p>
										{/if}
									</Table.Cell>
									<Table.Cell>
										<div class="flex items-center gap-2">
											<Calendar class="text-muted-foreground h-4 w-4" />
											<span class="text-sm">{formatDate(booking.created_at)}</span>
										</div>
									</Table.Cell>
									<Table.Cell class="text-right">
										<div class="flex justify-end gap-2">
											<Button
												href="/admin/bookings/{booking.id}"
												variant="ghost"
												size="icon"
												title="View details"
											>
												<Eye class="h-4 w-4" />
											</Button>
											{#if booking.status === 'pending'}
												<form method="POST" action="?/confirm" use:enhance>
													<input type="hidden" name="bookingId" value={booking.id} />
													<Button
														type="submit"
														variant="ghost"
														size="icon"
														title="Confirm booking"
														class="text-primary hover:text-primary"
													>
														<Check class="h-4 w-4" />
													</Button>
												</form>
											{/if}
											{#if booking.status !== 'cancelled' && booking.status !== 'completed'}
												<Button
													variant="ghost"
													size="icon"
													title="Cancel booking"
													class="text-destructive hover:text-destructive"
													onclick={() => openCancelDialog(booking.id)}
												>
													<X class="h-4 w-4" />
												</Button>
											{/if}
										</div>
									</Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				</div>
			{/if}
		</CardContent>
	</Card>

	<Dialog.Root bind:open={cancelDialogOpen}>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>Cancel Booking</Dialog.Title>
				<Dialog.Description>
					This will cancel the booking. Are you sure?
				</Dialog.Description>
			</Dialog.Header>
			<form method="POST" action="?/cancel" use:enhance>
				<input type="hidden" name="bookingId" value={selectedBookingId} />
				<div class="space-y-4 py-4">
					<div>
						<Label for="reason">Cancellation Reason (optional)</Label>
						<Input
							id="reason"
							name="reason"
							placeholder="Reason for cancellation"
							bind:value={cancelReason}
						/>
					</div>
				</div>
				<Dialog.Footer>
					<Button type="button" variant="outline" onclick={() => (cancelDialogOpen = false)}>
						Keep Booking
					</Button>
					<Button type="submit" variant="destructive">Cancel Booking</Button>
				</Dialog.Footer>
			</form>
		</Dialog.Content>
	</Dialog.Root>
</div>
