<script lang="ts">
	import type { FormFieldDef } from '$lib/server/db/schema';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Upload, X } from '@lucide/svelte';

	interface Props {
		field: FormFieldDef;
		value: string;
		onchange: (value: string) => void;
	}

	let { field, value, onchange }: Props = $props();
	let uploading = $state(false);

	async function handleFile(file: File) {
		if (!file) return;
		const maxMb = field.validation?.max_size_mb ?? 10;
		if (file.size > maxMb * 1024 * 1024) {
			alert(`File too large. Max ${maxMb}MB.`);
			return;
		}
		uploading = true;
		try {
			const fd = new FormData();
			fd.append('file', file);
			const res = await fetch('/api/media/upload', { method: 'POST', body: fd });
			if (!res.ok) throw new Error('Upload failed');
			const data = await res.json();
			onchange(data.url);
		} catch {
			alert('Upload failed');
		} finally {
			uploading = false;
		}
	}
</script>

<div>
	<Label>
		{field.label}
		{#if field.required}<span class="text-destructive">*</span>{/if}
	</Label>
	{#if value}
		<div class="mt-1 flex items-center gap-2 rounded-md border p-2 text-sm">
			<span class="flex-1 truncate">{value}</span>
			<Button variant="ghost" size="icon" class="h-6 w-6" onclick={() => onchange('')}>
				<X class="h-3 w-3" />
			</Button>
		</div>
	{:else}
		<label class="hover:bg-muted mt-1 flex cursor-pointer flex-col items-center gap-2 rounded-md border-2 border-dashed p-4 transition-colors">
			<Upload class="text-muted-foreground h-6 w-6" />
			<span class="text-muted-foreground text-sm">{uploading ? 'Uploading...' : 'Click to upload'}</span>
			<input
				type="file"
				accept={field.validation?.accept}
				class="hidden"
				onchange={(e: Event) => {
					const file = (e.target as HTMLInputElement).files?.[0];
					if (file) handleFile(file);
				}}
				disabled={uploading}
			/>
		</label>
	{/if}
	<input type="hidden" name={field.id} {value} />
</div>
