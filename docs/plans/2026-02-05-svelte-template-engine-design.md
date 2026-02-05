# Svelte Template Engine - Phase 1 Design

Replace GrapesJS with a Svelte-native template system. Content editors get form-based editing; developers get a full Svelte REPL.

## Goals

- **UX**: Non-technical users edit content via auto-generated forms
- **DX**: Developers create/modify templates in familiar Svelte syntax
- **Performance**: Server-side compilation, cached renders, fast page loads
- **Extensibility**: Foundation for multi-tenant + marketplace (Phase 2+)

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  Admin UI                                                        │
│  ┌─────────────────────┐  ┌─────────────────────────────────┐  │
│  │ Template Editor     │  │ Page Editor                     │  │
│  │ (Monaco + Preview)  │  │ (Schema-driven forms)           │  │
│  └─────────────────────┘  └─────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Compiler Service (server-side)                                  │
│  - Validates source (security checks)                           │
│  - Compiles Svelte → JS + CSS                                   │
│  - Resolves imports from whitelist                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Storage (PostgreSQL)                                            │
│  - templates: source, compiled output, schema                   │
│  - pages: content JSON, block references                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Runtime Renderer                                                │
│  - Loads compiled templates                                     │
│  - Renders with page content as props                           │
│  - SSR in SvelteKit load functions                              │
└─────────────────────────────────────────────────────────────────┘
```

## Database Schema

```sql
-- Templates (the Svelte source + compiled output)
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'custom',

  -- Source code
  source_code TEXT NOT NULL,

  -- Compiled output (populated on save)
  compiled_js TEXT,
  compiled_css TEXT,
  compile_error TEXT,

  -- Schema defines editable props
  schema JSONB NOT NULL DEFAULT '{"fields": []}',

  -- Sample data for preview
  sample_data JSONB DEFAULT '{}',

  -- Metadata
  is_core BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Pages use templates with content
CREATE TABLE template_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,

  -- Array of blocks: [{ template_id, props }]
  blocks JSONB NOT NULL DEFAULT '[]',

  -- SEO
  meta_title TEXT,
  meta_description TEXT,

  -- Publishing
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX idx_templates_slug ON templates(slug);
CREATE INDEX idx_templates_category ON templates(category);
CREATE INDEX idx_template_pages_slug ON template_pages(slug);
CREATE INDEX idx_template_pages_published ON template_pages(published);
```

## Schema Format

Each template defines its editable fields:

```json
{
  "fields": [
    {
      "key": "headline",
      "type": "text",
      "label": "Headline",
      "required": true,
      "placeholder": "Enter headline..."
    },
    {
      "key": "subheadline",
      "type": "textarea",
      "label": "Subheadline"
    },
    {
      "key": "cta",
      "type": "object",
      "label": "Call to Action",
      "fields": [
        { "key": "text", "type": "text", "label": "Button Text" },
        { "key": "href", "type": "text", "label": "Button Link" }
      ]
    },
    {
      "key": "features",
      "type": "array",
      "label": "Features",
      "itemType": "object",
      "fields": [
        { "key": "title", "type": "text", "label": "Title" },
        { "key": "description", "type": "textarea", "label": "Description" }
      ]
    },
    {
      "key": "backgroundImage",
      "type": "image",
      "label": "Background Image"
    }
  ]
}
```

**Supported field types:**
- `text` - single line input
- `textarea` - multi-line input
- `richtext` - WYSIWYG editor
- `number` - numeric input
- `boolean` - checkbox
- `select` - dropdown with options
- `image` - image picker/uploader
- `object` - nested fields
- `array` - repeatable items

## Compiler Service

Location: `src/lib/server/template-compiler.ts`

```typescript
interface CompileResult {
  success: boolean;
  js?: string;
  css?: string;
  error?: string;
}

interface TemplateCompiler {
  compile(source: string): Promise<CompileResult>;
  validate(source: string): ValidationResult;
}
```

**Security validations:**
1. No forbidden imports (only whitelist allowed)
2. No `eval`, `Function`, `new Function`
3. No `{@html}` with dynamic content (only static allowed)
4. No fetch/XMLHttpRequest
5. No access to `window`, `document` directly (use provided utilities)

**Allowed imports:**
```typescript
const ALLOWED_IMPORTS = [
  // UI Components
  '$lib/components/ui/Button.svelte',
  '$lib/components/ui/Card.svelte',
  '$lib/components/ui/Image.svelte',
  '$lib/components/ui/Icon.svelte',

  // Utilities
  '$lib/utils/cn',
  '$lib/utils/format',

  // Icons
  'lucide-svelte/*'
];
```

## Runtime Renderer

Location: `src/lib/server/template-renderer.ts`

```typescript
interface RenderResult {
  html: string;
  css: string;
}

async function renderTemplate(
  templateId: string,
  props: Record<string, unknown>
): Promise<RenderResult>;

async function renderPage(
  pageSlug: string
): Promise<RenderResult>;
```

**Caching strategy:**
- Cache compiled templates in memory (Map)
- Cache rendered HTML by `pageId:contentHash`
- Invalidate on template save or page content change

## File Structure

```
src/lib/
├── server/
│   ├── template-compiler.ts    # Svelte compilation + validation
│   ├── template-renderer.ts    # Runtime rendering
│   └── template-cache.ts       # In-memory caching
├── components/
│   └── template-engine/
│       ├── TemplateEditor.svelte      # Monaco + preview
│       ├── SchemaEditor.svelte        # Edit template schema
│       ├── PageEditor.svelte          # Form-based content editing
│       ├── BlockPicker.svelte         # Select template to add
│       ├── FieldRenderer.svelte       # Renders schema field as form input
│       └── PreviewFrame.svelte        # Sandboxed preview iframe
└── types/
    └── templates.ts            # TypeScript types
```

## Admin Routes

```
/admin/templates                 # List all templates
/admin/templates/new             # Create new template
/admin/templates/[id]            # Edit template (REPL)

/admin/pages                     # List all pages
/admin/pages/new                 # Create new page
/admin/pages/[id]                # Edit page content
/admin/pages/[id]/preview        # Full preview
```

## Migration from GrapesJS

1. Convert existing block types to Svelte templates
2. Extract schemas from TypeScript types
3. Migrate page content JSON (minimal changes needed)
4. Remove GrapesJS dependencies

**Mapping:**
| GrapesJS Block | New Template |
|----------------|--------------|
| `hero-section` | `hero.svelte` |
| `services-grid-section` | `services-grid.svelte` |
| `about-snippet-section` | `about-snippet.svelte` |
| `testimonial-carousel-section` | `testimonials.svelte` |
| `cta-banner-section` | `cta-banner.svelte` |
| `instructor-grid-section` | `instructor-grid.svelte` |
| `values-grid-section` | `values-grid.svelte` |
| `story-section` | `story.svelte` |

## Implementation Steps

### Step 1: Database & Types
- [ ] Create migration for templates and template_pages tables
- [ ] Define TypeScript types for templates, schemas, pages
- [ ] Create Drizzle schema (if using Drizzle) or Prisma schema

### Step 2: Compiler Service
- [ ] Set up svelte/compiler integration
- [ ] Implement import whitelist resolver
- [ ] Implement security validation (AST scanning)
- [ ] Add compile-on-save logic
- [ ] Write tests for compiler

### Step 3: Template Editor UI
- [ ] Integrate Monaco editor with Svelte syntax
- [ ] Build preview iframe with hot reload
- [ ] Create schema editor component
- [ ] Add sample data editor
- [ ] Implement save flow (validate → compile → store)

### Step 4: Page Editor UI
- [ ] Build FieldRenderer for each schema field type
- [ ] Create PageEditor with dynamic form generation
- [ ] Add block picker (choose template to add)
- [ ] Implement drag-to-reorder blocks
- [ ] Add live preview panel

### Step 5: Runtime Renderer
- [ ] Implement template loading from DB
- [ ] Build renderer that instantiates compiled templates
- [ ] Add caching layer
- [ ] Create public page route that renders pages

### Step 6: Core Templates
- [ ] Convert Hero block to hero.svelte + schema
- [ ] Convert Services Grid block
- [ ] Convert About Snippet block
- [ ] Convert Testimonials block
- [ ] Convert CTA Banner block
- [ ] Convert remaining blocks

### Step 7: Migration & Cleanup
- [ ] Migrate existing page content to new system
- [ ] Remove GrapesJS dependencies
- [ ] Update admin navigation

## Open Questions

1. **Monaco loading** - Bundle or CDN? (CDN recommended for bundle size)
2. **Image uploads** - Reuse existing asset system or build new?
3. **Revision history** - Track template/page versions now or later?
4. **Preview domain** - Same domain or separate preview subdomain?

## Future (Phase 2+)

- Multi-tenant isolation
- Marketplace: publish, install, fork
- Template versioning
- Usage analytics
- Paid templates / revenue share
