<script lang="ts">
	import type { FormFieldDef } from '$lib/server/db/schema';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { onMount } from 'svelte';

	interface Props {
		field: FormFieldDef;
		value: string;
		onchange: (value: string) => void;
	}

	let { field, value, onchange }: Props = $props();

	let canvasEl: HTMLCanvasElement;
	let drawing = $state(false);

	onMount(() => {
		const ctx = canvasEl.getContext('2d')!;

		// Set up canvas
		canvasEl.width = canvasEl.offsetWidth;
		canvasEl.height = 150;
		ctx.strokeStyle = '#000';
		ctx.lineWidth = 2;
		ctx.lineCap = 'round';

		// Restore existing signature
		if (value) {
			const img = new Image();
			img.onload = () => ctx.drawImage(img, 0, 0);
			img.src = value;
		}

		function getPos(e: MouseEvent | TouchEvent) {
			const rect = canvasEl.getBoundingClientRect();
			const touch = 'touches' in e ? e.touches[0] : e;
			return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
		}

		function startDraw(e: MouseEvent | TouchEvent) {
			drawing = true;
			const { x, y } = getPos(e);
			ctx.beginPath();
			ctx.moveTo(x, y);
		}

		function draw(e: MouseEvent | TouchEvent) {
			if (!drawing) return;
			e.preventDefault();
			const { x, y } = getPos(e);
			ctx.lineTo(x, y);
			ctx.stroke();
		}

		function endDraw() {
			if (!drawing) return;
			drawing = false;
			onchange(canvasEl.toDataURL('image/png'));
		}

		canvasEl.addEventListener('mousedown', startDraw);
		canvasEl.addEventListener('mousemove', draw);
		canvasEl.addEventListener('mouseup', endDraw);
		canvasEl.addEventListener('mouseleave', endDraw);
		canvasEl.addEventListener('touchstart', startDraw, { passive: false });
		canvasEl.addEventListener('touchmove', draw, { passive: false });
		canvasEl.addEventListener('touchend', endDraw);

		return () => {
			canvasEl.removeEventListener('mousedown', startDraw);
			canvasEl.removeEventListener('mousemove', draw);
			canvasEl.removeEventListener('mouseup', endDraw);
			canvasEl.removeEventListener('mouseleave', endDraw);
			canvasEl.removeEventListener('touchstart', startDraw);
			canvasEl.removeEventListener('touchmove', draw);
			canvasEl.removeEventListener('touchend', endDraw);
		};
	});

	function clear() {
		const ctx = canvasEl.getContext('2d')!;
		ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
		onchange('');
	}
</script>

<div>
	<div class="flex items-center justify-between">
		<Label>
			{field.label}
			{#if field.required}<span class="text-destructive">*</span>{/if}
		</Label>
		<Button variant="ghost" size="sm" onclick={clear}>Clear</Button>
	</div>
	<canvas
		bind:this={canvasEl}
		class="mt-1 w-full cursor-crosshair rounded-md border bg-white"
		style="height: 150px; touch-action: none;"
	></canvas>
	<input type="hidden" name={field.id} {value} />
</div>
