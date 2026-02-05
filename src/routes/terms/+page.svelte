<script lang="ts">
	import { termsPage } from '$lib/content/pages/terms';
	import { SEOHead } from '$lib/components/seo';

	/**
	 * Simple markdown to HTML converter for legal content
	 */
	function markdownToHtml(md: string): string {
		let html = md
			// Escape HTML entities first
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			// Headers (process in order: h3 before h2 before h1)
			.replace(/^### (.+)$/gm, '<h3>$1</h3>')
			.replace(/^## (.+)$/gm, '<h2>$1</h2>')
			.replace(/^# (.+)$/gm, '<h1>$1</h1>')
			// Bold text
			.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
			// Process list items - wrap in ul
			.replace(/^- (.+)$/gm, '<li>$1</li>');

		// Wrap consecutive li elements in ul
		html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`);

		// Split by double newlines for paragraphs, but preserve block elements
		const blocks = html.split(/\n\n+/);
		html = blocks
			.map((block) => {
				block = block.trim();
				if (!block) return '';
				// Don't wrap block elements
				if (
					block.startsWith('<h') ||
					block.startsWith('<ul') ||
					block.startsWith('<li')
				) {
					return block;
				}
				// Wrap text in paragraphs
				return `<p>${block.replace(/\n/g, '<br>')}</p>`;
			})
			.join('\n');

		return html;
	}

	const htmlContent = markdownToHtml(termsPage.content);
</script>

<SEOHead title={termsPage.seo.title} description={termsPage.seo.description} />

<main class="bg-background py-16 px-4 md:py-24">
	<article class="prose prose-lg mx-auto max-w-3xl text-foreground">
		<div
			class="
				[&>h1]:mb-8
				[&>h1]:text-4xl
				[&>h1]:font-bold
				[&>h1]:tracking-tight
				[&>h1]:text-primary
				[&>h1]:md:text-5xl

				[&>h2]:mb-4
				[&>h2]:mt-10
				[&>h2]:text-2xl
				[&>h2]:font-semibold
				[&>h2]:text-primary

				[&>h3]:mb-3
				[&>h3]:mt-6
				[&>h3]:text-xl
				[&>h3]:font-medium
				[&>h3]:text-primary/90

				[&>p]:mb-4
				[&>p]:leading-relaxed
				[&>p]:text-muted-foreground

				[&>ul]:mb-6
				[&>ul]:ml-6
				[&>ul]:list-disc
				[&>ul]:space-y-2
				[&>ul]:text-muted-foreground

				[&_strong]:font-semibold
				[&_strong]:text-foreground
			"
		>
			{@html htmlContent}
		</div>
	</article>
</main>
