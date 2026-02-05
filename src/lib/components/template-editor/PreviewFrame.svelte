<script lang="ts">
	import { onMount } from 'svelte';
	import { generateSiteCSS } from '$lib/components/page-builder/utils/site-css';

	interface Props {
		html?: string;
		css?: string;
		error?: string | null;
		class?: string;
	}

	let { html = '', css = '', error = null, class: className = '' }: Props = $props();

	let iframe: HTMLIFrameElement;
	let siteCSS = '';

	onMount(() => {
		siteCSS = generateSiteCSS();
	});

	// Update iframe content when html/css changes
	$effect(() => {
		if (iframe && !error) {
			updateIframeContent();
		}
	});

	function updateIframeContent() {
		const doc = iframe.contentDocument;
		if (!doc) return;

		const fullHtml = `
<!DOCTYPE html>
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
</html>`;

		doc.open();
		doc.write(fullHtml);
		doc.close();
	}
</script>

<div class="preview-frame {className}">
	{#if error}
		<div class="preview-error">
			<div class="error-icon">!</div>
			<div class="error-content">
				<div class="error-title">Compile Error</div>
				<pre class="error-message">{error}</pre>
			</div>
		</div>
	{:else}
		<iframe
			bind:this={iframe}
			title="Template Preview"
			sandbox="allow-same-origin"
			class="preview-iframe"
		></iframe>
	{/if}
</div>

<style>
	.preview-frame {
		width: 100%;
		height: 100%;
		background: white;
		border-radius: 8px;
		overflow: hidden;
	}

	.preview-iframe {
		width: 100%;
		height: 100%;
		border: none;
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
