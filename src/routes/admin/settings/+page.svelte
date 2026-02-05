<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Switch } from '$lib/components/ui/switch';
	import { CreditCard, IndianRupee, QrCode, Settings, Check } from '@lucide/svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let razorpayEnabled = $state(data.gatewayConfig.razorpay?.enabled ?? false);
	let cashfreeEnabled = $state(data.gatewayConfig.cashfree?.enabled ?? false);
	let upiEnabled = $state(data.gatewayConfig.upi_manual?.enabled ?? false);

	let razorpayKeyId = $state(data.gatewayConfig.razorpay?.key_id ?? '');
	let razorpayKeySecret = $state(data.gatewayConfig.razorpay?.key_secret ?? '');
	let razorpayWebhookSecret = $state(data.gatewayConfig.razorpay?.webhook_secret ?? '');

	let cashfreeAppId = $state(data.gatewayConfig.cashfree?.app_id ?? '');
	let cashfreeSecretKey = $state(data.gatewayConfig.cashfree?.secret_key ?? '');
	let cashfreeWebhookSecret = $state(data.gatewayConfig.cashfree?.webhook_secret ?? '');

	let upiId = $state(data.gatewayConfig.upi_manual?.upi_id ?? '');
	let upiQrImageUrl = $state(data.gatewayConfig.upi_manual?.qr_image_url ?? '');

	let saving = $state(false);
</script>

<svelte:head>
	<title>Settings | Admin | {data.tenant.name}</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<div class="mb-8 flex items-center gap-3">
		<Settings class="h-8 w-8" />
		<h1 class="text-3xl font-bold">Payment Gateway Settings</h1>
	</div>

	{#if form?.success}
		<div class="bg-primary/10 text-primary mb-6 flex items-center gap-2 rounded-lg p-4">
			<Check class="h-5 w-5" />
			Settings saved successfully
		</div>
	{/if}

	{#if form?.error}
		<div class="bg-destructive/10 text-destructive mb-6 rounded-lg p-4">{form.error}</div>
	{/if}

	<form method="POST" action="?/save" use:enhance={() => {
		saving = true;
		return async ({ update }) => {
			await update();
			saving = false;
		};
	}}>
		<div class="space-y-6">
			<!-- Razorpay -->
			<Card>
				<CardHeader>
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-3">
							<CreditCard class="h-6 w-6" />
							<div>
								<CardTitle>Razorpay</CardTitle>
								<CardDescription>Accept payments via Razorpay gateway</CardDescription>
							</div>
						</div>
						<div class="flex items-center gap-2">
							<Label for="razorpay_enabled" class="text-sm">Enable</Label>
							<Switch
								id="razorpay_enabled"
								name="razorpay_enabled"
								bind:checked={razorpayEnabled}
							/>
							<input type="hidden" name="razorpay_enabled" value={razorpayEnabled ? 'on' : 'off'} />
						</div>
					</div>
				</CardHeader>
				{#if razorpayEnabled}
					<CardContent class="space-y-4">
						<div class="grid gap-4 md:grid-cols-2">
							<div>
								<Label for="razorpay_key_id">Key ID</Label>
								<Input
									id="razorpay_key_id"
									name="razorpay_key_id"
									placeholder="rzp_live_xxxxx"
									bind:value={razorpayKeyId}
								/>
							</div>
							<div>
								<Label for="razorpay_key_secret">Key Secret</Label>
								<Input
									id="razorpay_key_secret"
									name="razorpay_key_secret"
									type="password"
									placeholder="Enter new secret or leave to keep existing"
									bind:value={razorpayKeySecret}
								/>
								<p class="text-muted-foreground mt-1 text-xs">Leave masked value to keep existing secret</p>
							</div>
						</div>
						<div>
							<Label for="razorpay_webhook_secret">Webhook Secret</Label>
							<Input
								id="razorpay_webhook_secret"
								name="razorpay_webhook_secret"
								type="password"
								placeholder="Webhook signature secret"
								bind:value={razorpayWebhookSecret}
							/>
						</div>
					</CardContent>
				{/if}
			</Card>

			<!-- Cashfree -->
			<Card>
				<CardHeader>
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-3">
							<IndianRupee class="h-6 w-6" />
							<div>
								<CardTitle>Cashfree</CardTitle>
								<CardDescription>Accept payments via Cashfree gateway</CardDescription>
							</div>
						</div>
						<div class="flex items-center gap-2">
							<Label for="cashfree_enabled" class="text-sm">Enable</Label>
							<Switch
								id="cashfree_enabled"
								name="cashfree_enabled"
								bind:checked={cashfreeEnabled}
							/>
							<input type="hidden" name="cashfree_enabled" value={cashfreeEnabled ? 'on' : 'off'} />
						</div>
					</div>
				</CardHeader>
				{#if cashfreeEnabled}
					<CardContent class="space-y-4">
						<div class="grid gap-4 md:grid-cols-2">
							<div>
								<Label for="cashfree_app_id">App ID</Label>
								<Input
									id="cashfree_app_id"
									name="cashfree_app_id"
									placeholder="Your Cashfree App ID"
									bind:value={cashfreeAppId}
								/>
							</div>
							<div>
								<Label for="cashfree_secret_key">Secret Key</Label>
								<Input
									id="cashfree_secret_key"
									name="cashfree_secret_key"
									type="password"
									placeholder="Enter new secret or leave to keep existing"
									bind:value={cashfreeSecretKey}
								/>
								<p class="text-muted-foreground mt-1 text-xs">Leave masked value to keep existing secret</p>
							</div>
						</div>
						<div>
							<Label for="cashfree_webhook_secret">Webhook Secret</Label>
							<Input
								id="cashfree_webhook_secret"
								name="cashfree_webhook_secret"
								type="password"
								placeholder="Webhook signature secret"
								bind:value={cashfreeWebhookSecret}
							/>
						</div>
					</CardContent>
				{/if}
			</Card>

			<!-- UPI Manual -->
			<Card>
				<CardHeader>
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-3">
							<QrCode class="h-6 w-6" />
							<div>
								<CardTitle>Manual UPI</CardTitle>
								<CardDescription>Accept direct UPI payments with manual verification</CardDescription>
							</div>
						</div>
						<div class="flex items-center gap-2">
							<Label for="upi_enabled" class="text-sm">Enable</Label>
							<Switch
								id="upi_enabled"
								name="upi_enabled"
								bind:checked={upiEnabled}
							/>
							<input type="hidden" name="upi_enabled" value={upiEnabled ? 'on' : 'off'} />
						</div>
					</div>
				</CardHeader>
				{#if upiEnabled}
					<CardContent class="space-y-4">
						<div>
							<Label for="upi_id">UPI ID</Label>
							<Input
								id="upi_id"
								name="upi_id"
								placeholder="yourname@upi"
								bind:value={upiId}
							/>
						</div>
						<div>
							<Label for="upi_qr_image_url">QR Code Image URL</Label>
							<Input
								id="upi_qr_image_url"
								name="upi_qr_image_url"
								placeholder="https://example.com/qr.png"
								bind:value={upiQrImageUrl}
							/>
							<p class="text-muted-foreground mt-1 text-xs">Upload QR image to media and paste URL here</p>
						</div>
						{#if upiQrImageUrl}
							<div class="mt-4">
								<p class="text-muted-foreground mb-2 text-sm">Preview:</p>
								<img src={upiQrImageUrl} alt="UPI QR Code" class="h-32 w-32 rounded border object-contain" />
							</div>
						{/if}
					</CardContent>
				{/if}
			</Card>

			<div class="flex justify-end">
				<Button type="submit" disabled={saving}>
					{saving ? 'Saving...' : 'Save Settings'}
				</Button>
			</div>
		</div>
	</form>
</div>
