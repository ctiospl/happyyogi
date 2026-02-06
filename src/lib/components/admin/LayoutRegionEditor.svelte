<script lang="ts">
	import type { PageBlock, Template, LayoutRegionName } from '$lib/server/db/schema';
	import PageBlockEditor from './PageBlockEditor.svelte';
	import { Button } from '$lib/components/ui/button';

	interface Props {
		regions: Partial<Record<LayoutRegionName, PageBlock[]>>;
		templates: Template[];
		onchange: (regions: Partial<Record<LayoutRegionName, PageBlock[]>>) => void;
	}

	let { regions, templates, onchange }: Props = $props();

	type TabDef = { key: LayoutRegionName; label: string };

	const tabs: TabDef[] = [
		{ key: 'header', label: 'Header' },
		{ key: 'footer', label: 'Footer' },
		{ key: 'announcement_bar', label: 'Announcement Bar' },
		{ key: 'sidebar', label: 'Sidebar' }
	];

	let activeTab = $state<LayoutRegionName>('header');

	function getRegionBlocks(region: LayoutRegionName): PageBlock[] {
		return regions[region] ?? [];
	}

	function handleRegionChange(region: LayoutRegionName, blocks: PageBlock[]) {
		onchange({ ...regions, [region]: blocks });
	}
</script>

<div class="space-y-4">
	<!-- Region tabs -->
	<div class="flex gap-1 rounded-lg border bg-muted/50 p-1">
		{#each tabs as tab}
			<Button
				variant={activeTab === tab.key ? 'default' : 'ghost'}
				size="sm"
				class="flex-1"
				onclick={() => (activeTab = tab.key)}
			>
				{tab.label}
				{#if getRegionBlocks(tab.key).length > 0}
					<span class="ml-1.5 rounded-full bg-primary-foreground/20 px-1.5 text-xs">
						{getRegionBlocks(tab.key).length}
					</span>
				{/if}
			</Button>
		{/each}
	</div>

	<!-- Region block editor -->
	<div class="min-h-[200px]">
		<PageBlockEditor
			blocks={getRegionBlocks(activeTab)}
			{templates}
			categoryFilter="layout"
			onchange={(blocks) => handleRegionChange(activeTab, blocks)}
		/>
	</div>
</div>
