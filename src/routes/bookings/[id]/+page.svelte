<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Separator } from '$lib/components/ui/separator';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Alert from '$lib/components/ui/alert';
	import {
		CheckCircle,
		Clock,
		AlertCircle,
		XCircle,
		IndianRupee,
		CalendarDays,
		MapPin,
		Copy,
		Loader2,
		User
	} from '@lucide/svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let isSubmitting = $state(false);
	let proofUrl = $state('');
	let copied = $state(false);

	const { booking, tenant } = data;
	const pendingPayment = booking.payments.find((p) => p.status === 'pending');
	const completedPayment = booking.payments.find((p) => p.status === 'completed');

	function formatPrice(paise: number) {
		return new Intl.NumberFormat('en-IN', {
			style: 'currency',
			currency: 'INR',
			minimumFractionDigits: 0
		}).format(paise / 100);
	}

	function formatDate(date: Date | string) {
		return new Date(date).toLocaleDateString('en-IN', {
			weekday: 'short',
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	}

	function formatTime(date: Date | string) {
		return new Date(date).toLocaleTimeString('en-IN', {
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	async function copyUpi() {
		await navigator.clipboard.writeText('happyyogi@upi');
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}

	const statusConfig = {
		pending: { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: 'Pending Payment' },
		confirmed: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10', label: 'Confirmed' },
		cancelled: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10', label: 'Cancelled' },
		completed: { icon: CheckCircle, color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'Completed' }
	} as const;

	const status = statusConfig[booking.status];
	const StatusIcon = status.icon;
</script>

<svelte:head>
	<title>Booking #{booking.id.slice(0, 8)} | {tenant?.name}</title>
</svelte:head>

<div class="container mx-auto max-w-2xl px-4 py-12">
	{#if form?.success && form?.cancelled}
		<Alert.Root variant="destructive" class="mb-6">
			<XCircle class="h-4 w-4" />
			<Alert.Title>Booking Cancelled</Alert.Title>
			<Alert.Description>Your booking has been cancelled.</Alert.Description>
		</Alert.Root>
	{/if}

	{#if form?.success && form?.message}
		<Alert.Root class="mb-6">
			<CheckCircle class="h-4 w-4" />
			<Alert.Title>Success</Alert.Title>
			<Alert.Description>{form.message}</Alert.Description>
		</Alert.Root>
	{/if}

	{#if form?.error}
		<Alert.Root variant="destructive" class="mb-6">
			<AlertCircle class="h-4 w-4" />
			<Alert.Title>Error</Alert.Title>
			<Alert.Description>{form.error}</Alert.Description>
		</Alert.Root>
	{/if}

	<Card>
		<CardHeader>
			<div class="flex items-start justify-between">
				<div>
					<CardTitle>Booking Confirmation</CardTitle>
					<CardDescription class="mt-1">#{booking.id.slice(0, 8).toUpperCase()}</CardDescription>
				</div>
				<div class={`flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${status.bg} ${status.color}`}>
					<StatusIcon class="h-4 w-4" />
					{status.label}
				</div>
			</div>
		</CardHeader>

		<CardContent class="space-y-6">
			<!-- Workshop Details -->
			<div>
				<h3 class="mb-2 font-semibold">{booking.workshop.title}</h3>
				<div class="text-muted-foreground space-y-2 text-sm">
					{#if booking.workshop.instructor_name}
						<div class="flex items-center gap-2">
							<User class="h-4 w-4" />
							with {booking.workshop.instructor_name}
						</div>
					{/if}
					{#if booking.workshop.first_session_date}
						<div class="flex items-center gap-2">
							<CalendarDays class="h-4 w-4" />
							{formatDate(booking.workshop.first_session_date)}
						</div>
					{/if}
					{#if booking.workshop.venue_name}
						<div class="flex items-center gap-2">
							<MapPin class="h-4 w-4" />
							<div>
								<span>{booking.workshop.venue_name}</span>
								{#if booking.workshop.venue_address}
									<p class="text-muted-foreground/70 text-xs">{booking.workshop.venue_address}</p>
								{/if}
							</div>
						</div>
					{/if}
				</div>
			</div>

			<Separator />

			<!-- Payment Summary -->
			<div>
				<h4 class="mb-3 font-medium">Payment Summary</h4>
				<div class="space-y-2">
					<div class="flex justify-between">
						<span class="text-muted-foreground">Workshop Fee</span>
						<span>{formatPrice(booking.workshop.price_paise)}</span>
					</div>
					{#if booking.discount_amount_paise}
						<div class="flex justify-between text-green-600">
							<span>Discount</span>
							<span>-{formatPrice(booking.discount_amount_paise)}</span>
						</div>
					{/if}
					<Separator />
					<div class="flex justify-between text-lg font-bold">
						<span>Total</span>
						<span>{formatPrice(booking.workshop.price_paise - (booking.discount_amount_paise || 0))}</span>
					</div>
				</div>
			</div>

			{#if booking.status === 'pending' && pendingPayment}
				<Separator />

				<!-- Payment Instructions -->
				<div>
					<h4 class="mb-3 font-medium">Payment Instructions</h4>
					<div class="bg-muted/50 space-y-4 rounded-lg p-4">
						<div>
							<p class="text-muted-foreground mb-2 text-sm">Pay via UPI to:</p>
							<div class="flex items-center gap-2">
								<code class="bg-background rounded px-3 py-2 text-lg font-mono">happyyogi@upi</code>
								<Button variant="ghost" size="icon" onclick={copyUpi}>
									<Copy class="h-4 w-4" />
								</Button>
								{#if copied}
									<span class="text-muted-foreground text-sm">Copied!</span>
								{/if}
							</div>
						</div>

						<div>
							<p class="text-muted-foreground mb-2 text-sm">Amount to pay:</p>
							<div class="flex items-center text-2xl font-bold">
								<IndianRupee class="h-5 w-5" />
								{formatPrice(pendingPayment.amount_paise)}
							</div>
						</div>

						{#if booking.hold_expires_at}
							<Alert.Root variant="destructive">
								<Clock class="h-4 w-4" />
								<Alert.Title>Time Remaining</Alert.Title>
								<Alert.Description>
									Your spot is held until {formatTime(booking.hold_expires_at)}. Please complete
									payment before this time to confirm your booking.
								</Alert.Description>
							</Alert.Root>
						{/if}
					</div>
				</div>

				<Separator />

				<!-- Upload Payment Proof -->
				<form method="POST" action="?/uploadProof" use:enhance={() => {
					isSubmitting = true;
					return async ({ update }) => {
						isSubmitting = false;
						await update();
					};
				}}>
					<h4 class="mb-3 font-medium">Upload Payment Proof</h4>
					<p class="text-muted-foreground mb-3 text-sm">
						After making the payment, enter the screenshot URL or transaction ID below. Our team
						will verify and confirm your booking.
					</p>
					<div class="space-y-3">
						<div>
							<Label for="proof_url">Payment Screenshot URL or Transaction ID</Label>
							<Input
								id="proof_url"
								name="proof_url"
								placeholder="https://... or UPI Reference ID"
								bind:value={proofUrl}
								disabled={isSubmitting}
							/>
						</div>
						<Button type="submit" disabled={isSubmitting || !proofUrl}>
							{#if isSubmitting}
								<Loader2 class="mr-2 h-4 w-4 animate-spin" />
								Uploading...
							{:else}
								Submit Payment Proof
							{/if}
						</Button>
					</div>
				</form>
			{/if}

			{#if booking.status === 'confirmed' && completedPayment}
				<Alert.Root>
					<CheckCircle class="h-4 w-4" />
					<Alert.Title>Payment Confirmed</Alert.Title>
					<Alert.Description>
						Your booking is confirmed! We'll send you a reminder before the workshop.
					</Alert.Description>
				</Alert.Root>
			{/if}

			{#if booking.status === 'cancelled'}
				<Alert.Root variant="destructive">
					<XCircle class="h-4 w-4" />
					<Alert.Title>Booking Cancelled</Alert.Title>
					<Alert.Description>
						{booking.cancellation_reason || 'This booking has been cancelled.'}
					</Alert.Description>
				</Alert.Root>
			{/if}
		</CardContent>

		{#if booking.status === 'pending'}
			<CardFooter class="flex justify-between border-t pt-4">
				<form method="POST" action="?/cancel" use:enhance={() => {
					if (!confirm('Are you sure you want to cancel this booking?')) {
						return async () => {};
					}
					isSubmitting = true;
					return async ({ update }) => {
						isSubmitting = false;
						await update();
					};
				}}>
					<Button type="submit" variant="ghost" disabled={isSubmitting}>
						Cancel Booking
					</Button>
				</form>
				<Button href="/workshops/{booking.workshop.slug}">View Workshop</Button>
			</CardFooter>
		{/if}
	</Card>
</div>
