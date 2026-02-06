<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import type { FormFieldDef, FormConditionalRule, FormSettings } from '$lib/server/db/schema';
	import FormRenderer from '$lib/components/forms/FormRenderer.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	function parseJson<T>(raw: unknown, fallback: T): T {
		if (!raw) return fallback;
		if (typeof raw === 'string') {
			try { return JSON.parse(raw); } catch { return fallback; }
		}
		return raw as T;
	}

	const fields = parseJson<FormFieldDef[]>(data.form.fields, []);
	const settings = parseJson<FormSettings>(data.form.settings, {});
	const conditionalRules = parseJson<FormConditionalRule[]>(data.form.conditional_rules, []);
</script>

<svelte:head>
	<title>{data.form.title} | {data.tenant.name}</title>
</svelte:head>

<div class="mx-auto max-w-2xl px-4 py-12">
	<h1 class="mb-6 text-2xl font-bold">{data.form.title}</h1>

	{#if form?.success}
		<div class="py-8 text-center">
			<p class="text-lg font-medium">
				{settings.success_message ?? 'Thank you for your submission!'}
			</p>
		</div>
	{:else}
		<FormRenderer
			formId={data.form.id}
			{fields}
			{settings}
			{conditionalRules}
			action="?/"
			submitMethod="form"
		/>
	{/if}
</div>
