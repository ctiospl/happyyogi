<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type grapesjs from 'grapesjs';
	import type { Editor, EditorConfig } from 'grapesjs';
	import type { PageContent } from '$lib/types';
	import { registerCustomBlocks } from './blocks';
	import { extractBlocks } from './utils/extract-blocks';
	import { contentToGrapesProject, isPageContent } from './utils/content-to-grapes';
	import { generateSiteCSS } from './utils/site-css';

	interface Props {
		initialHtml?: string;
		initialCss?: string;
		initialJson?: object;
		initialStructured?: object;
		themeCSS?: string;
		onSave?: (data: { html: string; css: string; json: object; contentBlocks?: PageContent }) => void;
		onLoad?: (editor: Editor) => void;
		config?: Partial<EditorConfig>;
		class?: string;
	}

	let {
		initialHtml = '',
		initialCss = '',
		initialJson,
		initialStructured,
		themeCSS = '',
		onSave,
		onLoad,
		config = {},
		class: className = ''
	}: Props = $props();

	let editorContainer: HTMLDivElement;
	let editor: Editor | null = $state(null);

	onMount(async () => {
		// Dynamic import for SSR compatibility
		const grapesjs = (await import('grapesjs')).default;
		await import('grapesjs/dist/css/grapes.min.css');

		// Generate site CSS and create blob URL for iframe injection
		const siteCSS = themeCSS || generateSiteCSS();
		const cssBlob = new Blob([siteCSS], { type: 'text/css' });
		const cssBlobUrl = URL.createObjectURL(cssBlob);

		// Build canvas styles array - inject theme CSS into iframe
		const canvasStyles: string[] = [
			// Google Fonts
			'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900&family=DM+Sans:ital,wght@0,400..700;1,400..700&display=swap',
			// Site CSS as blob URL
			cssBlobUrl
		];

		const defaultConfig: EditorConfig = {
			container: editorContainer,
			height: '100%',
			width: 'auto',
			storageManager: false,
			panels: { defaults: [] },
			canvas: {
				styles: canvasStyles
			},
			deviceManager: {
				devices: [
					{ name: 'Desktop', width: '' },
					{ name: 'Tablet', width: '768px', widthMedia: '992px' },
					{ name: 'Mobile', width: '375px', widthMedia: '480px' }
				]
			},
			blockManager: {
				appendTo: '#blocks',
				blocks: getDefaultBlocks()
			},
			styleManager: {
				appendTo: '#styles',
				sectors: getDefaultStyleSectors()
			},
			layerManager: {
				appendTo: '#layers'
			},
			traitManager: {
				appendTo: '#traits'
			},
			assetManager: {
				// Assets configuration
			}
		};

		editor = grapesjs.init({
			...defaultConfig,
			...config
		});

		// Add custom commands
		addCommands(editor);

		// Register custom structured blocks (safe to do before load)
		registerCustomBlocks(editor);

		// Wait for editor to be ready before loading content
		editor.on('load', () => {
			// Priority:
			// 1. GrapesJS project data (if available and valid)
			// 2. Structured PageContent (convert to GrapesJS) - check both initialStructured AND initialJson
			// 3. Raw HTML/CSS fallback

			const isGrapesFormat = initialJson && ('pages' in initialJson || 'assets' in initialJson || ('components' in initialJson && !('blocks' in initialJson)));

			// Check if initialJson is actually PageContent format (backwards compat)
			const structuredContent = initialStructured || (isPageContent(initialJson) ? initialJson : null);

			if (initialJson && isGrapesFormat) {
				// Load existing GrapesJS project data
				editor.loadProjectData(initialJson);
			} else if (structuredContent && isPageContent(structuredContent)) {
				// Convert structured content to GrapesJS format
				const grapesProject = contentToGrapesProject(structuredContent);
				editor.loadProjectData(grapesProject);
			} else if (initialHtml) {
				// Fallback to raw HTML
				editor.setComponents(initialHtml);
				if (initialCss) {
					editor.setStyle(initialCss);
				}
			}

			// Notify parent
			onLoad?.(editor);
		});
	});

	onDestroy(() => {
		if (editor) {
			editor.destroy();
		}
	});

	function getDefaultBlocks() {
		return [
			{
				id: 'section',
				label: 'Section',
				category: 'Layout',
				content: `<section class="py-16 px-4"><div class="max-w-6xl mx-auto"></div></section>`
			},
			{
				id: 'container',
				label: 'Container',
				category: 'Layout',
				content: `<div class="max-w-6xl mx-auto px-4"></div>`
			},
			{
				id: 'grid-2',
				label: '2 Columns',
				category: 'Layout',
				content: `<div class="grid grid-cols-1 md:grid-cols-2 gap-8"></div>`
			},
			{
				id: 'grid-3',
				label: '3 Columns',
				category: 'Layout',
				content: `<div class="grid grid-cols-1 md:grid-cols-3 gap-8"></div>`
			},
			{
				id: 'heading',
				label: 'Heading',
				category: 'Basic',
				content: '<h2 class="text-3xl font-bold">Heading</h2>'
			},
			{
				id: 'paragraph',
				label: 'Paragraph',
				category: 'Basic',
				content: '<p class="text-base leading-relaxed">Your text here...</p>'
			},
			{
				id: 'button',
				label: 'Button',
				category: 'Basic',
				content:
					'<a href="#" class="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90">Button</a>'
			},
			{
				id: 'image',
				label: 'Image',
				category: 'Basic',
				content: { type: 'image' }
			},
			{
				id: 'hero',
				label: 'Hero Section',
				category: 'Sections',
				content: `
					<section class="py-20 px-4 bg-gradient-to-br from-primary/10 to-secondary/10">
						<div class="max-w-4xl mx-auto text-center">
							<h1 class="text-4xl md:text-5xl font-bold mb-6">Welcome to Happy Yogi</h1>
							<p class="text-xl text-muted-foreground mb-8">Your journey to wellness begins here</p>
							<a href="/workshops" class="inline-block px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold text-lg hover:opacity-90">Explore Workshops</a>
						</div>
					</section>
				`
			},
			{
				id: 'feature-cards',
				label: 'Feature Cards',
				category: 'Sections',
				content: `
					<section class="py-16 px-4">
						<div class="max-w-6xl mx-auto">
							<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
								<div class="p-6 bg-card rounded-lg border">
									<h3 class="text-xl font-semibold mb-3">Feature One</h3>
									<p class="text-muted-foreground">Description of feature one goes here.</p>
								</div>
								<div class="p-6 bg-card rounded-lg border">
									<h3 class="text-xl font-semibold mb-3">Feature Two</h3>
									<p class="text-muted-foreground">Description of feature two goes here.</p>
								</div>
								<div class="p-6 bg-card rounded-lg border">
									<h3 class="text-xl font-semibold mb-3">Feature Three</h3>
									<p class="text-muted-foreground">Description of feature three goes here.</p>
								</div>
							</div>
						</div>
					</section>
				`
			},
			{
				id: 'testimonial',
				label: 'Testimonial',
				category: 'Sections',
				content: `
					<section class="py-16 px-4 bg-muted/50">
						<div class="max-w-3xl mx-auto text-center">
							<blockquote class="text-2xl italic mb-6">"This practice transformed my life. I've never felt more balanced and at peace."</blockquote>
							<cite class="text-muted-foreground">— Student Name</cite>
						</div>
					</section>
				`
			},
			{
				id: 'cta',
				label: 'Call to Action',
				category: 'Sections',
				content: `
					<section class="py-16 px-4 bg-primary text-primary-foreground">
						<div class="max-w-4xl mx-auto text-center">
							<h2 class="text-3xl font-bold mb-4">Ready to Start?</h2>
							<p class="text-lg mb-8 opacity-90">Join our next workshop and begin your transformation.</p>
							<a href="/workshops" class="inline-block px-8 py-4 bg-background text-foreground rounded-lg font-semibold hover:opacity-90">View Schedule</a>
						</div>
					</section>
				`
			}
		];
	}

	function getDefaultStyleSectors() {
		return [
			{
				name: 'Layout',
				open: true,
				properties: ['display', 'flex-direction', 'justify-content', 'align-items', 'gap']
			},
			{
				name: 'Spacing',
				properties: ['padding', 'margin']
			},
			{
				name: 'Size',
				properties: ['width', 'max-width', 'height', 'min-height']
			},
			{
				name: 'Typography',
				properties: [
					'font-family',
					'font-size',
					'font-weight',
					'line-height',
					'text-align',
					'color'
				]
			},
			{
				name: 'Background',
				properties: ['background-color', 'background-image']
			},
			{
				name: 'Border',
				properties: ['border-radius', 'border', 'box-shadow']
			}
		];
	}

	function addCommands(ed: Editor) {
		ed.Commands.add('save-page', {
			run: () => {
				if (onSave) {
					const projectData = ed.getProjectData();
					const contentBlocks = extractBlocks(projectData as Parameters<typeof extractBlocks>[0]);
					onSave({
						html: ed.getHtml(),
						css: ed.getCss() || '',
						json: projectData,
						contentBlocks
					});
				}
			}
		});

		ed.Commands.add('preview', {
			run: (ed) => {
				ed.runCommand('sw-visibility');
			},
			stop: (ed) => {
				ed.stopCommand('sw-visibility');
			}
		});
	}

	export function getEditor(): Editor | null {
		return editor;
	}

	export function getContent(): { html: string; css: string; json: object } | null {
		if (!editor) return null;
		return {
			html: editor.getHtml(),
			css: editor.getCss() || '',
			json: editor.getProjectData()
		};
	}

	export function setContent(html: string, css?: string) {
		if (!editor) return;
		editor.setComponents(html);
		if (css) editor.setStyle(css);
	}

	export function loadProjectData(data: object) {
		if (!editor) return;
		editor.loadProjectData(data);
	}
</script>

<div class="page-builder-wrapper {className}">
	<div class="page-builder-toolbar">
		<div class="page-builder-toolbar-left">
			<button
				type="button"
				class="toolbar-btn"
				onclick={() => editor?.runCommand('core:undo')}
				title="Undo"
			>
				↶
			</button>
			<button
				type="button"
				class="toolbar-btn"
				onclick={() => editor?.runCommand('core:redo')}
				title="Redo"
			>
				↷
			</button>
		</div>
		<div class="page-builder-toolbar-center">
			<button
				type="button"
				class="toolbar-btn"
				onclick={() => editor?.setDevice('Desktop')}
				title="Desktop"
			>
				🖥
			</button>
			<button
				type="button"
				class="toolbar-btn"
				onclick={() => editor?.setDevice('Tablet')}
				title="Tablet"
			>
				⬜
			</button>
			<button
				type="button"
				class="toolbar-btn"
				onclick={() => editor?.setDevice('Mobile')}
				title="Mobile"
			>
				📱
			</button>
		</div>
		<div class="page-builder-toolbar-right">
			<button
				type="button"
				class="toolbar-btn preview-btn"
				onclick={() => editor?.runCommand('preview')}
				title="Preview"
			>
				Preview
			</button>
			<button
				type="button"
				class="toolbar-btn save-btn"
				onclick={() => editor?.runCommand('save-page')}
				title="Save"
			>
				Save
			</button>
		</div>
	</div>

	<div class="page-builder-main">
		<div class="page-builder-sidebar-left">
			<div class="sidebar-section">
				<h3>Blocks</h3>
				<div id="blocks"></div>
			</div>
		</div>

		<div class="page-builder-canvas">
			<div bind:this={editorContainer}></div>
		</div>

		<div class="page-builder-sidebar-right">
			<div class="sidebar-section">
				<h3>Layers</h3>
				<div id="layers"></div>
			</div>
			<div class="sidebar-section">
				<h3>Styles</h3>
				<div id="styles"></div>
			</div>
			<div class="sidebar-section">
				<h3>Settings</h3>
				<div id="traits"></div>
			</div>
		</div>
	</div>
</div>

<style>
	.page-builder-wrapper {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background: #1a1a1a;
		color: #fff;
	}

	.page-builder-toolbar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 8px 16px;
		background: #2a2a2a;
		border-bottom: 1px solid #3a3a3a;
	}

	.page-builder-toolbar-left,
	.page-builder-toolbar-center,
	.page-builder-toolbar-right {
		display: flex;
		gap: 8px;
	}

	.toolbar-btn {
		padding: 8px 12px;
		background: #3a3a3a;
		border: none;
		border-radius: 4px;
		color: #fff;
		cursor: pointer;
		font-size: 14px;
	}

	.toolbar-btn:hover {
		background: #4a4a4a;
	}

	.save-btn {
		background: #b8860b;
	}

	.save-btn:hover {
		background: #d4a017;
	}

	.page-builder-main {
		display: flex;
		flex: 1;
		overflow: hidden;
	}

	.page-builder-sidebar-left,
	.page-builder-sidebar-right {
		width: 240px;
		background: #2a2a2a;
		overflow-y: auto;
		border-right: 1px solid #3a3a3a;
	}

	.page-builder-sidebar-right {
		border-right: none;
		border-left: 1px solid #3a3a3a;
	}

	.sidebar-section {
		padding: 12px;
		border-bottom: 1px solid #3a3a3a;
	}

	.sidebar-section h3 {
		font-size: 12px;
		font-weight: 600;
		text-transform: uppercase;
		color: #999;
		margin-bottom: 8px;
	}

	.page-builder-canvas {
		flex: 1;
		overflow: hidden;
	}

	/* GrapesJS overrides */
	:global(.gjs-one-bg) {
		background-color: #2a2a2a !important;
	}

	:global(.gjs-two-color) {
		color: #fff !important;
	}

	:global(.gjs-three-bg) {
		background-color: #b8860b !important;
	}

	:global(.gjs-four-color-h:hover) {
		color: #b8860b !important;
	}

	:global(.gjs-block) {
		width: auto;
		min-height: auto;
		padding: 8px 12px;
		margin: 4px;
		border-radius: 4px;
		background: #3a3a3a;
		border: 1px solid #4a4a4a;
	}

	:global(.gjs-block:hover) {
		border-color: #b8860b;
	}

	:global(.gjs-block-label) {
		font-size: 12px;
	}

	:global(.gjs-cv-canvas) {
		background-color: #f5f5f5;
	}

	:global(.gjs-frame-wrapper) {
		padding: 20px;
	}
</style>
