<script lang="ts">
	import type { FormFieldType } from '$lib/server/db/schema';
	import { FIELD_TYPES } from './field-types';
	import { Button } from '$lib/components/ui/button';

	interface Props {
		onadd: (type: FormFieldType) => void;
	}

	let { onadd }: Props = $props();
</script>

<div class="space-y-2">
	<h3 class="text-sm font-medium">Add Field</h3>
	<div class="grid grid-cols-3 gap-1.5">
		{#each FIELD_TYPES as ft (ft.type)}
			<button
				class="hover:bg-muted flex flex-col items-center gap-1 rounded-md border p-2 text-xs transition-colors"
				onclick={() => onadd(ft.type)}
			>
				<ft.icon class="h-4 w-4" />
				<span class="truncate">{ft.label}</span>
			</button>
		{/each}
	</div>
</div>
