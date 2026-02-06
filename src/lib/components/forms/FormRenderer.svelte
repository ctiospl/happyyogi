<script lang="ts">
	import type { FormFieldDef, FormConditionalRule, FormSettings } from '$lib/server/db/schema';
	import { FIELD_COMPONENT_MAP } from './fields';
	import FormStepIndicator from './FormStepIndicator.svelte';
	import { evaluateRules } from './conditional';
	import { Button } from '$lib/components/ui/button';
	import { enhance } from '$app/forms';

	interface Props {
		formId: string;
		fields: FormFieldDef[];
		settings: FormSettings;
		conditionalRules: FormConditionalRule[];
		action?: string; // form action URL
		submitMethod?: 'form' | 'fetch'; // form = use:enhance, fetch = POST to API
		readonly?: boolean;
	}

	let {
		formId,
		fields,
		settings,
		conditionalRules,
		action = '',
		submitMethod = 'form',
		readonly = false
	}: Props = $props();

	let formData = $state<Record<string, unknown>>({});
	let currentStep = $state(0);
	let submitted = $state(false);
	let submitting = $state(false);
	let errorMsg = $state('');

	const hiddenFields = $derived(evaluateRules(conditionalRules, formData));

	const isMultiStep = $derived(settings.multi_step && (settings.steps?.length ?? 0) > 1);
	const steps = $derived(settings.steps ?? []);
	const totalSteps = $derived(steps.length);

	const visibleFields = $derived(
		fields.filter((f) => !hiddenFields.has(f.id))
	);

	const currentStepFields = $derived(
		isMultiStep
			? visibleFields.filter((f) => (f.step ?? 0) === currentStep)
			: visibleFields
	);

	const isLastStep = $derived(!isMultiStep || currentStep === totalSteps - 1);

	function updateField(id: string, value: unknown) {
		formData = { ...formData, [id]: value };
	}

	function nextStep() {
		if (currentStep < totalSteps - 1) currentStep++;
	}

	function prevStep() {
		if (currentStep > 0) currentStep--;
	}

	async function handleSubmit() {
		submitting = true;
		errorMsg = '';

		try {
			if (submitMethod === 'fetch') {
				const res = await fetch(`/api/forms/${formId}/submit`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ data: formData })
				});
				if (!res.ok) {
					const err = await res.json();
					errorMsg = err.error || 'Submission failed';
					return;
				}
			}
			submitted = true;

			if (settings.redirect_url) {
				window.location.href = settings.redirect_url;
			}
		} catch {
			errorMsg = 'Something went wrong. Please try again.';
		} finally {
			submitting = false;
		}
	}
</script>

{#if submitted}
	<div class="py-8 text-center">
		<div class="mb-2 text-2xl">&#10003;</div>
		<p class="text-lg font-medium">
			{settings.success_message ?? 'Thank you for your submission!'}
		</p>
	</div>
{:else}
	{#if isMultiStep}
		<FormStepIndicator {steps} {currentStep} />
	{/if}

	<form
		method="POST"
		{action}
		use:enhance={() => {
			submitting = true;
			return async ({ result, update }) => {
				submitting = false;
				if (result.type === 'success') {
					submitted = true;
					if (settings.redirect_url) window.location.href = settings.redirect_url;
				} else {
					errorMsg = 'Submission failed. Please try again.';
				}
				await update();
			};
		}}
		onsubmit={(e: SubmitEvent) => {
			if (submitMethod === 'fetch') {
				e.preventDefault();
				handleSubmit();
			}
		}}
		class="space-y-4"
	>
		<input type="hidden" name="form_id" value={formId} />
		<input type="hidden" name="form_data" value={JSON.stringify(formData)} />

		{#each currentStepFields as field (field.id)}
			{#if field.type === 'heading'}
				<h3 class="pt-2 text-lg font-semibold">{field.label}</h3>
			{:else}
				{@const FieldComponent = FIELD_COMPONENT_MAP[field.type]}
				{#if FieldComponent}
					<svelte:component
						this={FieldComponent}
						{field}
						value={formData[field.id] ?? ''}
						onchange={(v: unknown) => updateField(field.id, v)}
					/>
				{/if}
			{/if}
		{/each}

		{#if errorMsg}
			<p class="text-destructive text-sm">{errorMsg}</p>
		{/if}

		<div class="flex gap-2 pt-2">
			{#if isMultiStep && currentStep > 0}
				<Button type="button" variant="outline" onclick={prevStep}>Back</Button>
			{/if}
			<div class="flex-1"></div>
			{#if isMultiStep && !isLastStep}
				<Button type="button" onclick={nextStep}>Next</Button>
			{:else}
				<Button type="submit" disabled={submitting || readonly}>
					{submitting ? 'Submitting...' : (settings.submit_label ?? 'Submit')}
				</Button>
			{/if}
		</div>
	</form>
{/if}
