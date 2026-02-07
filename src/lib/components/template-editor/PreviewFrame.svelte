<script lang="ts">
	import { onMount } from 'svelte';
	import { generateSiteCSS } from '$lib/styles/site-css';

	interface Props {
		html?: string;
		css?: string;
		error?: string | null;
		class?: string;
	}

	let { html = '', css = '', error = null, class: className = '' }: Props = $props();

	let siteCSS = '';

	type DeviceSize = 'desktop' | 'tablet' | 'mobile';
	let activeDevice: DeviceSize = $state('desktop');

	const devices: { key: DeviceSize; label: string; width: string; icon: string }[] = [
		{ key: 'desktop', label: 'Desktop', width: '100%', icon: '🖥' },
		{ key: 'tablet', label: 'Tablet', width: '768px', icon: '📱' },
		{ key: 'mobile', label: 'Mobile', width: '375px', icon: '📲' }
	];

	const activeWidth = $derived(devices.find((d) => d.key === activeDevice)?.width ?? '100%');

	onMount(() => {
		siteCSS = generateSiteCSS();
	});

	const srcdoc = $derived(`<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
	<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900&family=DM+Sans:ital,wght@0,400..700;1,400..700&display=swap" rel="stylesheet">
	<style>
		${siteCSS}
		${css}
	</style>
</head>
<body>
	${html}
</body>
</html>`);
</script>

<div class="preview-frame {className}">
	<div class="device-toolbar">
		{#each devices as device}
			<button
				class="device-btn"
				class:active={activeDevice === device.key}
				onclick={() => (activeDevice = device.key)}
				title={device.label}
			>
				<span class="device-icon">{device.icon}</span>
				<span class="device-label">{device.label}</span>
			</button>
		{/each}
	</div>

	{#if error}
		<div class="preview-error">
			<div class="error-icon">!</div>
			<div class="error-content">
				<div class="error-title">Compile Error</div>
				<pre class="error-message">{error}</pre>
			</div>
		</div>
	{:else}
		<div class="iframe-wrapper">
			<iframe
				title="Template Preview"
				sandbox="allow-scripts"
				{srcdoc}
				class="preview-iframe"
				style:width={activeWidth}
			></iframe>
		</div>
	{/if}
</div>

<style>
	.preview-frame {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		background: #1e1e1e;
		border-radius: 8px;
		overflow: hidden;
	}

	.device-toolbar {
		display: flex;
		gap: 2px;
		padding: 6px 8px;
		background: #2d2d2d;
		border-bottom: 1px solid #3d3d3d;
		flex-shrink: 0;
	}

	.device-btn {
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 4px 10px;
		border: none;
		border-radius: 4px;
		background: transparent;
		color: #999;
		font-size: 12px;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.device-btn:hover {
		background: #3d3d3d;
		color: #ccc;
	}

	.device-btn.active {
		background: #4d4d4d;
		color: #fff;
	}

	.device-icon {
		font-size: 14px;
	}

	.device-label {
		font-family: system-ui, sans-serif;
	}

	.iframe-wrapper {
		flex: 1;
		display: flex;
		justify-content: center;
		overflow: auto;
		background: #f5f5f5;
	}

	.preview-iframe {
		height: 100%;
		border: none;
		background: white;
		transition: width 0.2s ease;
	}

	.preview-error {
		display: flex;
		gap: 12px;
		padding: 16px;
		background: #fef2f2;
		border: 1px solid #fecaca;
		border-radius: 8px;
		margin: 16px;
	}

	.error-icon {
		flex-shrink: 0;
		width: 24px;
		height: 24px;
		background: #dc2626;
		color: white;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: bold;
		font-size: 14px;
	}

	.error-content {
		flex: 1;
		min-width: 0;
	}

	.error-title {
		font-weight: 600;
		color: #991b1b;
		margin-bottom: 4px;
	}

	.error-message {
		font-family: monospace;
		font-size: 12px;
		color: #b91c1c;
		white-space: pre-wrap;
		word-break: break-word;
		margin: 0;
	}
</style>
