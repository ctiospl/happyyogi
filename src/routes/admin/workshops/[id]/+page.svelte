<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Badge } from '$lib/components/ui/badge';
	import * as Select from '$lib/components/ui/select';
	import * as Alert from '$lib/components/ui/alert';
	import {
		ArrowLeft,
		Save,
		Eye,
		Trash2,
		Plus,
		X,
		AlertCircle,
		CheckCircle,
		Users
	} from '@lucide/svelte';
	import type { WorkshopFaq, WorkshopSession } from '$lib/server/db/schema';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	// Form state
	let title = $state(data.workshop.title);
	let slug = $state(data.workshop.slug);
	let description = $state(data.workshop.description || '');
	let contentHtml = $state(data.workshop.content_html || '');
	let instructorId = $state(data.workshop.instructor_id || '');
	let venueName = $state(data.workshop.venue_name || '');
	let venueAddress = $state(data.workshop.venue_address || '');
	let mode = $state<'online' | 'offline' | 'hybrid'>(data.workshop.mode);
	let capacity = $state(data.workshop.capacity?.toString() || '');
	let price = $state((data.workshop.price_paise / 100).toString());
	let deposit = $state(
		data.workshop.deposit_amount_paise
			? (data.workshop.deposit_amount_paise / 100).toString()
			: ''
	);
	let cancellationPolicy = $state(data.workshop.cancellation_policy || '');

	// FAQs state
	let faqs = $state<WorkshopFaq[]>(
		typeof data.workshop.faqs === 'string'
			? JSON.parse(data.workshop.faqs)
			: data.workshop.faqs || []
	);

	// Sessions state
	let sessions = $state<
		Array<{
			id?: string;
			title: string;
			starts_at: string;
			ends_at: string;
			session_order: number;
		}>
	>(
		data.workshop.sessions.map((s: WorkshopSession) => ({
			id: s.id,
			title: s.title || '',
			starts_at: formatDateTimeLocal(s.starts_at),
			ends_at: formatDateTimeLocal(s.ends_at),
			session_order: s.session_order
		}))
	);

	let saveStatus = $state<'idle' | 'saving' | 'saved' | 'error'>('idle');

	function formatDateTimeLocal(date: Date | string): string {
		const d = new Date(date);
		return d.toISOString().slice(0, 16);
	}

	function addFaq() {
		faqs = [...faqs, { question: '', answer: '' }];
	}

	function removeFaq(index: number) {
		faqs = faqs.filter((_, i) => i !== index);
	}

	function addSession() {
		const now = new Date();
		const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
		sessions = [
			...sessions,
			{
				title: '',
				starts_at: formatDateTimeLocal(now),
				ends_at: formatDateTimeLocal(oneHourLater),
				session_order: sessions.length + 1
			}
		];
	}

	function removeSession(index: number) {
		sessions = sessions.filter((_, i) => i !== index);
		// Reorder
		sessions = sessions.map((s, i) => ({ ...s, session_order: i + 1 }));
	}

	function handleSaveSuccess() {
		saveStatus = 'saved';
		setTimeout(() => (saveStatus = 'idle'), 2000);
	}

	function handleSaveError() {
		saveStatus = 'error';
	}

	const modeOptions = [
		{ value: 'offline', label: 'In-Person' },
		{ value: 'online', label: 'Online' },
		{ value: 'hybrid', label: 'Hybrid' }
	];
</script>

<svelte:head>
	<title>Edit: {data.workshop.title} | Admin</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<!-- Header -->
	<div class="mb-8 flex items-center justify-between">
		<div class="flex items-center gap-4">
			<Button href="/admin/workshops" variant="ghost" size="icon">
				<ArrowLeft class="h-4 w-4" />
			</Button>
			<div>
				<h1 class="text-2xl font-bold">{data.workshop.title}</h1>
				<p class="text-muted-foreground text-sm">/workshops/{data.workshop.slug}</p>
			</div>
		</div>
		<div class="flex items-center gap-4">
			{#if saveStatus === 'saved'}
				<span class="flex items-center gap-1 text-sm text-green-600">
					<CheckCircle class="h-4 w-4" />
					Saved
				</span>
			{:else if saveStatus === 'error'}
				<span class="flex items-center gap-1 text-sm text-red-600">
					<AlertCircle class="h-4 w-4" />
					Error
				</span>
			{/if}
			<Badge variant={data.workshop.status === 'published' ? 'default' : 'secondary'}>
				{data.workshop.status}
			</Badge>
			{#if data.workshop.bookings_count}
				<Badge variant="outline">
					<Users class="mr-1 h-3 w-3" />
					{data.workshop.bookings_count} bookings
				</Badge>
			{/if}
			{#if data.workshop.status === 'published'}
				<Button href="/workshops/{data.workshop.slug}" target="_blank" variant="outline" size="sm">
					<Eye class="mr-2 h-4 w-4" />
					View Live
				</Button>
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

	{#if form?.success}
		<Alert.Root class="mb-6">
			<CheckCircle class="h-4 w-4" />
			<Alert.Title>Success</Alert.Title>
			<Alert.Description>{form.message}</Alert.Description>
		</Alert.Root>
	{/if}

	<div class="grid gap-6 lg:grid-cols-3">
		<!-- Main Form -->
		<div class="lg:col-span-2">
			<form
				method="POST"
				action="?/update"
				use:enhance={() => {
					saveStatus = 'saving';
					return async ({ result, update }) => {
						if (result.type === 'success') {
							handleSaveSuccess();
						} else {
							handleSaveError();
						}
						await update();
					};
				}}
			>
				<Card class="mb-6">
					<CardHeader>
						<CardTitle>Basic Info</CardTitle>
					</CardHeader>
					<CardContent class="space-y-4">
						<div class="grid gap-4 sm:grid-cols-2">
							<div>
								<Label for="title">Title</Label>
								<Input id="title" name="title" bind:value={title} required />
							</div>
							<div>
								<Label for="slug">URL Slug</Label>
								<Input id="slug" name="slug" bind:value={slug} required />
							</div>
						</div>
						<div>
							<Label for="description">Short Description</Label>
							<Textarea id="description" name="description" bind:value={description} rows={2} />
						</div>
						<div>
							<Label for="content_html">Full Description (HTML)</Label>
							<Textarea id="content_html" name="content_html" bind:value={contentHtml} rows={6} />
						</div>
					</CardContent>
				</Card>

				<Card class="mb-6">
					<CardHeader>
						<CardTitle>Workshop Details</CardTitle>
					</CardHeader>
					<CardContent class="space-y-4">
						<div class="grid gap-4 sm:grid-cols-2">
							<div>
								<Label for="instructor_id">Instructor</Label>
								<Select.Root type="single" name="instructor_id" bind:value={instructorId}>
									<Select.Trigger class="w-full">
										{#if instructorId}
											{data.instructors.find((i) => i.id === instructorId)?.name || 'Select...'}
										{:else}
											Select instructor...
										{/if}
									</Select.Trigger>
									<Select.Content>
										<Select.Item value="">None</Select.Item>
										{#each data.instructors as instructor (instructor.id)}
											<Select.Item value={instructor.id}>
												{instructor.name || instructor.slug}
											</Select.Item>
										{/each}
									</Select.Content>
								</Select.Root>
								<input type="hidden" name="instructor_id" value={instructorId} />
							</div>
							<div>
								<Label for="mode">Mode</Label>
								<Select.Root type="single" name="mode" bind:value={mode}>
									<Select.Trigger class="w-full">
										{modeOptions.find((m) => m.value === mode)?.label || 'Select...'}
									</Select.Trigger>
									<Select.Content>
										{#each modeOptions as opt (opt.value)}
											<Select.Item value={opt.value}>{opt.label}</Select.Item>
										{/each}
									</Select.Content>
								</Select.Root>
								<input type="hidden" name="mode" value={mode} />
							</div>
						</div>

						{#if mode !== 'online'}
							<div class="grid gap-4 sm:grid-cols-2">
								<div>
									<Label for="venue_name">Venue Name</Label>
									<Input id="venue_name" name="venue_name" bind:value={venueName} />
								</div>
								<div>
									<Label for="venue_address">Venue Address</Label>
									<Input id="venue_address" name="venue_address" bind:value={venueAddress} />
								</div>
							</div>
						{/if}

						<div class="grid gap-4 sm:grid-cols-3">
							<div>
								<Label for="capacity">Capacity</Label>
								<Input
									id="capacity"
									name="capacity"
									type="number"
									min="1"
									bind:value={capacity}
									placeholder="Unlimited"
								/>
							</div>
							<div>
								<Label for="price">Price (INR)</Label>
								<Input
									id="price"
									name="price"
									type="number"
									min="0"
									step="0.01"
									bind:value={price}
									required
								/>
							</div>
							<div>
								<Label for="deposit">Deposit (INR)</Label>
								<Input
									id="deposit"
									name="deposit"
									type="number"
									min="0"
									step="0.01"
									bind:value={deposit}
									placeholder="Optional"
								/>
							</div>
						</div>

						<div>
							<Label for="cancellation_policy">Cancellation Policy</Label>
							<Textarea
								id="cancellation_policy"
								name="cancellation_policy"
								bind:value={cancellationPolicy}
								rows={3}
							/>
						</div>
					</CardContent>
				</Card>

				<Card class="mb-6">
					<CardHeader>
						<CardTitle>FAQs</CardTitle>
						<CardDescription>Frequently asked questions about this workshop</CardDescription>
					</CardHeader>
					<CardContent>
						<div class="space-y-4">
							{#each faqs as faq, index (index)}
								<div class="rounded-lg border p-4">
									<div class="mb-2 flex items-start justify-between">
										<Label>Question {index + 1}</Label>
										<Button
											type="button"
											variant="ghost"
											size="icon"
											onclick={() => removeFaq(index)}
										>
											<X class="h-4 w-4" />
										</Button>
									</div>
									<Input
										placeholder="Question"
										bind:value={faqs[index].question}
										class="mb-2"
									/>
									<Textarea placeholder="Answer" bind:value={faqs[index].answer} rows={2} />
								</div>
							{/each}
							<Button type="button" variant="outline" onclick={addFaq}>
								<Plus class="mr-2 h-4 w-4" />
								Add FAQ
							</Button>
						</div>
						<input type="hidden" name="faqs" value={JSON.stringify(faqs)} />
					</CardContent>
				</Card>

				<div class="flex justify-end gap-4">
					<Button type="submit">
						<Save class="mr-2 h-4 w-4" />
						Save Changes
					</Button>
				</div>
			</form>
		</div>

		<!-- Sidebar -->
		<div class="space-y-6">
			<!-- Sessions -->
			<Card>
				<CardHeader>
					<CardTitle>Sessions</CardTitle>
					<CardDescription>Schedule for multi-session workshops</CardDescription>
				</CardHeader>
				<CardContent>
					<form
						method="POST"
						action="?/updateSessions"
						use:enhance={() => {
							return async ({ result, update }) => {
								await update();
							};
						}}
					>
						<div class="space-y-4">
							{#each sessions as session, index (index)}
								<div class="rounded-lg border p-3">
									<div class="mb-2 flex items-center justify-between">
										<span class="text-sm font-medium">Session {index + 1}</span>
										<Button
											type="button"
											variant="ghost"
											size="icon"
											onclick={() => removeSession(index)}
										>
											<X class="h-4 w-4" />
										</Button>
									</div>
									<div class="space-y-2">
										<Input
											placeholder="Session title (optional)"
											bind:value={sessions[index].title}
											class="text-sm"
										/>
										<div class="grid grid-cols-2 gap-2">
											<div>
												<Label class="text-xs">Start</Label>
												<Input
													type="datetime-local"
													bind:value={sessions[index].starts_at}
													class="text-sm"
												/>
											</div>
											<div>
												<Label class="text-xs">End</Label>
												<Input
													type="datetime-local"
													bind:value={sessions[index].ends_at}
													class="text-sm"
												/>
											</div>
										</div>
									</div>
								</div>
							{/each}
							<Button type="button" variant="outline" class="w-full" onclick={addSession}>
								<Plus class="mr-2 h-4 w-4" />
								Add Session
							</Button>
						</div>
						<input type="hidden" name="sessions" value={JSON.stringify(sessions)} />
						{#if sessions.length > 0}
							<Button type="submit" class="mt-4 w-full">Save Sessions</Button>
						{/if}
					</form>
				</CardContent>
			</Card>

			<!-- Publish -->
			<Card>
				<CardHeader>
					<CardTitle>Publish</CardTitle>
				</CardHeader>
				<CardContent>
					{#if data.workshop.status === 'draft'}
						<form method="POST" action="?/publish" use:enhance>
							<Button type="submit" class="w-full">Publish Workshop</Button>
						</form>
					{:else if data.workshop.status === 'published'}
						<form method="POST" action="?/unpublish" use:enhance>
							<Button type="submit" variant="outline" class="w-full">Unpublish</Button>
						</form>
					{:else}
						<p class="text-muted-foreground text-sm">
							Workshop is {data.workshop.status}
						</p>
					{/if}
				</CardContent>
			</Card>

			<!-- Danger Zone -->
			<Card>
				<CardHeader>
					<CardTitle class="text-destructive">Danger Zone</CardTitle>
				</CardHeader>
				<CardContent>
					<form
						method="POST"
						action="?/delete"
						use:enhance={() => {
							if (!confirm('Are you sure? This cannot be undone.')) {
								return async () => {};
							}
							return async ({ update }) => update();
						}}
					>
						<Button type="submit" variant="destructive" class="w-full">
							<Trash2 class="mr-2 h-4 w-4" />
							Delete Workshop
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	</div>
</div>
