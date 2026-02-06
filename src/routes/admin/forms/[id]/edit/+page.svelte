<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import type { FormFieldDef, FormConditionalRule, FormSettings } from '$lib/server/db/schema';
	import { enhance } from '$app/forms';
	import { FormBuilder } from '$lib/components/admin/form-builder';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Sheet from '$lib/components/ui/sheet';
	import {
		ArrowLeft,
		Settings,
		CheckCircle,
		AlertCircle
	} from '@lucide/svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let saveStatus = $state<'idle' | 'saving' | 'saved' | 'error'>('idle');
	let settingsOpen = $state(false);

	let title = $state(data.form.title);
	let slug = $state(data.form.slug);
	let fields = $state<FormFieldDef[]>(parseJson(data.form.fields, []));
	let settings = $state<FormSettings>(parseJson(data.form.settings, {}));
	let conditionalRules = $state<FormConditionalRule[]>(parseJson(data.form.conditional_rules, []));

	function parseJson<T>(raw: unknown, fallback: T): T {
		if (!raw) return fallback;
		if (typeof raw === 'string') {
			try { return JSON.parse(raw); } catch { return fallback; }
		}
		return raw as T;
	}

	let saveForm: HTMLFormElement;
	let fieldsInput: HTMLInputElement;
	let settingsInput: HTMLInputElement;
	let rulesInput: HTMLInputElement;

	function handleBuilderChange(data: {
		fields: FormFieldDef[];
		settings: FormSettings;
		conditional_rules: FormConditionalRule[];
	}) {
		fields = data.fields;
		settings = data.settings;
		conditionalRules = data.conditional_rules;
	}

	function save() {
		if (!saveForm || !fieldsInput || !settingsInput || !rulesInput) return;
		fieldsInput.value = JSON.stringify(fields);
		settingsInput.value = JSON.stringify(settings);
		rulesInput.value = JSON.stringify(conditionalRules);
		saveStatus = 'saving';
		saveForm.requestSubmit();
	}

	function handleKeydown(e: KeyboardEvent) {
		if ((e.metaKey || e.ctrlKey) && e.key === 's') {
			e.preventDefault();
			save();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<svelte:head>
	<title>Edit: {data.form.title} | Forms | Admin</title>
</svelte:head>

<!-- Hidden save form -->
<form
	bind:this={saveForm}
	method="POST"
	action="?/save"
	use:enhance={() => {
		return async ({ result, update }) => {
			if (result.type === 'success') {
				saveStatus = 'saved';
				setTimeout(() => { saveStatus = 'idle'; }, 2000);
			} else {
				saveStatus = 'error';
			}
			await update();
		};
	}}
	class="hidden"
>
	<input type="hidden" name="title" value={title} />
	<input type="hidden" name="slug" value={slug} />
	<input bind:this={fieldsInput} type="hidden" name="fields" />
	<input bind:this={settingsInput} type="hidden" name="settings" />
	<input bind:this={rulesInput} type="hidden" name="conditional_rules" />
</form>

<div class="flex h-screen flex-col">
	<!-- Top bar -->
	<div class="bg-background flex items-center justify-between border-b px-4 py-2">
		<div class="flex items-center gap-4">
			<Button href="/admin/forms" variant="ghost" size="icon">
				<ArrowLeft class="h-4 w-4" />
			</Button>
			<div>
				<h1 class="font-semibold">{title}</h1>
				<p class="text-muted-foreground text-sm">/{slug}</p>
			</div>
		</div>

		<div class="flex items-center gap-3">
			{#if saveStatus === 'saved'}
				<span class="flex items-center gap-1 text-sm text-green-600">
					<CheckCircle class="h-4 w-4" /> Saved
				</span>
			{:else if saveStatus === 'error'}
				<span class="flex items-center gap-1 text-sm text-red-600">
					<AlertCircle class="h-4 w-4" /> Error
				</span>
			{/if}

			<Badge variant={data.form.status === 'published' ? 'default' : 'secondary'}>
				{data.form.status}
			</Badge>

			<Button variant="default" size="sm" onclick={save}>Save</Button>

			<Sheet.Root bind:open={settingsOpen}>
				<Sheet.Trigger>
					{#snippet child({ props })}
						<Button variant="outline" size="sm" {...props}>
							<Settings class="mr-2 h-4 w-4" /> Settings
						</Button>
					{/snippet}
				</Sheet.Trigger>
				<Sheet.Content>
					<Sheet.Header>
						<Sheet.Title>Form Settings</Sheet.Title>
					</Sheet.Header>
					<div class="mt-6 space-y-4">
						<div>
							<Label for="form-title">Title</Label>
							<Input id="form-title" bind:value={title} />
						</div>
						<div>
							<Label for="form-slug">Slug</Label>
							<Input id="form-slug" bind:value={slug} />
						</div>

						<div class="border-t pt-4">
							<h3 class="mb-4 font-medium">Publish</h3>
							{#if data.form.status === 'draft'}
								<form method="POST" action="?/publish" use:enhance>
									<Button type="submit" class="w-full">Publish Form</Button>
								</form>
							{:else}
								<form method="POST" action="?/unpublish" use:enhance>
									<Button type="submit" variant="outline" class="w-full">Unpublish</Button>
								</form>
							{/if}
						</div>

						<div class="border-t pt-4">
							<h3 class="text-destructive mb-4 font-medium">Danger Zone</h3>
							<form
								method="POST"
								action="?/delete"
								use:enhance={() => {
									if (!confirm('Delete this form and all submissions?')) {
										return async () => {};
									}
									return async ({ update }) => update();
								}}
							>
								<Button type="submit" variant="destructive" class="w-full">Delete Form</Button>
							</form>
						</div>
					</div>
				</Sheet.Content>
			</Sheet.Root>

			{#if data.form.status === 'published' && data.form.type === 'standalone'}
				<Button href="/forms/{data.form.slug}" target="_blank" variant="outline" size="sm">
					View Live
				</Button>
			{/if}
		</div>
	</div>

	<!-- Builder -->
	<div class="flex-1 overflow-hidden">
		<FormBuilder
			{fields}
			{settings}
			{conditionalRules}
			onchange={handleBuilderChange}
		/>
	</div>
</div>
