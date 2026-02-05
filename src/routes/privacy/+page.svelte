<script lang="ts">
	import { privacyPage } from '$lib/content/pages/privacy';
	import { SEOHead } from '$lib/components/seo';

	function markdownToHtml(md: string): string {
		let html = md
			// Remove the h1 title (we'll display it separately)
			.replace(/^# .+\n\n/, '')
			// Convert ### headings
			.replace(/^### (.+)$/gm, '<h3 class="mt-6 mb-3 text-lg font-semibold text-primary">$1</h3>')
			// Convert ## headings
			.replace(/^## (.+)$/gm, '<h2 class="mt-8 mb-4 text-xl font-bold text-primary">$1</h2>')
			// Convert **bold** text
			.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
			// Convert unordered lists - collect consecutive list items
			.replace(/^- (.+)$/gm, '<li class="ml-4">$1</li>')
			// Wrap consecutive li elements in ul
			.replace(/(<li[^>]*>.*<\/li>\n?)+/g, (match) => `<ul class="my-4 list-disc space-y-2 pl-6 text-muted-foreground">${match}</ul>`)
			// Convert paragraphs (non-empty lines that aren't already HTML)
			.split('\n\n')
			.map((block) => {
				block = block.trim();
				if (!block) return '';
				if (block.startsWith('<')) return block;
				return `<p class="my-4 text-muted-foreground leading-relaxed">${block}</p>`;
			})
			.join('\n');

		return html;
	}

	const htmlContent = markdownToHtml(privacyPage.content);
</script>

<SEOHead title={privacyPage.seo.title} description={privacyPage.seo.description} />

<main class="bg-background py-16 px-4">
	<article class="mx-auto max-w-3xl">
		<header class="mb-12 text-center">
			<h1 class="text-4xl font-bold text-primary mb-4">{privacyPage.title}</h1>
			<div class="h-1 w-24 bg-primary/30 mx-auto rounded-full"></div>
		</header>

		<div class="prose prose-lg text-foreground">
			{@html htmlContent}
		</div>
	</article>
</main>
