<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Upload, X, Loader2 } from '@lucide/svelte';

	interface Props {
		value: string;
		onchange: (url: string) => void;
	}

	let { value, onchange }: Props = $props();
	let uploading = $state(false);
	let dragover = $state(false);
	let fileInput: HTMLInputElement;

	async function handleFile(file: File) {
		if (!file.type.startsWith('image/')) return;
		uploading = true;
		try {
			const form = new FormData();
			form.append('file', file);
			const res = await fetch('/api/media/upload', { method: 'POST', body: form });
			if (!res.ok) {
				const err = await res.json().catch(() => ({ message: res.statusText }));
				throw new Error(err.message || 'Upload failed');
			}
			const data = await res.json();
			onchange(data.url);
		} catch (e) {
			console.error('Upload failed:', e);
		} finally {
			uploading = false;
		}
	}

	function onDrop(e: DragEvent) {
		e.preventDefault();
		dragover = false;
		const file = e.dataTransfer?.files[0];
		if (file) handleFile(file);
	}

	function onFileSelect(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (file) handleFile(file);
		input.value = '';
	}
</script>

<div class="space-y-2">
	{#if value}
		<div class="relative inline-block">
			<img src={value} alt="Current" class="h-24 w-auto rounded border object-cover" />
			<button
				type="button"
				class="absolute -right-2 -top-2 rounded-full bg-red-500 p-0.5 text-white shadow hover:bg-red-600"
				onclick={() => onchange('')}
			>
				<X class="h-3 w-3" />
			</button>
		</div>
	{/if}

	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="flex cursor-pointer flex-col items-center rounded-lg border-2 border-dashed p-4 transition-colors
			{dragover ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-muted-foreground/50'}"
		ondragover={(e) => { e.preventDefault(); dragover = true; }}
		ondragleave={() => { dragover = false; }}
		ondrop={onDrop}
		onclick={() => fileInput.click()}
		onkeydown={(e) => { if (e.key === 'Enter') fileInput.click(); }}
		role="button"
		tabindex="0"
	>
		{#if uploading}
			<Loader2 class="h-6 w-6 animate-spin text-muted-foreground" />
			<span class="mt-1 text-sm text-muted-foreground">Uploading...</span>
		{:else}
			<Upload class="h-6 w-6 text-muted-foreground" />
			<span class="mt-1 text-sm text-muted-foreground">Drop image or click to upload</span>
		{/if}
	</div>

	<input
		bind:this={fileInput}
		type="file"
		accept="image/jpeg,image/png,image/webp,image/gif"
		class="hidden"
		onchange={onFileSelect}
	/>
</div>
