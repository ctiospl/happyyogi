<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Label } from '$lib/components/ui/label';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Table from '$lib/components/ui/table';
	import * as Select from '$lib/components/ui/select';
	import { CheckCircle, Clock, XCircle, RefreshCw, CreditCard, Image } from '@lucide/svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let proofDialogOpen = $state(false);
	let selectedProofUrl = $state<string | null>(null);
	let selectedPaymentUser = $state<string>('');

	let markPaidDialogOpen = $state(false);
	let selectedPaymentId = $state<string | null>(null);
	let markPaidNotes = $state('');

	const statusOptions = [
		{ value: 'pending', label: 'Pending' },
		{ value: 'completed', label: 'Completed' },
		{ value: 'failed', label: 'Failed' },
		{ value: 'refunded', label: 'Refunded' },
		{ value: 'all', label: 'All' }
	];

	function formatAmount(paise: number, currency: string): string {
		const amount = paise / 100;
		if (currency === 'INR') {
			return '₹' + amount.toLocaleString('en-IN');
		}
		return currency + ' ' + amount.toLocaleString();
	}

	function getStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
		switch (status) {
			case 'completed':
				return 'default';
			case 'pending':
				return 'secondary';
			case 'failed':
				return 'destructive';
			case 'refunded':
				return 'outline';
			default:
				return 'secondary';
		}
	}

	function getPaymentTypeLabel(type: string): string {
		switch (type) {
			case 'full':
				return 'Full';
			case 'deposit':
				return 'Deposit';
			case 'balance':
				return 'Balance';
			default:
				return type;
		}
	}

	function getMethodLabel(method: string | null): string {
		if (!method) return '-';
		switch (method) {
			case 'upi':
				return 'UPI';
			case 'cash':
				return 'Cash';
			case 'card':
				return 'Card';
			case 'bank_transfer':
				return 'Bank Transfer';
			case 'gateway':
				return 'Gateway';
			default:
				return method;
		}
	}

	function openProofDialog(proofUrl: string, userName: string) {
		selectedProofUrl = proofUrl;
		selectedPaymentUser = userName;
		proofDialogOpen = true;
	}

	function openMarkPaidDialog(paymentId: string) {
		selectedPaymentId = paymentId;
		markPaidNotes = '';
		markPaidDialogOpen = true;
	}

	function handleStatusChange(newValue: string | undefined) {
		if (newValue) {
			goto(`/admin/payments?status=${newValue}`);
		}
	}
</script>

<svelte:head>
	<title>Payments | Admin | {data.tenant.name}</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<div class="mb-8 flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold">Payments</h1>
			<p class="text-muted-foreground">Manage payment verifications</p>
		</div>
	</div>

	{#if form?.error}
		<div class="mb-6 rounded-lg bg-destructive/10 p-4 text-destructive">{form.error}</div>
	{/if}

	{#if form?.success}
		<div class="mb-6 rounded-lg bg-green-500/10 p-4 text-green-600">
			Payment marked as completed
		</div>
	{/if}

	<Card>
		<CardHeader>
			<div class="flex items-center justify-between">
				<CardTitle class="flex items-center gap-2">
					<CreditCard class="h-5 w-5" />
					Payment Records
				</CardTitle>
				<div class="flex items-center gap-2">
					<Label class="text-sm text-muted-foreground">Status:</Label>
					<Select.Root type="single" value={data.statusFilter} onValueChange={handleStatusChange}>
						<Select.Trigger class="w-[140px]">
							{statusOptions.find((o) => o.value === data.statusFilter)?.label || 'Select...'}
						</Select.Trigger>
						<Select.Content>
							{#each statusOptions as option (option.value)}
								<Select.Item value={option.value} label={option.label} />
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
			</div>
		</CardHeader>
		<CardContent>
			{#if data.payments.length === 0}
				<div class="py-8 text-center text-muted-foreground">
					<p>No payments found.</p>
				</div>
			{:else}
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>User</Table.Head>
							<Table.Head>Workshop</Table.Head>
							<Table.Head>Amount</Table.Head>
							<Table.Head>Type</Table.Head>
							<Table.Head>Method</Table.Head>
							<Table.Head>Status</Table.Head>
							<Table.Head>Date</Table.Head>
							<Table.Head class="text-right">Actions</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each data.payments as payment (payment.id)}
							<Table.Row>
								<Table.Cell>
									<div>
										<div class="font-medium">{payment.user_name || 'Unknown'}</div>
										<div class="text-sm text-muted-foreground">{payment.user_phone}</div>
									</div>
								</Table.Cell>
								<Table.Cell>
									<a
										href="/admin/workshops/{payment.workshop_id}"
										class="text-primary hover:underline"
									>
										{payment.workshop_title}
									</a>
								</Table.Cell>
								<Table.Cell class="font-medium">
									{formatAmount(payment.amount_paise, payment.currency)}
								</Table.Cell>
								<Table.Cell>
									<Badge variant="outline">{getPaymentTypeLabel(payment.payment_type)}</Badge>
								</Table.Cell>
								<Table.Cell class="text-muted-foreground">
									{getMethodLabel(payment.method)}
								</Table.Cell>
								<Table.Cell>
									<Badge variant={getStatusVariant(payment.status)}>
										{#if payment.status === 'completed'}
											<CheckCircle class="mr-1 h-3 w-3" />
										{:else if payment.status === 'pending'}
											<Clock class="mr-1 h-3 w-3" />
										{:else if payment.status === 'failed'}
											<XCircle class="mr-1 h-3 w-3" />
										{:else if payment.status === 'refunded'}
											<RefreshCw class="mr-1 h-3 w-3" />
										{/if}
										{payment.status}
									</Badge>
									{#if payment.marked_by_name && payment.marked_at}
										<div class="mt-1 text-xs text-muted-foreground">
											by {payment.marked_by_name}
										</div>
									{/if}
								</Table.Cell>
								<Table.Cell class="text-muted-foreground">
									{new Date(payment.created_at as unknown as string).toLocaleDateString('en-IN', {
										day: 'numeric',
										month: 'short',
										year: 'numeric'
									})}
								</Table.Cell>
								<Table.Cell class="text-right">
									<div class="flex justify-end gap-2">
										{#if payment.proof_url}
											<Button
												variant="ghost"
												size="icon"
												onclick={() =>
													openProofDialog(payment.proof_url!, payment.user_name || 'User')}
											>
												<Image class="h-4 w-4" />
											</Button>
										{/if}
										{#if payment.status === 'pending'}
											<Button
												variant="outline"
												size="sm"
												onclick={() => openMarkPaidDialog(payment.id)}
											>
												<CheckCircle class="mr-1 h-4 w-4" />
												Mark Paid
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

<!-- Proof Image Dialog -->
<Dialog.Root bind:open={proofDialogOpen}>
	<Dialog.Content class="max-w-2xl">
		<Dialog.Header>
			<Dialog.Title>Payment Proof - {selectedPaymentUser}</Dialog.Title>
		</Dialog.Header>
		{#if selectedProofUrl}
			<div class="flex justify-center p-4">
				<img
					src={selectedProofUrl}
					alt="Payment proof"
					class="max-h-[60vh] rounded-lg object-contain"
				/>
			</div>
		{/if}
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (proofDialogOpen = false)}>Close</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Mark Paid Dialog -->
<Dialog.Root bind:open={markPaidDialogOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Mark Payment as Completed</Dialog.Title>
			<Dialog.Description>
				This will mark the payment as completed and may confirm the booking.
			</Dialog.Description>
		</Dialog.Header>
		<form
			method="POST"
			action="?/markPaid"
			use:enhance={() => {
				return async ({ result, update }) => {
					if (result.type === 'success') {
						markPaidDialogOpen = false;
					}
					await update();
				};
			}}
		>
			<input type="hidden" name="payment_id" value={selectedPaymentId} />
			<div class="space-y-4 py-4">
				<div>
					<Label for="notes">Notes (optional)</Label>
					<Textarea
						id="notes"
						name="notes"
						placeholder="Add any notes about this payment verification..."
						bind:value={markPaidNotes}
					/>
				</div>
			</div>
			<Dialog.Footer>
				<Button type="button" variant="outline" onclick={() => (markPaidDialogOpen = false)}>
					Cancel
				</Button>
				<Button type="submit">Confirm Payment</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
