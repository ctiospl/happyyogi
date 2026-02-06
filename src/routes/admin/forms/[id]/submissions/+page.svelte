<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import type { FormFieldDef } from '$lib/server/db/schema';
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import * as Table from '$lib/components/ui/table';
	import { ArrowLeft, Download, Trash2, ChevronLeft, ChevronRight } from '@lucide/svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	function parseJson<T>(raw: unknown, fallback: T): T {
		if (!raw) return fallback;
		if (typeof raw === 'string') {
			try { return JSON.parse(raw); } catch { return fallback; }
		}
		return raw as T;
	}

	const fields = $derived(parseJson<FormFieldDef[]>(data.form.fields, []));
	const displayFields = $derived(fields.filter(f => f.type !== 'heading').slice(0, 6));

	function getDisplayValue(val: unknown): string {
		if (val == null || val === '') return '—';
		if (typeof val === 'boolean') return val ? 'Yes' : 'No';
		if (typeof val === 'object') return JSON.stringify(val);
		return String(val);
	}
</script>

<svelte:head>
	<title>Submissions: {data.form.title} | Admin</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<div class="mb-8 flex items-center justify-between">
		<div class="flex items-center gap-4">
			<Button href="/admin/forms" variant="ghost" size="icon">
				<ArrowLeft class="h-4 w-4" />
			</Button>
			<div>
				<h1 class="text-2xl font-bold">Submissions</h1>
				<p class="text-muted-foreground text-sm">{data.form.title} — {data.total} total</p>
			</div>
		</div>
		<div class="flex gap-2">
			<Button
				href="/api/forms/{data.form.id}/export?format=csv"
				variant="outline"
				size="sm"
				target="_blank"
			>
				<Download class="mr-1 h-4 w-4" /> CSV
			</Button>
			<Button
				href="/api/forms/{data.form.id}/export?format=json"
				variant="outline"
				size="sm"
				target="_blank"
			>
				<Download class="mr-1 h-4 w-4" /> JSON
			</Button>
		</div>
	</div>

	{#if form?.error}
		<div class="bg-destructive/10 text-destructive mb-6 rounded-lg p-4">{form.error}</div>
	{/if}

	<Card>
		<CardContent class="p-0">
			{#if data.submissions.length === 0}
				<div class="text-muted-foreground py-12 text-center">
					<p>No submissions yet.</p>
				</div>
			{:else}
				<Table.Root>
					<Table.Header>
						<Table.Row>
							{#each displayFields as field}
								<Table.Head>{field.label}</Table.Head>
							{/each}
							<Table.Head>Submitted</Table.Head>
							<Table.Head class="w-16"></Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each data.submissions as sub}
							{@const subData = parseJson<Record<string, unknown>>(sub.data, {})}
							<Table.Row>
								{#each displayFields as field}
									<Table.Cell class="max-w-48 truncate text-sm">
										{getDisplayValue(subData[field.id])}
									</Table.Cell>
								{/each}
								<Table.Cell class="text-muted-foreground text-sm">
									{new Date(sub.submitted_at as unknown as string).toLocaleString()}
								</Table.Cell>
								<Table.Cell>
									<form method="POST" action="?/delete" use:enhance={() => {
										if (!confirm('Delete this submission?')) return async () => {};
										return async ({ update }) => update();
									}}>
										<input type="hidden" name="id" value={sub.id} />
										<Button type="submit" variant="ghost" size="icon" class="h-7 w-7">
											<Trash2 class="h-3 w-3 text-red-500" />
										</Button>
									</form>
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>

				<!-- Pagination -->
				{#if data.totalPages > 1}
					<div class="flex items-center justify-between border-t px-4 py-3">
						<span class="text-muted-foreground text-sm">
							Page {data.page} of {data.totalPages}
						</span>
						<div class="flex gap-1">
							<Button
								href="?page={data.page - 1}"
								variant="outline"
								size="icon"
								class="h-8 w-8"
								disabled={data.page <= 1}
							>
								<ChevronLeft class="h-4 w-4" />
							</Button>
							<Button
								href="?page={data.page + 1}"
								variant="outline"
								size="icon"
								class="h-8 w-8"
								disabled={data.page >= data.totalPages}
							>
								<ChevronRight class="h-4 w-4" />
							</Button>
						</div>
					</div>
				{/if}
			{/if}
		</CardContent>
	</Card>
</div>
