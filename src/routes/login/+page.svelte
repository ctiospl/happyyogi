<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card';
	import * as Tabs from '$lib/components/ui/tabs';
	import * as InputOTP from '$lib/components/ui/input-otp';
	import { AlertCircle, Phone, Mail, ArrowLeft } from '@lucide/svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let loading = $state(false);
	let resending = $state(false);
	let activeTab = $state<'phone' | 'email'>('phone');

	// Phone OTP state
	let phoneInput = $state('');
	let phoneOtpCode = $state('');
	let phoneOtpSentManually = $state(false);

	// Email OTP state
	let emailInput = $state('');
	let emailOtpCode = $state('');
	let emailOtpSentManually = $state(false);

	// Derive phone/email from form or manual input
	let phone = $derived(form?.phone ?? phoneInput);
	let email = $derived(form?.email ?? emailInput);

	// Derive OTP sent state from form or manual state
	let phoneOtpSent = $derived(phoneOtpSentManually || (form?.otpSent && form?.method === 'phone'));
	let emailOtpSent = $derived(emailOtpSentManually || (form?.otpSent && form?.method === 'email'));

	function resetPhoneOtp() {
		phoneOtpSentManually = false;
		phoneOtpCode = '';
	}

	function resetEmailOtp() {
		emailOtpSentManually = false;
		emailOtpCode = '';
	}

	async function resendPhoneOtp() {
		resending = true;
		const formData = new FormData();
		formData.set('phone', phone);
		await fetch('?/sendPhoneOtp', { method: 'POST', body: formData });
		resending = false;
	}

	async function resendEmailOtp() {
		resending = true;
		const formData = new FormData();
		formData.set('email', email);
		await fetch('?/sendEmailOtp', { method: 'POST', body: formData });
		resending = false;
	}
</script>

<svelte:head>
	<title>Login | {data.tenant?.name ?? 'Happy Yogi'}</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center p-4">
	<Card class="w-full max-w-sm">
		<CardHeader class="text-center">
			{#if data.tenant?.logo_url}
				<img src={data.tenant.logo_url} alt={data.tenant.name} class="mx-auto mb-4 h-12 w-auto" />
			{/if}
			<CardTitle class="text-2xl">Login</CardTitle>
			<CardDescription>Sign in with phone or email</CardDescription>
		</CardHeader>
		<CardContent>
			{#if form?.error}
				<div class="bg-destructive/10 text-destructive mb-4 flex items-center gap-2 rounded-md p-3 text-sm">
					<AlertCircle class="h-4 w-4 shrink-0" />
					{form.error}
				</div>
			{/if}

			<Tabs.Root bind:value={activeTab}>
				<Tabs.List class="mb-4 grid w-full grid-cols-2">
					<Tabs.Trigger value="phone" class="flex items-center gap-2">
						<Phone class="h-4 w-4" />
						Phone
					</Tabs.Trigger>
					<Tabs.Trigger value="email" class="flex items-center gap-2">
						<Mail class="h-4 w-4" />
						Email
					</Tabs.Trigger>
				</Tabs.List>

				<!-- Phone OTP Tab -->
				<Tabs.Content value="phone">
					{#if !phoneOtpSent}
						<form
							method="POST"
							action="?/sendPhoneOtp"
							use:enhance={() => {
								loading = true;
								return async ({ update }) => {
									loading = false;
									await update();
								};
							}}
							class="space-y-4"
						>
							<div class="space-y-2">
								<Label for="phone">Phone Number</Label>
								<Input
									id="phone"
									name="phone"
									type="tel"
									placeholder="+91 98765 43210"
									bind:value={phoneInput}
									required
									autocomplete="tel"
								/>
								<p class="text-muted-foreground text-xs">We'll send you a verification code</p>
							</div>

							<Button type="submit" class="w-full" disabled={loading}>
								{loading ? 'Sending...' : 'Send OTP'}
							</Button>
						</form>
					{:else}
						<form
							method="POST"
							action="?/verifyPhoneOtp"
							use:enhance={() => {
								loading = true;
								return async ({ update }) => {
									loading = false;
									await update();
								};
							}}
							class="space-y-4"
						>
							<input type="hidden" name="phone" value={phone} />

							<div class="space-y-2">
								<div class="flex items-center justify-between">
									<Label>Enter verification code</Label>
									<button
										type="button"
										onclick={resetPhoneOtp}
										class="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs"
									>
										<ArrowLeft class="h-3 w-3" />
										Change number
									</button>
								</div>
								<p class="text-muted-foreground mb-3 text-sm">Code sent to {phone}</p>
								<input type="hidden" name="code" value={phoneOtpCode} />
								<InputOTP.Root maxlength={6} bind:value={phoneOtpCode} class="justify-center">
									{#snippet children({ cells })}
										<InputOTP.Group>
											{#each cells as cell, idx (idx)}
												<InputOTP.Slot {cell} />
											{/each}
										</InputOTP.Group>
									{/snippet}
								</InputOTP.Root>
							</div>

							<Button type="submit" class="w-full" disabled={loading || phoneOtpCode.length !== 6}>
								{loading ? 'Verifying...' : 'Verify & Login'}
							</Button>

							<div class="text-center">
								<button
									type="button"
									onclick={resendPhoneOtp}
									class="text-muted-foreground hover:text-foreground text-sm underline"
									disabled={resending}
								>
									{resending ? 'Sending...' : 'Resend code'}
								</button>
							</div>
						</form>
					{/if}
				</Tabs.Content>

				<!-- Email OTP Tab -->
				<Tabs.Content value="email">
					{#if !emailOtpSent}
						<form
							method="POST"
							action="?/sendEmailOtp"
							use:enhance={() => {
								loading = true;
								return async ({ update }) => {
									loading = false;
									await update();
								};
							}}
							class="space-y-4"
						>
							<div class="space-y-2">
								<Label for="email">Email Address</Label>
								<Input
									id="email"
									name="email"
									type="email"
									placeholder="you@example.com"
									bind:value={emailInput}
									required
									autocomplete="email"
								/>
								<p class="text-muted-foreground text-xs">We'll send you a verification code</p>
							</div>

							<Button type="submit" class="w-full" disabled={loading}>
								{loading ? 'Sending...' : 'Send OTP'}
							</Button>
						</form>
					{:else}
						<form
							method="POST"
							action="?/verifyEmailOtp"
							use:enhance={() => {
								loading = true;
								return async ({ update }) => {
									loading = false;
									await update();
								};
							}}
							class="space-y-4"
						>
							<input type="hidden" name="email" value={email} />

							<div class="space-y-2">
								<div class="flex items-center justify-between">
									<Label>Enter verification code</Label>
									<button
										type="button"
										onclick={resetEmailOtp}
										class="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs"
									>
										<ArrowLeft class="h-3 w-3" />
										Change email
									</button>
								</div>
								<p class="text-muted-foreground mb-3 text-sm">Code sent to {email}</p>
								<input type="hidden" name="code" value={emailOtpCode} />
								<InputOTP.Root maxlength={6} bind:value={emailOtpCode} class="justify-center">
									{#snippet children({ cells })}
										<InputOTP.Group>
											{#each cells as cell, idx (idx)}
												<InputOTP.Slot {cell} />
											{/each}
										</InputOTP.Group>
									{/snippet}
								</InputOTP.Root>
							</div>

							<Button type="submit" class="w-full" disabled={loading || emailOtpCode.length !== 6}>
								{loading ? 'Verifying...' : 'Verify & Login'}
							</Button>

							<div class="text-center">
								<button
									type="button"
									onclick={resendEmailOtp}
									class="text-muted-foreground hover:text-foreground text-sm underline"
									disabled={resending}
								>
									{resending ? 'Sending...' : 'Resend code'}
								</button>
							</div>
						</form>
					{/if}
				</Tabs.Content>
			</Tabs.Root>
		</CardContent>
	</Card>
</div>
