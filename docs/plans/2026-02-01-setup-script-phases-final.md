# Asamkhya Setup Script - Phase & Task Breakdown (FINAL)

## Overview

Transform the starter template into a modular, feature-selectable system via `setup.js`.

**Guiding Principles:**
- Each task = 1 atomic commit
- Each phase = demoable, runnable software
- Tests or validation for every task
- Phases build incrementally

**Key Design Decisions (from review):**
- AI components MOVED to features/ (not deleted) in Phase 1
- Lucia uses `@lucia-auth/adapter-kysely` (single adapter for all DBs)
- All features have explicit "None" handling
- Integration tests are automated shell scripts
- Setup is idempotent with rollback on failure

---

## Phase 1: Foundation - Clean Base Template + Setup Script Skeleton

**Goal:** Lean base template with working setup script skeleton. AI components moved to features folder.

**Demo:** Run `node setup.js`, see prompts, template builds without AI/DB packages.

### Tasks

#### 1.1 Create `features/` directory structure
- Create folder hierarchy for all feature modules:
  ```
  features/
  ├── database/{postgres18,postgres,mysql,mariadb,sqlite,_shared}
  ├── auth/lucia
  ├── otp/{sms-messagecentral,email-zeptomail}
  ├── messaging/whatsapp
  ├── ai/{full,minimal}
  ├── graphics/threlte
  ├── storage/{s3,local,_shared}
  └── jobs/bullmq
  ```
- **Validation:** `find features -type d | wc -l` equals 17

#### 1.2a Move AI components - ai-elements
- Move `src/lib/components/ai-elements/` → `features/ai/full/components/ai-elements/`
- **Validation:** `test -d features/ai/full/components/ai-elements`

#### 1.2b Move AI components - prompt-kit
- Move `src/lib/components/prompt-kit/` → `features/ai/full/components/prompt-kit/`
- **Validation:** `test -d features/ai/full/components/prompt-kit`

#### 1.2c Move AI components - prompt-kit-primitives
- Move `src/lib/components/prompt-kit-primitives/` → `features/ai/full/components/prompt-kit-primitives/`
- **Validation:** `test -d features/ai/full/components/prompt-kit-primitives`

#### 1.2d Verify no broken AI imports in base
- Run `grep -r "ai-elements\|prompt-kit" src/` - should return empty
- Run `pnpm check` - should pass
- **Validation:** Both commands succeed

#### 1.3 Remove AI + DB packages from base package.json
- Remove from dependencies: `ai`, `@ai-sdk/svelte`, `@openrouter/ai-sdk-provider`, `marked`, `shiki`, `svelte-streamdown`, `@shikijs/langs`, `@shikijs/themes`, `kysely`, `kysely-codegen`
- **Validation:** `pnpm install && pnpm build` passes

#### 1.4 Create setup script test infrastructure
- Add `vitest` config for Node.js (setup/ folder)
- Create `setup/__tests__/` directory
- Add test script to package.json: `"test:setup": "vitest run setup/"`
- **Validation:** `pnpm test:setup` runs (0 tests)

#### 1.5 Install @clack/prompts and create setup.js skeleton
- Add `@clack/prompts` as devDependency
- Create `setup.js` with all questions (database, auth, otp, messaging, ai, 3d, storage, jobs)
- Print selections to console only, no actual work
- **Validation:** Run `node setup.js`, answer all prompts, see summary

#### 1.6 Implement package.json modifier utility
- Create `setup/utils/package-modifier.js`
- Functions: `addDependencies(deps)`, `addDevDependencies(deps)`, `removeDependencies(deps)`, `readPackageJson()`, `writePackageJson()`
- Safe read/write with backup
- **Test:** `setup/__tests__/package-modifier.test.js` - add/remove deps from mock

#### 1.7 Implement file copy utility
- Create `setup/utils/file-copier.js`
- Functions: `copyFeatureFiles(featurePath, destPath)`, `copyWithReplacements(src, dest, replacements)`, `ensureDir(path)`
- Handles directory recursion, template variables, existence checks
- **Test:** `setup/__tests__/file-copier.test.js` - copy mock feature folder

#### 1.8 Implement .env.example generator utility
- Create `setup/utils/env-generator.js`
- Functions: `addEnvVars(vars)`, `generateEnvExample()`, `reset()`
- Accumulates env vars from features, writes `.env.example` with comments
- **Test:** `setup/__tests__/env-generator.test.js`

#### 1.9 Create setup orchestrator with staging/rollback
- Create `setup/orchestrator.js`
- Implements: staging area for changes, commit on success, rollback on failure
- Functions: `stage(files)`, `commit()`, `rollback()`
- **Test:** `setup/__tests__/orchestrator.test.js` - rollback scenario

#### 1.10 Wire setup.js to orchestrator (skeleton)
- Connect prompts → orchestrator
- After prompts: generate empty `.env.example`, print "Setup complete"
- **Validation:** Run setup, check `.env.example` created, re-run is idempotent

#### 1.11 Add setup script documentation to README
- Quick start: `npx degit user/asamkhya-starter-template my-app && cd my-app && node setup.js`
- Document each feature option briefly
- **Validation:** README contains setup section

---

## Phase 2: Database Feature Modules

**Goal:** Database selection works end-to-end. User can select DB, files are copied, deps installed.

**Demo:** Select PostgreSQL, run setup, see `src/lib/server/db/` created, `pnpm build` passes.

### Tasks

#### 2.1 Create shared database types
- Create `features/database/_shared/types.ts`
- Generic Kysely DB type placeholder with extension pattern
- **Validation:** TypeScript valid

#### 2.2 Implement PostgreSQL 18 feature module
- Create `features/database/postgres18/`
- Files:
  - `index.ts` - Kysely instance with pg dialect, PG18 config (idle_in_transaction_session_timeout)
  - `deps.json` - `{"dependencies": {"pg": "^8.13.0", "kysely": "^0.28.0"}, "devDependencies": {"kysely-codegen": "^0.19.0", "@types/pg": "^8.11.0"}}`
  - `env.json` - `{"DATABASE_URL": {"description": "PostgreSQL connection string", "example": "postgres://user:pass@localhost:5432/mydb"}}`
  - `migrations/001_example.sql` - Example migration with MERGE statement
- **Validation:** Files exist, TypeScript valid, JSON valid

#### 2.3 Implement PostgreSQL (standard) feature module
- Create `features/database/postgres/`
- Same structure as 2.2 without PG18-specific features
- **Validation:** Files valid

#### 2.4 Implement MySQL feature module
- Create `features/database/mysql/`
- `index.ts` - Kysely with mysql2 dialect
- `deps.json` - `{"dependencies": {"mysql2": "^3.11.0", "kysely": "^0.28.0"}, "devDependencies": {"kysely-codegen": "^0.19.0"}}`
- `env.json` - MySQL connection vars
- **Validation:** Files valid

#### 2.5 Implement MariaDB feature module
- Create `features/database/mariadb/`
- Same as MySQL with MariaDB-specific connection config comments
- **Validation:** Files valid

#### 2.6 Implement SQLite feature module
- Create `features/database/sqlite/`
- `index.ts` - Kysely with better-sqlite3 dialect
- `deps.json` - `{"dependencies": {"better-sqlite3": "^11.0.0", "kysely": "^0.28.0"}, "devDependencies": {"kysely-codegen": "^0.19.0", "@types/better-sqlite3": "^7.6.0"}}`
- `env.json` - `{"DATABASE_PATH": {"description": "SQLite database file path", "example": "./data/app.db"}}`
- **Validation:** Files valid

#### 2.7a Create database feature installer - file copy logic
- Create `setup/features/database.js`
- Function: `copyDatabaseFiles(dbType)` - copies from `features/database/{type}/` to `src/lib/server/db/`
- **Test:** Unit test with mock filesystem

#### 2.7b Create database feature installer - deps logic
- Add to `setup/features/database.js`
- Function: `getDatabaseDeps(dbType)` - reads and returns deps.json
- **Test:** Unit test reading each DB type

#### 2.7c Create database feature installer - env logic
- Add to `setup/features/database.js`
- Function: `getDatabaseEnvVars(dbType)` - reads and returns env.json
- **Test:** Unit test reading each DB type

#### 2.7d Wire database installer to setup.js
- Import database.js in setup.js
- Call installer based on selection
- Handle "None" option - skip database setup entirely
- **Validation:** Manual test - select postgres, verify files copied

#### 2.8 Create automated integration test for database setup
- Create `setup/__tests__/integration/database.test.js`
- Tests all DB types in parallel using isolated temp directories
- Verifies: files exist, deps in package.json, `pnpm install && pnpm check` passes
- **Validation:** `pnpm test:setup` includes database tests

#### 2.9 Add database connection test utility (optional post-setup)
- Create `features/database/_shared/test-connection.ts`
- Tries to connect using DATABASE_URL, prints success/failure
- Documented in post-setup instructions
- **Validation:** Script exists, TypeScript valid

---

## Phase 3: Auth + OTP Features

**Goal:** Lucia auth works with any selected database. OTP channels work standalone.

**Demo:** Select Lucia + SMS OTP + Email OTP, run setup, auth files created, build passes.

### Tasks

#### 3.1 Create Lucia auth feature module
- Create `features/auth/lucia/`
- Files:
  - `index.ts` - Lucia instance factory using Kysely adapter
  - `session.ts` - Session validation helpers (validateSession, invalidateSession)
  - `middleware.ts` - SvelteKit handle function for auth
  - `deps.json` - `{"dependencies": {"lucia": "^3.2.0", "@lucia-auth/adapter-kysely": "^3.0.0"}}`
  - `env.json` - (empty, no env vars needed)
  - `migrations/001_auth_tables.sql` - User and session tables (DB-agnostic SQL)
- **Validation:** Files valid TypeScript

#### 3.2 Create hooks.server.ts patch template
- Create `features/auth/lucia/hooks.patch.ts`
- Template showing how to compose with existing handles using `sequence()`
- Include comments explaining the pattern
- **Validation:** File exists, valid TypeScript

#### 3.3 Implement auth feature installer
- Create `setup/features/auth.js`
- Copies Lucia files to `src/lib/server/auth/`
- Prints instructions for hooks.server.ts integration (don't auto-patch)
- Handles "None" option - skip entirely
- **Test:** Unit test file copy logic

#### 3.4 Create SMS OTP (Message Central) feature module
- Create `features/otp/sms-messagecentral/`
- `sms.ts` - MessageCentralClient class (from rxsha, cleaned)
- `env.json` - `MESSAGE_CENTRAL_CUSTOMER_ID`, `MESSAGE_CENTRAL_API_KEY`
- Dev-mode console fallback included
- **Validation:** TypeScript valid

#### 3.5 Create Email OTP (ZeptoMail) feature module
- Create `features/otp/email-zeptomail/`
- `email.ts` - sendEmail, sendOtpEmail functions (from rxsha, cleaned)
- `env.json` - `ZOHO_SEND_MAIL_TOKEN`, `FROM_EMAIL`, `FROM_NAME`
- Dev-mode console fallback included
- **Validation:** TypeScript valid

#### 3.6 Implement OTP feature installer
- Create `setup/features/otp.js`
- Handles multi-select (SMS, Email, Both, None)
- Copies selected files to `src/lib/server/`
- Handles "None" option - skip entirely
- **Test:** Unit test for each selection combination

#### 3.7 Create automated integration test for auth + OTP
- Create `setup/__tests__/integration/auth-otp.test.js`
- Test combinations: DB + Auth, DB + Auth + SMS, DB + Auth + Email, DB + Auth + Both
- Verifies: files exist, deps correct, build passes
- **Validation:** Tests pass

#### 3.8 Document auth integration in post-setup output
- After auth selection, print:
  - How to update hooks.server.ts with sequence()
  - Link to Lucia docs
  - Migration instructions
- **Validation:** Instructions printed when auth selected

---

## Phase 4: WhatsApp Messaging Feature

**Goal:** WhatsApp Business API integration available as feature.

**Demo:** Select WhatsApp, run setup, webhook endpoint responds to verification.

### Tasks

#### 4.1 Create WhatsApp config module
- Create `features/messaging/whatsapp/config.ts`
- WHATSAPP_CONFIG from env vars, graphApiUrl helper, validateConfig
- **Validation:** TypeScript valid

#### 4.2 Create WhatsApp types module
- Create `features/messaging/whatsapp/types.ts`
- Full webhook payload types, message types, type guards (from rxsha, cleaned)
- Remove app-specific types
- **Validation:** TypeScript valid

#### 4.3 Create WhatsApp reply module
- Create `features/messaging/whatsapp/reply.ts`
- sendTextMessage, sendButtonMessage, sendListMessage
- Generic templates only (success, error, welcome)
- Queue integration (optional - checks for REDIS_URL)
- **Validation:** TypeScript valid

#### 4.4 Create WhatsApp media module
- Create `features/messaging/whatsapp/media.ts`
- getMediaUrl, downloadMedia, fetchMediaFile
- Generic, no app-specific code
- **Validation:** TypeScript valid

#### 4.5 Create WhatsApp rate limiter module
- Create `features/messaging/whatsapp/rate-limiter.ts`
- Simple in-memory rate limiter (from rxsha, cleaned)
- **Validation:** TypeScript valid

#### 4.6 Create WhatsApp env.json
- Create `features/messaging/whatsapp/env.json`
- All 5 env vars with descriptions
- **Validation:** JSON valid

#### 4.7 Create WhatsApp webhook route template
- Create `features/messaging/whatsapp/routes/api/whatsapp/webhook/+server.ts`
- GET (verify) + POST (receive) handlers
- Signature verification, basic logging
- Skeleton processor that acknowledges messages
- **Validation:** TypeScript valid

#### 4.8 Implement WhatsApp feature installer
- Create `setup/features/messaging.js`
- Copies whatsapp files to `src/lib/server/whatsapp/`
- Copies webhook route to `src/routes/api/whatsapp/webhook/`
- Handles "None" option
- **Test:** Unit test file copy logic

#### 4.9 Create automated integration test for WhatsApp
- Create `setup/__tests__/integration/whatsapp.test.js`
- Verify: files exist, build passes
- Start dev server, test webhook verification endpoint with mock token
- **Validation:** Test passes

#### 4.10 Document BullMQ recommendation for WhatsApp
- In post-setup output, if WhatsApp selected without BullMQ:
- Print: "WhatsApp works without BullMQ but message delivery is more reliable with it"
- **Validation:** Warning printed in correct scenario

---

## Phase 5: AI Features

**Goal:** AI SDK available in minimal or full (with components) mode.

**Demo:** Select AI Minimal, `/api/chat` endpoint works. Select AI Full, components available.

### Tasks

#### 5.1 Create AI Minimal feature module
- Create `features/ai/minimal/`
- Files:
  - `index.ts` - Provider setup (OpenRouter default, supports OpenAI/Anthropic)
  - `deps.json` - `ai`, `@ai-sdk/svelte`, `@openrouter/ai-sdk-provider`
  - `env.json` - `OPENROUTER_API_KEY`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`
- **Validation:** TypeScript valid

#### 5.2 Create AI Minimal example endpoint
- Create `features/ai/minimal/routes/api/chat/+server.ts`
- Basic streaming chat endpoint using provider
- **Validation:** TypeScript valid

#### 5.3 Create AI Full deps.json
- Create `features/ai/full/deps.json`
- Everything from minimal plus: `marked`, `shiki`, `svelte-streamdown`, `@shikijs/langs`, `@shikijs/themes`
- **Validation:** JSON valid

#### 5.4 Verify AI Full components (moved in Phase 1)
- Verify `features/ai/full/components/` contains ai-elements, prompt-kit, prompt-kit-primitives
- Run TypeScript check on components
- **Validation:** `pnpm check` passes on features/ai/full/

#### 5.5 Implement AI feature installer
- Create `setup/features/ai.js`
- Minimal: copies ai/minimal/* to src/lib/server/ai/ and routes
- Full: copies minimal + components to src/lib/components/
- Handles "None" option
- **Test:** Unit test for each mode

#### 5.6 Create automated integration test for AI
- Create `setup/__tests__/integration/ai.test.js`
- Test minimal and full modes
- Verify: correct files exist, correct deps, build passes
- **Validation:** Tests pass

---

## Phase 6: 3D Graphics Feature

**Goal:** Threlte + full ecosystem available as feature.

**Demo:** Select 3D, run setup, can render basic scene in browser.

### Tasks

#### 6.1 Create Threlte deps.json
- Create `features/graphics/threlte/deps.json`
- Explicit deps:
  ```json
  {
    "dependencies": {
      "three": "^0.170.0",
      "@threlte/core": "^8.0.0",
      "@threlte/extras": "^9.0.0",
      "@threlte/rapier": "^3.0.0",
      "@dimforge/rapier3d-compat": "^0.14.0"
    },
    "devDependencies": {
      "@types/three": "^0.170.0"
    }
  }
  ```
- **Validation:** JSON valid

#### 6.2 Create Threlte starter components
- Create `features/graphics/threlte/components/3d/`
- `Scene.svelte` - Basic Canvas setup
- `Box.svelte` - Simple mesh example
- **Validation:** Svelte components valid

#### 6.3 Create Threlte example route (optional)
- Create `features/graphics/threlte/routes/3d-demo/+page.svelte`
- Page using Scene component with rotating box
- **Validation:** Svelte valid

#### 6.4 Create Threlte env.json (empty)
- Create `features/graphics/threlte/env.json`
- Empty object (no env vars needed)
- **Validation:** JSON valid

#### 6.5 Implement 3D feature installer
- Create `setup/features/graphics.js`
- Copies components to `src/lib/components/3d/`
- Optionally copies demo route
- Handles "None" option
- **Test:** Unit test file copy

#### 6.6 Create automated integration test for Threlte
- Create `setup/__tests__/integration/threlte.test.js`
- Verify: files exist, deps correct, build passes
- **Validation:** Test passes

---

## Phase 7: Storage Features

**Goal:** S3 and/or Local storage available as features.

**Demo:** Select S3, storage utility available. Select Local, files served from disk.

### Tasks

#### 7.1 Create storage interface type
- Create `features/storage/_shared/types.ts`
- `IStorageProvider` interface: `upload()`, `download()`, `delete()`, `getUrl()`
- **Validation:** TypeScript valid

#### 7.2 Create S3 storage feature module
- Create `features/storage/s3/`
- `s3.ts` - S3Client setup implementing IStorageProvider
- `deps.json` - `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`
- `env.json` - S3_ENDPOINT, S3_BUCKET, S3_REGION, S3_ACCESS_KEY, S3_SECRET_KEY
- **Validation:** TypeScript valid

#### 7.3 Create Local storage feature module
- Create `features/storage/local/`
- `local.ts` - fs-based storage implementing IStorageProvider
- `routes/files/[...path]/+server.ts` - Serve files
- `env.json` - STORAGE_PATH
- **Validation:** TypeScript valid

#### 7.4 Implement storage feature installer
- Create `setup/features/storage.js`
- Handles multi-select (S3, Local, Both, None)
- Creates storage/index.ts that exports selected providers
- **Test:** Unit test for each combination

#### 7.5 Create automated integration test for storage
- Create `setup/__tests__/integration/storage.test.js`
- Test all combinations
- Verify: files exist, deps correct, build passes
- **Validation:** Tests pass

---

## Phase 8: Background Jobs Feature

**Goal:** BullMQ + Redis available for background processing.

**Demo:** Select BullMQ, can create queue in code, build passes.

### Tasks

#### 8.1 Create BullMQ feature module
- Create `features/jobs/bullmq/`
- Files:
  - `connection.ts` - Redis connection factory with lazy init
  - `index.ts` - Queue factory, getQueue helper
  - `types.ts` - Generic job types
  - `deps.json` - `bullmq`, `ioredis`
  - `env.json` - REDIS_URL
- **Validation:** TypeScript valid

#### 8.2 Create example worker template
- Create `features/jobs/bullmq/workers/example.ts`
- Template worker with clear comments
- **Validation:** TypeScript valid

#### 8.3 Implement jobs feature installer
- Create `setup/features/jobs.js`
- Copies files to `src/lib/server/queues/`
- Handles "None" option
- **Test:** Unit test file copy

#### 8.4 Create automated integration test for BullMQ
- Create `setup/__tests__/integration/bullmq.test.js`
- Verify: files exist, deps correct, build passes
- **Validation:** Test passes

---

## Phase 9: Integration, Polish & Documentation

**Goal:** Full end-to-end working setup with all combinations tested.

**Demo:** Fresh clone, run setup with any combination, working app.

### Tasks

#### 9.1 Full integration test: Kitchen sink
- Create `setup/__tests__/integration/full.test.js`
- Select ALL features: Postgres18, Lucia, SMS+Email, WhatsApp, AI Full, Threlte, S3+Local, BullMQ
- Verify: all files present, all deps, build passes
- **Validation:** Test passes

#### 9.2 Full integration test: Minimal
- Add to full.test.js
- Select: SQLite only, no other features
- Verify: minimal footprint, build passes
- **Validation:** Test passes

#### 9.3 Verify idempotent setup
- Add to full.test.js
- Run setup twice with same options
- Verify: no errors, no duplicate deps, files not corrupted
- **Validation:** Test passes

#### 9.4 Implement --yes flag for non-interactive mode
- Add `--yes` CLI flag to setup.js
- Uses recommended defaults: Postgres18, Lucia, Email OTP, AI Minimal
- Prints chosen defaults before proceeding
- **Validation:** `node setup.js --yes` completes without prompts

#### 9.5 Implement feature presets
- Add `--preset` CLI flag
- Presets:
  - `saas`: Postgres18, Lucia, Email, S3, BullMQ
  - `ai-app`: Postgres18, Lucia, AI Full, BullMQ
  - `3d`: Threlte only
  - `minimal`: SQLite only
- **Validation:** Each preset works

#### 9.6 Implement --clean flag
- Add `--clean` CLI flag
- Removes all feature files from src/lib/server/, resets package.json to base
- Requires confirmation
- **Validation:** `node setup.js --clean` resets to base state

#### 9.7 Create post-setup checklist printer
- After setup, print:
  - Required env vars to fill
  - Migration instructions (if DB selected)
  - hooks.server.ts instructions (if auth selected)
  - Links to feature docs
- **Validation:** Clear output after each setup scenario

#### 9.8 Update README with full documentation
- Setup instructions with examples
- Feature descriptions
- Environment variables reference
- Common combinations
- Troubleshooting
- **Validation:** README complete

#### 9.9 Update CLAUDE.md with new structure
- Document features/ folder purpose
- Document setup.js patterns
- Update commands section
- **Validation:** CLAUDE.md accurate

#### 9.10 Create GitHub Actions CI workflow
- Create `.github/workflows/test-setup.yml`
- Runs all integration tests on PR
- Tests all presets
- **Validation:** CI passes

#### 9.11 Final cleanup and v1.0.0 tag
- Remove any unused files from base template
- Verify .gitignore covers generated files
- Run full test suite
- Tag v1.0.0
- **Validation:** Clean repo, all tests pass

---

## Dependency Graph

```
Phase 1 (Foundation)
    │
    ▼
Phase 2 (Database) ◄────────────┐
    │                           │
    ▼                           │
Phase 3 (Auth + OTP) ───────────┤ (Auth uses DB adapter)
    │                           │
    ├─────────────────┬─────────┼─────────────┬────────────┐
    ▼                 ▼         │             ▼            ▼
Phase 4           Phase 5    Phase 6      Phase 7      Phase 8
(WhatsApp)        (AI)       (3D)         (Storage)    (BullMQ)
    │                 │         │             │            │
    └─────────────────┴─────────┴─────────────┴────────────┘
                              │
                              ▼
                    Phase 9 (Integration)
```

**Parallelization:** After Phase 3, Phases 4-8 can be developed in parallel.

---

## Validation Strategy

| Type | Tool | Used For |
|------|------|----------|
| File existence | `test -f`, `test -d` | Verify files copied |
| TypeScript validity | `pnpm check` | All .ts/.svelte files |
| JSON validity | JSON.parse() | deps.json, env.json |
| Build passes | `pnpm build` | Integration tests |
| Unit tests | Vitest | Utility functions |
| Integration tests | Vitest + shell | Full setup flows |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Feature conflicts | Each feature isolated, clear interfaces |
| Broken imports | Post-copy TypeScript check |
| DB adapter mismatch | Single Kysely adapter for all DBs |
| Missing env vars | Clear post-setup checklist |
| Re-run corruption | Idempotent setup with staging/rollback |
| Partial failure | Rollback mechanism in orchestrator |

---

## Questions Resolved

1. **Re-run behavior:** Idempotent - skips existing files, updates deps
2. **setup.js persistence:** Kept for modifications and --clean
3. **Version upgrades:** features/ tracks template version, user updates deps
4. **features/ location:** In-repo, not separate package
5. **Existing users:** Can skip setup.js, manually add features
6. **PG18 MERGE:** Kept as example, not required

