# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run check        # Type-check Svelte/TS
npm run test         # Run all tests once
npm run test:unit    # Run tests in watch mode
npm run lint         # Check formatting
npm run format       # Fix formatting
```

## Svelte MCP Tools

Use the Svelte MCP server for documentation:

1. **list-sections** — Call FIRST to discover docs. Returns titles, use_cases, paths.
2. **get-documentation** — Fetch ALL relevant sections based on use_cases.
3. **svelte-autofixer** — MUST use on all Svelte code. Keep calling until no issues.
4. **playground-link** — Only after user confirms, never for files written to project.

## SvelteKit Data Patterns

**ALWAYS prefer remote functions over traditional patterns:**

1. **Data fetching**: Use `query()` from `.remote.ts`, NOT `+page.server.ts` load functions
2. **Form submissions**: Use `form()` from `.remote.ts`, NOT form actions
3. **Mutations**: Use `command()` for non-form mutations, NOT API routes

```ts
// ✅ src/routes/blog/data.remote.ts
import { query, form, command } from '$app/server';
import * as v from 'valibot';

export const getPosts = query(async () => { /* db query */ });
export const createPost = form(v.object({...}), async (data) => { /* insert */ });
export const deletePost = command(v.string(), async (id) => { /* delete */ });
```

```svelte
<!-- ✅ Component usage with await -->
{#each await getPosts() as post}...{/each}
<form {...createPost}>...</form>
```

Use `<svelte:boundary>` for loading/error states. Use `.refresh()` or `.set()` for single-flight mutations.

## Architecture

### Component Libraries (`src/lib/components/`)

- **ui/** — shadcn-svelte components (button, dialog, card, etc.) using bits-ui + tailwind-variants
- **ai-elements/** — AI chat UI components (message, reasoning, tool, workflow, sources, etc.)
- **prompt-kit/** — Chat container primitives (markdown, loader, message)
- **prompt-kit-primitives/** — Lower-level prompt components

### Component Patterns

- All components use Svelte 5 runes (`$props`, `$state`, `$derived`, `$bindable`)
- Use `tailwind-variants` (`tv()`) for variant styling, `cn()` for class merging
- Export types alongside components: `type ButtonProps`, `type ButtonVariant`
- Components accept `ref` via `$bindable(null)` for element references

```svelte
<script lang="ts" module>
  export const variants = tv({ base: "...", variants: {...} });
  export type Props = WithElementRef<HTMLButtonAttributes> & {...};
</script>

<script lang="ts">
  let { class: className, variant, ref = $bindable(null), children, ...rest }: Props = $props();
</script>
```

### Key Dependencies

- **AI**: `ai` (Vercel AI SDK) + `@ai-sdk/svelte` + `@openrouter/ai-sdk-provider`
- **Database**: `kysely` (query builder) + `kysely-codegen`
- **Forms**: `formsnap` + `sveltekit-superforms` + `zod`
- **UI**: `bits-ui` + `tailwind-variants` + `@lucide/svelte`
- **i18n**: `@inlang/paraglide-js` (see `src/hooks.server.ts` for middleware)
- **Charts**: `layerchart`
- **Flow diagrams**: `@xyflow/svelte`
- **Markdown**: `marked` + `shiki` + `svelte-streamdown`

### Hooks (`src/lib/hooks/`)

Custom Svelte 5 hooks using `.svelte.ts` extension:
- `is-mobile.svelte.ts` — Device detection
- `use-clipboard.svelte.ts` — Clipboard operations

## Styling (Tailwind CSS 4)

**CRITICAL: Use design tokens, NEVER raw color values.**

```css
/* ❌ NEVER use raw colors */
bg-[#3b82f6]
text-[oklch(0.5_0.2_250)]
style="color: hsl(220, 90%, 56%)"

/* ✅ ALWAYS use semantic tokens */
bg-primary
text-muted-foreground
border-border
```

### Available Tokens

| Token | Usage |
|-------|-------|
| `background` / `foreground` | Page/text base colors |
| `card` / `card-foreground` | Card surfaces |
| `primary` / `primary-foreground` | Primary actions, buttons |
| `secondary` / `secondary-foreground` | Secondary actions |
| `muted` / `muted-foreground` | Subdued elements, placeholders |
| `accent` / `accent-foreground` | Highlights, hover states |
| `destructive` | Destructive actions (delete, error) |
| `border` / `input` / `ring` | Borders, inputs, focus rings |
| `chart-1` through `chart-5` | Data visualization |
| `sidebar-*` | Sidebar-specific variants |

### Theming Architecture

Tokens defined in `src/routes/layout.css`:
- `:root` — Light mode values (oklch format)
- `.dark` — Dark mode values
- `@theme inline` — Maps CSS vars to Tailwind utilities

To change theme: edit CSS variables in `layout.css`, all components update automatically.

### Rules

1. **Colors**: Only use token classes (`bg-primary`, `text-muted-foreground`)
2. **Arbitrary values**: Allowed for spacing/sizing (`w-[calc(100%-2rem)]`), forbidden for colors
3. **Inline styles**: Never use `style="color: ..."` for theming
4. **Dark mode**: Automatic via CSS variables, no `dark:` prefix needed for token colors
5. **New tokens**: Add to both `:root` and `.dark` in `layout.css`, then to `@theme inline`
