# Asamkhya Setup Script - Phase & Task Breakdown (DRAFT)

## Overview

Transform the starter template into a modular, feature-selectable system via `setup.js`.

**Guiding Principles:**
- Each task = 1 atomic commit
- Each phase = demoable, runnable software
- Tests or validation for every task
- Phases build incrementally

---

## Phase 1: Foundation - Clean Base Template + Setup Script Skeleton

**Goal:** Lean base template with working setup script that does nothing yet (skeleton).

**Demo:** Run `node setup.js`, see prompts, generates empty `.env.example`, template builds.

### Tasks

#### 1.1 Create `features/` directory structure
- Create empty folder structure for all feature modules
- Folders: `database/{postgres18,postgres,mysql,mariadb,sqlite}`, `auth/lucia`, `otp/{sms-messagecentral,email-zeptomail}`, `messaging/whatsapp`, `ai/{full,minimal}`, `graphics/threlte`, `storage/{s3,local}`, `jobs/bullmq`
- **Validation:** `find features -type d | wc -l` shows expected count

#### 1.2 Remove AI components from base template
- Delete `src/lib/components/ai-elements/`
- Delete `src/lib/components/prompt-kit/`
- Delete `src/lib/components/prompt-kit-primitives/`
- Update any barrel exports that reference them
- **Validation:** `pnpm build` passes, grep for `ai-elements` returns 0 results in src/

#### 1.3 Remove AI packages from base package.json
- Remove: `ai`, `@ai-sdk/svelte`, `@openrouter/ai-sdk-provider`, `marked`, `shiki`, `svelte-streamdown`, `@shikijs/langs`, `@shikijs/themes`
- Keep: Core svelte, tailwind, bits-ui, forms, i18n
- **Validation:** `pnpm install && pnpm build` passes

#### 1.4 Remove Kysely from base (will be added by DB feature)
- Remove: `kysely`, `kysely-codegen`
- **Validation:** `pnpm install && pnpm build` passes

#### 1.5 Create setup.js skeleton with prompts
- Install `prompts` as devDependency
- Create `setup.js` with all questions (database, auth, otp, messaging, ai, 3d, storage, jobs)
- Print selections to console, no actual work yet
- **Validation:** Run `node setup.js`, answer all prompts, see summary printed

#### 1.6 Implement package.json modifier utility
- Create `setup/utils/package-modifier.js`
- Functions: `addDependencies(deps)`, `addDevDependencies(deps)`, `removeDependencies(deps)`
- Reads/writes `package.json` safely
- **Test:** Unit test that adds/removes deps from a mock package.json

#### 1.7 Implement file copy utility
- Create `setup/utils/file-copier.js`
- Functions: `copyFeatureFiles(featurePath, destPath)`, `copyWithReplacements(src, dest, replacements)`
- Handles directory recursion, template variables
- **Test:** Unit test copying mock feature folder

#### 1.8 Implement .env.example generator utility
- Create `setup/utils/env-generator.js`
- Functions: `addEnvVars(vars)`, `generateEnvExample()`
- Accumulates env vars from features, writes `.env.example`
- **Test:** Unit test generating env file from mock vars

#### 1.9 Wire setup.js to utilities (no features yet)
- Connect prompts to utilities
- After prompts: generate `.env.example` (empty), print "Setup complete"
- **Validation:** Run setup, check `.env.example` created

#### 1.10 Add setup script documentation
- Update README.md with setup instructions
- Document each feature option briefly
- **Validation:** README contains setup section

---

## Phase 2: Database Feature Modules

**Goal:** Database selection works end-to-end. User can select DB, files are copied, deps installed, migrations run.

**Demo:** Select PostgreSQL, run setup, see `src/lib/server/db/` created, `pnpm build` passes.

### Tasks

#### 2.1 Create base database module structure
- Create `features/database/_shared/` with common types and migration runner
- `types.ts` - Kysely DB type placeholder
- `migrate.ts` - Generic migration runner
- **Validation:** Files exist, TypeScript valid

#### 2.2 Implement PostgreSQL 18 feature module
- Create `features/database/postgres18/`
- `index.ts` - Kysely instance with pg dialect, PG18-specific config
- `deps.json` - `{"dependencies": {"pg": "^8.11.0", "kysely": "^0.28.0"}}`
- `env.json` - `{"DATABASE_URL": "postgres://user:pass@localhost:5432/mydb"}`
- Example migration with `MERGE` statement
- **Validation:** Files valid TypeScript, deps.json valid JSON

#### 2.3 Implement PostgreSQL (standard) feature module
- Create `features/database/postgres/`
- Same as 2.2 but without PG18-specific features
- **Validation:** Files valid

#### 2.4 Implement MySQL feature module
- Create `features/database/mysql/`
- `index.ts` - Kysely with mysql2 dialect
- `deps.json` - `{"dependencies": {"mysql2": "^3.6.0", "kysely": "^0.28.0"}}`
- **Validation:** Files valid

#### 2.5 Implement MariaDB feature module
- Create `features/database/mariadb/`
- Same as MySQL with MariaDB-specific connection config
- **Validation:** Files valid

#### 2.6 Implement SQLite feature module
- Create `features/database/sqlite/`
- `index.ts` - Kysely with better-sqlite3 dialect
- `deps.json` - `{"dependencies": {"better-sqlite3": "^9.0.0", "kysely": "^0.28.0"}}`
- `env.json` - `{"DATABASE_PATH": "./data/app.db"}`
- **Validation:** Files valid

#### 2.7 Create database feature installer in setup.js
- Add `setup/features/database.js`
- Reads selected DB, copies files from `features/database/{selection}/`
- Copies to `src/lib/server/db/`
- Adds deps from `deps.json`
- Adds env vars from `env.json`
- **Validation:** Select postgres, run setup, check files copied

#### 2.8 Integration test: PostgreSQL setup flow
- Run setup selecting PostgreSQL
- Verify: files in `src/lib/server/db/`, `package.json` has `pg` and `kysely`
- Run `pnpm install && pnpm build`
- **Validation:** Build passes

#### 2.9 Integration test: SQLite setup flow
- Same as 2.8 but for SQLite
- **Validation:** Build passes with better-sqlite3

#### 2.10 Add "None" database option handling
- When "None" selected, skip database setup entirely
- No files copied, no deps added
- **Validation:** Select None, verify no db folder created

---

## Phase 3: Auth + OTP Features

**Goal:** Lucia auth works with selected database. OTP channels (SMS/Email) work standalone.

**Demo:** Select Lucia + SMS OTP, run setup, auth files created, can import and use.

### Tasks

#### 3.1 Create Lucia auth feature module
- Create `features/auth/lucia/`
- `index.ts` - Lucia instance factory (generic, works with any Kysely DB)
- `session.ts` - Session validation helpers
- `middleware.ts` - SvelteKit hooks integration
- `migrations/001_auth_tables.sql` - User and session tables
- `deps.json` - `{"dependencies": {"lucia": "^3.0.0", "@lucia-auth/adapter-postgresql": "^3.0.0"}}`
- **Validation:** Files valid TypeScript

#### 3.2 Create Lucia adapter selection logic
- `features/auth/lucia/adapters.json` - Maps DB type to adapter package
- PostgreSQL → `@lucia-auth/adapter-postgresql`
- MySQL → `@lucia-auth/adapter-mysql`
- SQLite → `@lucia-auth/adapter-sqlite`
- **Validation:** JSON valid, all DBs covered

#### 3.3 Implement auth feature installer
- Add `setup/features/auth.js`
- Copies Lucia files to `src/lib/server/auth/`
- Selects correct adapter based on chosen DB
- Adds adapter dep to package.json
- **Validation:** Select auth + postgres, verify adapter added

#### 3.4 Create SMS OTP (Message Central) feature module
- Create `features/otp/sms-messagecentral/`
- `sms.ts` - MessageCentralClient class (from rxsha reference)
- `env.json` - `MESSAGE_CENTRAL_CUSTOMER_ID`, `MESSAGE_CENTRAL_API_KEY`
- Dev-mode console fallback included
- **Validation:** TypeScript valid

#### 3.5 Create Email OTP (ZeptoMail) feature module
- Create `features/otp/email-zeptomail/`
- `email.ts` - sendEmail, sendOtpEmail functions (from rxsha reference)
- `env.json` - `ZOHO_SEND_MAIL_TOKEN`, `FROM_EMAIL`, `FROM_NAME`
- Dev-mode console fallback included
- **Validation:** TypeScript valid

#### 3.6 Implement OTP feature installer
- Add `setup/features/otp.js`
- Handles multi-select (SMS, Email, Both)
- Copies selected files to `src/lib/server/`
- **Validation:** Select both, verify both files created

#### 3.7 Integration test: Auth + DB + OTP flow
- Select: PostgreSQL, Lucia, SMS+Email OTP
- Run setup
- Verify all files created in correct locations
- `pnpm install && pnpm build`
- **Validation:** Build passes, can import auth and otp modules

#### 3.8 Add auth hooks.server.ts integration
- Auth installer should patch `src/hooks.server.ts` to include auth middleware
- Or provide instructions in post-setup output
- **Validation:** hooks.server.ts updated or instructions printed

---

## Phase 4: WhatsApp Messaging Feature

**Goal:** WhatsApp Business API integration available as feature.

**Demo:** Select WhatsApp, run setup, webhook endpoint created, can receive test webhook.

### Tasks

#### 4.1 Create WhatsApp feature module - config
- Create `features/messaging/whatsapp/`
- `config.ts` - WHATSAPP_CONFIG from env vars, graphApiUrl helper
- `env.json` - All 5 WhatsApp env vars
- **Validation:** TypeScript valid

#### 4.2 Create WhatsApp feature module - types
- `types.ts` - Full webhook payload types, message types, type guards
- Copied from rxsha reference (cleaned up)
- **Validation:** TypeScript valid, no app-specific code

#### 4.3 Create WhatsApp feature module - reply
- `reply.ts` - sendTextMessage, sendButtonMessage, sendListMessage
- Remove RXSHA-specific templates, keep generic templates
- Queue integration (optional, checks for Redis)
- **Validation:** TypeScript valid

#### 4.4 Create WhatsApp feature module - media
- `media.ts` - getMediaUrl, downloadMedia, fetchMediaFile
- Generic, no app-specific code
- **Validation:** TypeScript valid

#### 4.5 Create WhatsApp feature module - webhook handler
- `webhook-handler.ts` - Signature verification, payload parsing
- Generic message handlers (logs messages, provides hooks)
- **Validation:** TypeScript valid

#### 4.6 Create WhatsApp webhook route template
- `routes/api/whatsapp/webhook/+server.ts` - GET (verify) + POST (receive)
- Uses webhook-handler.ts
- Skeleton processor (logs and acknowledges)
- **Validation:** TypeScript valid

#### 4.7 Implement WhatsApp feature installer
- Add `setup/features/messaging.js`
- Copies whatsapp files to `src/lib/server/whatsapp/`
- Copies webhook route to `src/routes/api/whatsapp/webhook/`
- **Validation:** Files copied to correct locations

#### 4.8 Integration test: WhatsApp setup flow
- Select WhatsApp
- Run setup
- `pnpm install && pnpm build`
- Start dev server, GET `/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=test&hub.challenge=123`
- **Validation:** Build passes, webhook responds (even if token mismatch)

---

## Phase 5: AI Features

**Goal:** AI SDK available in minimal or full (with components) mode.

**Demo:** Select AI Minimal, can use `useChat` hook. Select AI Full, chat components available.

### Tasks

#### 5.1 Create AI Minimal feature module
- Create `features/ai/minimal/`
- `index.ts` - Provider setup (OpenRouter default, supports OpenAI/Anthropic)
- `deps.json` - `ai`, `@ai-sdk/svelte`, `@openrouter/ai-sdk-provider`
- `env.json` - `OPENROUTER_API_KEY`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`
- **Validation:** TypeScript valid

#### 5.2 Create AI Minimal example endpoint
- `routes/api/chat/+server.ts` - Basic streaming chat endpoint
- Uses provider from ai/index.ts
- **Validation:** TypeScript valid

#### 5.3 Create AI Full feature module
- Create `features/ai/full/`
- Includes everything from minimal
- `deps.json` - Adds `marked`, `shiki`, `svelte-streamdown`, `@shikijs/*`
- **Validation:** TypeScript valid

#### 5.4 Move AI components to features/ai/full
- Move `ai-elements/` to `features/ai/full/components/ai-elements/`
- Move `prompt-kit/` to `features/ai/full/components/prompt-kit/`
- Update imports if needed
- **Validation:** Components valid, no broken imports

#### 5.5 Implement AI feature installer
- Add `setup/features/ai.js`
- Minimal: copies ai/index.ts + example endpoint
- Full: copies ai/index.ts + endpoint + components
- **Validation:** Select each option, verify correct files copied

#### 5.6 Integration test: AI Minimal flow
- Select AI Minimal
- Run setup, `pnpm install && pnpm build`
- **Validation:** Build passes, no component folders

#### 5.7 Integration test: AI Full flow
- Select AI Full
- Run setup, `pnpm install && pnpm build`
- **Validation:** Build passes, ai-elements folder exists

---

## Phase 6: 3D Graphics Feature

**Goal:** Threlte + full ecosystem available as feature.

**Demo:** Select 3D, run setup, can render a basic 3D scene.

### Tasks

#### 6.1 Create Threlte feature module
- Create `features/graphics/threlte/`
- `deps.json` - All threlte packages + three + rapier
- `env.json` - Empty (no env vars needed)
- **Validation:** JSON valid

#### 6.2 Create Threlte starter components
- `components/3d/Scene.svelte` - Basic scene setup with Canvas
- `components/3d/Box.svelte` - Simple mesh example
- `components/3d/OrbitControls.svelte` - Camera controls wrapper
- **Validation:** Svelte components valid

#### 6.3 Create Threlte example route
- `routes/3d-demo/+page.svelte` - Page using Scene component
- Simple rotating box with orbit controls
- **Validation:** Svelte valid

#### 6.4 Implement 3D feature installer
- Add `setup/features/graphics.js`
- Copies components to `src/lib/components/3d/`
- Copies demo route (optional flag)
- **Validation:** Select 3D, verify files copied

#### 6.5 Integration test: Threlte setup flow
- Select Threlte
- Run setup, `pnpm install && pnpm build`
- **Validation:** Build passes

---

## Phase 7: Storage Features

**Goal:** S3 and/or Local storage available as features.

**Demo:** Select S3, can upload/download files. Select Local, files served from disk.

### Tasks

#### 7.1 Create S3 storage feature module
- Create `features/storage/s3/`
- `s3.ts` - S3Client setup, upload, download, getSignedUrl, delete
- `deps.json` - `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`
- `env.json` - S3 env vars
- **Validation:** TypeScript valid

#### 7.2 Create Local storage feature module
- Create `features/storage/local/`
- `local.ts` - fs-based upload, download, delete (same API as S3)
- `routes/files/[...path]/+server.ts` - Serve files
- `env.json` - `STORAGE_PATH`
- **Validation:** TypeScript valid

#### 7.3 Create storage interface type
- `features/storage/_shared/types.ts` - IStorageProvider interface
- Both S3 and Local implement same interface
- **Validation:** TypeScript valid

#### 7.4 Implement storage feature installer
- Add `setup/features/storage.js`
- Handles multi-select (S3, Local, Both)
- Copies files, creates storage index that exports selected providers
- **Validation:** Select both, verify both files created

#### 7.5 Integration test: S3 storage flow
- Select S3
- Run setup, `pnpm install && pnpm build`
- **Validation:** Build passes

#### 7.6 Integration test: Local storage flow
- Select Local
- Run setup, `pnpm install && pnpm build`
- Verify files route created
- **Validation:** Build passes

---

## Phase 8: Background Jobs Feature

**Goal:** BullMQ + Redis available for background processing.

**Demo:** Select BullMQ, can create and process background jobs.

### Tasks

#### 8.1 Create BullMQ feature module
- Create `features/jobs/bullmq/`
- `connection.ts` - Redis connection factory
- `index.ts` - Queue factory, getQueue helper
- `deps.json` - `bullmq`, `ioredis`
- `env.json` - `REDIS_URL`
- **Validation:** TypeScript valid

#### 8.2 Create example worker template
- `workers/example.ts` - Template worker showing job processing
- Clear comments explaining pattern
- **Validation:** TypeScript valid

#### 8.3 Create queue types
- `types.ts` - Generic job data types, worker interface
- **Validation:** TypeScript valid

#### 8.4 Implement jobs feature installer
- Add `setup/features/jobs.js`
- Copies files to `src/lib/server/queues/`
- **Validation:** Select BullMQ, verify files copied

#### 8.5 Integration test: BullMQ setup flow
- Select BullMQ
- Run setup, `pnpm install && pnpm build`
- **Validation:** Build passes

#### 8.6 Document queue-dependent features
- WhatsApp reply.ts checks for Redis
- Document this dependency in setup output
- **Validation:** Instructions printed when BullMQ not selected but WhatsApp is

---

## Phase 9: Integration, Polish & Documentation

**Goal:** Full end-to-end working setup with all combinations tested.

**Demo:** Fresh clone, run setup with any combination, working app.

### Tasks

#### 9.1 Full integration test: Kitchen sink
- Select ALL features: Postgres18, Lucia, SMS+Email, WhatsApp, AI Full, Threlte, S3+Local, BullMQ
- Run setup, `pnpm install && pnpm build`
- **Validation:** Build passes, all files present

#### 9.2 Full integration test: Minimal
- Select NONE for all optional features, just DB
- Run setup, `pnpm install && pnpm build`
- **Validation:** Build passes, minimal footprint

#### 9.3 Implement idempotent setup (re-run safety)
- Setup can be re-run without duplicating deps or files
- Warns if files already exist
- **Validation:** Run setup twice, no errors or duplicates

#### 9.4 Add --yes flag for non-interactive mode
- `node setup.js --yes` uses recommended defaults
- **Validation:** `node setup.js --yes` completes without prompts

#### 9.5 Add feature presets
- `node setup.js --preset=saas` (DB, Auth, Email, Storage)
- `node setup.js --preset=ai-app` (DB, Auth, AI Full)
- `node setup.js --preset=3d` (3D only)
- **Validation:** Each preset works

#### 9.6 Create post-setup checklist printer
- After setup, print:
  - Required env vars to fill
  - Next steps (migrations, etc.)
  - Links to feature docs
- **Validation:** Clear output after setup

#### 9.7 Update README with full documentation
- Setup instructions
- Feature descriptions
- Environment variables reference
- Common combinations
- **Validation:** README complete and accurate

#### 9.8 Update CLAUDE.md with new structure
- Document features/ folder
- Document setup.js patterns
- Update commands section
- **Validation:** CLAUDE.md reflects new architecture

#### 9.9 Create GitHub template configuration
- `.github/ISSUE_TEMPLATE/` - Bug report, feature request
- `CONTRIBUTING.md` - How to add new features
- **Validation:** Files exist

#### 9.10 Final cleanup
- Remove any unused files from base template
- Verify .gitignore covers generated files
- Tag v1.0.0
- **Validation:** Clean repo, ready for use

---

## Dependency Graph

```
Phase 1 (Foundation)
    ↓
Phase 2 (Database) ←──────────────┐
    ↓                             │
Phase 3 (Auth + OTP) ─────────────┤ (Auth needs DB)
    ↓                             │
Phase 4 (WhatsApp) ───────────────┤ (Can use BullMQ)
    ↓                             │
Phase 5 (AI)                      │
    ↓                             │
Phase 6 (3D)                      │
    ↓                             │
Phase 7 (Storage)                 │
    ↓                             │
Phase 8 (Jobs/BullMQ) ────────────┘
    ↓
Phase 9 (Integration)
```

---

## Validation Strategy

Each task has explicit validation. Types:

1. **File existence:** `test -f path/to/file`
2. **TypeScript validity:** `pnpm check` passes
3. **Build passes:** `pnpm build` succeeds
4. **Unit tests:** Jest/Vitest for utilities
5. **Integration tests:** Full setup flow + build
6. **Manual verification:** Dev server + specific endpoint

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Feature conflicts | Each feature isolated in own folder, clear interfaces |
| Broken imports after copy | Post-copy import validation in setup |
| DB adapter mismatch | Explicit adapter mapping in adapters.json |
| Missing env vars | Clear post-setup checklist |
| Re-run corruption | Idempotent setup with existence checks |

