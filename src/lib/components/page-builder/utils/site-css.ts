/**
 * Generate site CSS for injection into GrapesJS canvas
 * Includes CSS variables and essential utility classes for 1:1 visual matching
 */

// CSS Variables from layout.css (light mode)
const CSS_VARIABLES = `
:root {
  /* Typography */
  --font-display: 'Fraunces', serif;
  --font-body: 'DM Sans', sans-serif;

  /* Radius */
  --radius: 0.75rem;
  --radius-pill: 9999px;

  /* Shadows */
  --shadow-soft: 0 2px 8px oklch(0.2 0.02 70 / 8%);
  --shadow-lifted: 0 8px 24px oklch(0.2 0.02 70 / 12%);

  /* Background: Warm sand/parchment */
  --background: oklch(0.97 0.01 70);
  --foreground: oklch(0.22 0.02 50);

  /* Cards: Cream white */
  --card: oklch(0.99 0.005 70);
  --card-foreground: oklch(0.22 0.02 50);

  /* Primary: Deep sage green */
  --primary: oklch(0.45 0.08 150);
  --primary-foreground: oklch(0.98 0.005 70);

  /* Secondary: Soft oat */
  --secondary: oklch(0.92 0.03 70);
  --secondary-foreground: oklch(0.30 0.02 50);

  /* Muted: Stone gray */
  --muted: oklch(0.94 0.02 70);
  --muted-foreground: oklch(0.45 0.02 70);

  /* Accent: Terracotta/clay */
  --accent: oklch(0.65 0.12 55);
  --accent-foreground: oklch(0.98 0.005 70);

  /* Borders: Warm taupe */
  --border: oklch(0.88 0.02 70);
  --input: oklch(0.88 0.02 70);
  --ring: oklch(0.45 0.08 150);

  /* Brand tokens */
  --brand-sage: oklch(0.45 0.08 150);
  --brand-forest: oklch(0.35 0.06 150);
  --brand-terracotta: oklch(0.65 0.12 55);
  --brand-sand: oklch(0.92 0.03 70);
  --brand-stone: oklch(0.55 0.02 70);
}
`;

// Essential utility classes used in block placeholders
const UTILITY_CLASSES = `
/* Base styles */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: var(--font-body); background-color: var(--background); color: var(--foreground); line-height: 1.5; }
h1, h2, h3, h4, h5, h6 { font-family: var(--font-display); font-weight: 700; letter-spacing: -0.02em; }

/* Typography */
.font-display { font-family: var(--font-display); }
.font-body { font-family: var(--font-body); }
.font-sans { font-family: var(--font-body); }
.text-foreground { color: var(--foreground); }
.text-muted-foreground { color: var(--muted-foreground); }
.text-primary { color: var(--primary); }
.text-primary-foreground { color: var(--primary-foreground); }

/* Font sizes */
.text-sm { font-size: 0.875rem; line-height: 1.25rem; }
.text-base { font-size: 1rem; line-height: 1.5rem; }
.text-lg { font-size: 1.125rem; line-height: 1.75rem; }
.text-xl { font-size: 1.25rem; line-height: 1.75rem; }
.text-2xl { font-size: 1.5rem; line-height: 2rem; }
.text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
.text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
.text-5xl { font-size: 3rem; line-height: 1.1; }
.text-6xl { font-size: 3.75rem; line-height: 1.1; }

/* Font weights */
.font-normal { font-weight: 400; }
.font-medium { font-weight: 500; }
.font-semibold { font-weight: 600; }
.font-bold { font-weight: 700; }

/* Tracking */
.tracking-tight { letter-spacing: -0.025em; }

/* Leading */
.leading-tight { line-height: 1.25; }
.leading-snug { line-height: 1.375; }
.leading-relaxed { line-height: 1.625; }

/* Text alignment */
.text-center { text-align: center; }
.text-left { text-align: left; }

/* Backgrounds */
.bg-background { background-color: var(--background); }
.bg-card { background-color: var(--card); }
.bg-primary { background-color: var(--primary); }
.bg-secondary { background-color: var(--secondary); }
.bg-secondary\\/30 { background-color: color-mix(in oklch, var(--secondary) 30%, transparent); }
.bg-muted { background-color: var(--muted); }
.bg-accent { background-color: var(--accent); }
.bg-white { background-color: #fff; }

/* Border */
.border { border-width: 1px; border-style: solid; border-color: var(--border); }
.border-2 { border-width: 2px; border-style: solid; }
.border-4 { border-width: 4px; border-style: solid; }
.border-t { border-top-width: 1px; border-top-style: solid; border-top-color: var(--border); }
.rounded { border-radius: 0.25rem; }
.rounded-md { border-radius: 0.375rem; }
.rounded-lg { border-radius: var(--radius); }
.rounded-xl { border-radius: 0.75rem; }
.rounded-2xl { border-radius: 1rem; }
.rounded-full { border-radius: 9999px; }

/* Shadows */
.shadow-sm { box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); }
.shadow { box-shadow: var(--shadow-soft); }
.shadow-md { box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
.shadow-lg { box-shadow: var(--shadow-lifted); }

/* Layout */
.container { width: 100%; max-width: 1200px; margin-left: auto; margin-right: auto; }
.max-w-xl { max-width: 36rem; }
.max-w-2xl { max-width: 42rem; }
.max-w-3xl { max-width: 48rem; }
.max-w-4xl { max-width: 56rem; }
.max-w-6xl { max-width: 72rem; }
.mx-auto { margin-left: auto; margin-right: auto; }

/* Spacing */
.p-4 { padding: 1rem; }
.p-6 { padding: 1.5rem; }
.p-8 { padding: 2rem; }
.px-4 { padding-left: 1rem; padding-right: 1rem; }
.px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
.px-8 { padding-left: 2rem; padding-right: 2rem; }
.py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
.py-4 { padding-top: 1rem; padding-bottom: 1rem; }
.py-8 { padding-top: 2rem; padding-bottom: 2rem; }
.py-12 { padding-top: 3rem; padding-bottom: 3rem; }
.py-16 { padding-top: 4rem; padding-bottom: 4rem; }
.py-20 { padding-top: 5rem; padding-bottom: 5rem; }
.py-24 { padding-top: 6rem; padding-bottom: 6rem; }

.mb-1 { margin-bottom: 0.25rem; }
.mb-2 { margin-bottom: 0.5rem; }
.mb-4 { margin-bottom: 1rem; }
.mb-6 { margin-bottom: 1.5rem; }
.mb-8 { margin-bottom: 2rem; }
.mb-12 { margin-bottom: 3rem; }
.mt-4 { margin-top: 1rem; }
.mt-8 { margin-top: 2rem; }
.pt-4 { padding-top: 1rem; }
.pt-6 { padding-top: 1.5rem; }

/* Flexbox */
.flex { display: flex; }
.flex-col { flex-direction: column; }
.flex-wrap { flex-wrap: wrap; }
.items-center { align-items: center; }
.items-start { align-items: flex-start; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.gap-2 { gap: 0.5rem; }
.gap-3 { gap: 0.75rem; }
.gap-4 { gap: 1rem; }
.gap-6 { gap: 1.5rem; }
.gap-8 { gap: 2rem; }
.gap-12 { gap: 3rem; }
.gap-16 { gap: 4rem; }

/* Grid */
.grid { display: grid; }
.grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
.grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }

/* Position */
.relative { position: relative; }
.absolute { position: absolute; }
.inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
.z-10 { z-index: 10; }

/* Size */
.w-full { width: 100%; }
.w-40 { width: 10rem; }
.h-full { height: 100%; }
.h-40 { height: 10rem; }
.h-96 { height: 24rem; }
.min-h-screen { min-height: 100vh; }
.min-h-\\[500px\\] { min-height: 500px; }
.min-h-\\[90vh\\] { min-height: 90vh; }
.aspect-square { aspect-ratio: 1 / 1; }

/* Object fit */
.object-cover { object-fit: cover; }

/* Overflow */
.overflow-hidden { overflow: hidden; }

/* Display */
.inline-flex { display: inline-flex; }
.inline-block { display: inline-block; }
.block { display: block; }
.hidden { display: none; }

/* Opacity */
.opacity-90 { opacity: 0.9; }
.opacity-80 { opacity: 0.8; }
.opacity-50 { opacity: 0.5; }

/* Buttons - matching the site's Button component */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  border-radius: var(--radius);
  transition: all 0.2s ease;
  cursor: pointer;
  text-decoration: none;
}
.btn:hover { opacity: 0.9; }
.btn-primary {
  background-color: var(--primary);
  color: var(--primary-foreground);
  padding: 0.875rem 1.75rem;
  font-size: 1rem;
}
.btn-lg {
  padding: 1rem 2rem;
  font-size: 1.125rem;
}
.btn-outline {
  background-color: transparent;
  border: 2px solid var(--foreground);
  color: var(--foreground);
  padding: 0.875rem 1.75rem;
}

/* Card styles */
.card {
  background-color: var(--card);
  border-radius: var(--radius);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-soft);
}

/* Quote styles */
blockquote { font-style: italic; }

/* Gradients */
.bg-gradient-to-r { background: linear-gradient(to right, var(--tw-gradient-stops)); }
.bg-gradient-to-br { background: linear-gradient(to bottom right, var(--tw-gradient-stops)); }
.from-background\\/95 { --tw-gradient-from: oklch(0.97 0.01 70 / 95%); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.via-background\\/70 { --tw-gradient-via: oklch(0.97 0.01 70 / 70%); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-via), var(--tw-gradient-to); }
.to-background\\/30 { --tw-gradient-to: oklch(0.97 0.01 70 / 30%); }

/* Icon placeholder */
.icon-placeholder {
  width: 48px;
  height: 48px;
  background: oklch(0.45 0.08 150 / 10%);
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
}

/* Stats badge */
.stats-badge {
  position: absolute;
  bottom: -24px;
  right: -24px;
  background: white;
  padding: 16px 20px;
  border-radius: var(--radius);
  box-shadow: var(--shadow-lifted);
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Section defaults */
section {
  font-family: var(--font-body);
}

/* Responsive grid - simplified */
@media (min-width: 768px) {
  .md\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .md\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .md\\:text-5xl { font-size: 3rem; line-height: 1.1; }
  .md\\:text-xl { font-size: 1.25rem; line-height: 1.75rem; }
}

@media (min-width: 1024px) {
  .lg\\:text-6xl { font-size: 3.75rem; line-height: 1.1; }
}
`;

/**
 * Generate complete site CSS for GrapesJS canvas injection
 */
export function generateSiteCSS(): string {
	return CSS_VARIABLES + UTILITY_CLASSES;
}

/**
 * Inject CSS into GrapesJS canvas iframe
 */
export function injectCanvasCSS(editor: { Canvas: { getDocument: () => Document | null } }, css: string): void {
	const doc = editor.Canvas.getDocument();
	if (!doc) return;

	// Remove existing injected style if present
	const existingStyle = doc.getElementById('site-css-injection');
	if (existingStyle) {
		existingStyle.remove();
	}

	// Create and inject new style element
	const styleEl = doc.createElement('style');
	styleEl.id = 'site-css-injection';
	styleEl.textContent = css;
	doc.head.appendChild(styleEl);
}
