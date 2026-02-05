<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Separator } from '$lib/components/ui/separator';
	import { AlertCircle, IndianRupee, CalendarDays, MapPin, Loader2 } from '@lucide/svelte';
	import * as Alert from '$lib/components/ui/alert';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let isSubmitting = $state(false);
	let phone = $state('');
	let otp = $state('');
	let step = $state<'phone' | 'otp' | 'confirm'>(data.user ? 'confirm' : 'phone');
	let otpSent = $state(false);
	let otpError = $state('');

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
			month: 'short'
		});
	}

	async function sendOtp() {
		if (!phone || phone.length < 10) {
			otpError = 'Please enter a valid phone number';
			return;
		}

		isSubmitting = true;
		otpError = '';

		try {
			const res = await fetch('/api/auth/send-otp', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ phone })
			});

			const result = await res.json();

			if (result.success) {
				otpSent = true;
				step = 'otp';
			} else {
				otpError = result.error || 'Failed to send OTP';
			}
		} catch {
			otpError = 'Failed to send OTP. Please try again.';
		} finally {
			isSubmitting = false;
		}
	}

	async function verifyOtp() {
		if (!otp || otp.length < 6) {
			otpError = 'Please enter the 6-digit OTP';
			return;
		}

		isSubmitting = true;
		otpError = '';

		try {
			const res = await fetch('/api/auth/verify-otp', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ phone, code: otp })
			});

			const result = await res.json();

			if (result.success) {
				// Refresh the page to get the new session
				window.location.reload();
			} else {
				otpError = result.error || 'Invalid OTP';
			}
		} catch {
			otpError = 'Verification failed. Please try again.';
		} finally {
			isSubmitting = false;
		}
	}

	const { workshop, availableCapacity } = data;
	const firstSession = workshop.sessions[0];
</script>

<svelte:head>
	<title>Book {workshop.title} | {data.tenant.name}</title>
</svelte:head>

<div class="container mx-auto max-w-2xl px-4 py-12">
	<Card>
		<CardHeader>
			<CardTitle>Book Your Spot</CardTitle>
			<CardDescription>{workshop.title}</CardDescription>
		</CardHeader>
		<CardContent>
			<!-- Workshop Summary -->
			<div class="bg-muted/50 mb-6 rounded-lg p-4">
				<div class="mb-3 flex items-start justify-between">
					<div>
						<h3 class="font-semibold">{workshop.title}</h3>
						{#if workshop.instructor}
							<p class="text-muted-foreground text-sm">with {workshop.instructor.name}</p>
						{/if}
					</div>
					<div class="text-right">
						<div class="flex items-center text-lg font-bold">
							<IndianRupee class="h-4 w-4" />
							{formatPrice(workshop.price_paise)}
						</div>
					</div>
				</div>
				<div class="text-muted-foreground flex flex-wrap gap-4 text-sm">
					{#if firstSession}
						<div class="flex items-center gap-1">
							<CalendarDays class="h-4 w-4" />
							{formatDate(firstSession.starts_at)}
						</div>
					{/if}
					{#if workshop.venue_name}
						<div class="flex items-center gap-1">
							<MapPin class="h-4 w-4" />
							{workshop.venue_name}
						</div>
					{/if}
				</div>
			</div>

			{#if form?.error}
				<Alert.Root variant="destructive" class="mb-6">
					<AlertCircle class="h-4 w-4" />
					<Alert.Title>Error</Alert.Title>
					<Alert.Description>{form.error}</Alert.Description>
				</Alert.Root>
			{/if}

			{#if step === 'phone'}
				<!-- Phone Entry -->
				<div class="space-y-4">
					<div>
						<Label for="phone">Phone Number</Label>
						<Input
							id="phone"
							type="tel"
							placeholder="+91 98765 43210"
							bind:value={phone}
							disabled={isSubmitting}
						/>
						<p class="text-muted-foreground mt-1 text-sm">
							We'll send a verification code to this number
						</p>
					</div>

					{#if otpError}
						<p class="text-destructive text-sm">{otpError}</p>
					{/if}

					<Button onclick={sendOtp} disabled={isSubmitting} class="w-full">
						{#if isSubmitting}
							<Loader2 class="mr-2 h-4 w-4 animate-spin" />
							Sending...
						{:else}
							Send OTP
						{/if}
					</Button>
				</div>
			{:else if step === 'otp'}
				<!-- OTP Verification -->
				<div class="space-y-4">
					<div>
						<Label for="otp">Verification Code</Label>
						<Input
							id="otp"
							type="text"
							inputmode="numeric"
							maxlength={6}
							placeholder="123456"
							bind:value={otp}
							disabled={isSubmitting}
						/>
						<p class="text-muted-foreground mt-1 text-sm">
							Enter the 6-digit code sent to {phone}
						</p>
					</div>

					{#if otpError}
						<p class="text-destructive text-sm">{otpError}</p>
					{/if}

					<div class="flex gap-2">
						<Button variant="outline" onclick={() => (step = 'phone')} disabled={isSubmitting}>
							Change Number
						</Button>
						<Button onclick={verifyOtp} disabled={isSubmitting} class="flex-1">
							{#if isSubmitting}
								<Loader2 class="mr-2 h-4 w-4 animate-spin" />
								Verifying...
							{:else}
								Verify & Continue
							{/if}
						</Button>
					</div>
				</div>
			{:else}
				<!-- Logged in - Confirm Booking -->
				<form method="POST" use:enhance={() => {
					isSubmitting = true;
					return async ({ update }) => {
						isSubmitting = false;
						await update();
					};
				}}>
					<div class="mb-6 space-y-4">
						<div class="flex items-center justify-between">
							<span class="text-muted-foreground">Logged in as</span>
							<span class="font-medium">{data.user?.phone}</span>
						</div>
						<Separator />
						<div class="flex items-center justify-between">
							<span>Workshop Fee</span>
							<span class="font-medium">{formatPrice(workshop.price_paise)}</span>
						</div>
						{#if workshop.deposit_amount_paise}
							<div class="text-muted-foreground flex items-center justify-between text-sm">
								<span>Deposit required now</span>
								<span>{formatPrice(workshop.deposit_amount_paise)}</span>
							</div>
						{/if}
						<Separator />
						<div class="flex items-center justify-between text-lg font-bold">
							<span>Total</span>
							<span>{formatPrice(workshop.price_paise)}</span>
						</div>
					</div>

					<Alert.Root class="mb-6">
						<AlertCircle class="h-4 w-4" />
						<Alert.Title>Manual Payment</Alert.Title>
						<Alert.Description>
							After confirming, you'll receive payment instructions. Your spot will be held for 30
							minutes while you complete the payment.
						</Alert.Description>
					</Alert.Root>

					<Button type="submit" disabled={isSubmitting} class="w-full" size="lg">
						{#if isSubmitting}
							<Loader2 class="mr-2 h-4 w-4 animate-spin" />
							Processing...
						{:else}
							Confirm Booking
						{/if}
					</Button>
				</form>
			{/if}
		</CardContent>
	</Card>
</div>
