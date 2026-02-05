# Happy Yogi Platform - Findings

## Business Research

### Happy Yogi Overview
- **Founded:** 2016, Mumbai Lower Parel/Prabhadevi
- **Phone:** +919820009173 / +919869734357
- **Email:** info@thehappyyogico.com
- **Instagram:** @theshaala
- **Philosophy:** "Urban oasis" bridging tradition & modernity, holistic approach beyond just asanas

### Venue Address
**Sportsmed Mumbai**
2nd Floor, Parel Premises, Sayani & Gokhale Road South Junction
Opp Motilal Oswal Towers, Parel West
Mumbai 400025, Maharashtra, India

**Landmark:** Next to Parel ST Depot, Opposite Motilal Oswal Tower
**Google Maps:** Search "Sportsmed Mumbai Parel"

### Instructors (3 confirmed)

1. **Divya Rao**
   - Hatha/Ashtanga Vinyasa, Mysore trained
   - Vipassana meditation practitioner since 2009
   - 2nd degree Taekwondo black belt, started teaching at 15
   - Acclaimed film producer (Dangal)
   - Extract photo from happyyogi.in/about-us

2. **Deepa Rao**
   - Ashtanga Vinyasa (David Garrigues/Pattabhi Jois tradition)
   - Iyengar Yoga, Ayurvedic principles
   - Corporate advertising background
   - Teaching designed to overcome modern-day challenges
   - Extract photo from happyyogi.in/about-us

3. **Vijesh Nair**
   - Co-founder, Yoga Alliance certified
   - Started "Yoga for Sports" initiative (Times of India featured)
   - Mental/physical conditioning for athletes
   - Extract photo from happyyogi.in/about-us

### Services Offered
- Online yoga (Mon/Wed/Fri 7-8am)
- In-person Ashtanga (Tue/Thu 6:30-7:30am at Sportsmed)
- Yoga for Sports (individual appointments)
- Personal/at-home classes (meditation, pre/post-natal, injury prevention)
- Corporate wellness programs
- Workshops & retreats

---

## Technical Research

### WYSIWYG/Page Builder Evaluation

| Tool | Page Builder | Svelte 5 | Templates | Verdict |
|------|-------------|----------|-----------|---------|
| **GrapesJS** | ✅ Yes | Wrapper needed | Yes | **SELECTED** |
| Tiptap/Tipex | ❌ Rich text only | Yes | No | Not a page builder |
| Editor.js | ❌ Block editor | Wrapper needed | No | Not a page builder |
| Builder.io | ✅ Yes | SDK v5.x | Yes | SaaS dependency |
| BlockNote | ❌ | No (React) | No | Not viable |
| Svaro | ✅ Yes | Yes | WIP | Too early |

**Decision: GrapesJS**
- True page builder (not just rich text)
- 70K weekly downloads, 25K GitHub stars
- Framework-agnostic, works with any frontend
- Pre-built blocks, templates, style manager
- MIT license
- Implementation: Custom Svelte 5 wrapper (mount in onMount, cleanup in onDestroy)

### File Upload Strategy (Production)

Per SvelteKit best practices, files outside `static/` need custom serving:

**Directory Structure:**
```
/var/www/happyyogi/
├── app/                    # SvelteKit app
│   ├── build/
│   └── ...
└── uploads/                # Persistent file storage
    ├── media/              # Images (with variants)
    ├── proofs/             # Payment screenshots
    └── temp/               # Upload staging
```

**Implementation:**
1. Custom Express/Polka middleware in `server.js` to serve `/uploads/*`
2. UUID filenames to prevent overwrites
3. Sharp generates variants on upload (sm, md, lg, webp)
4. Store metadata in `media` table
5. Future migration: swap local handler for R2 SDK

### Existing Codebase Assets

**Reusable:**
- ✅ 56 shadcn-svelte UI components
- ✅ Tailwind CSS 4 with design token system
- ✅ Kysely database setup (migrate to PostgreSQL)
- ✅ i18n (Paraglide) - English only for MVP
- ✅ Form validation (Superforms + Zod)
- ⏸️ Testing infrastructure (Vitest + Playwright) - post-MVP

**Features available in /features/:**
- `/features/auth/lucia/` - Lucia auth setup (adapt for phone OTP)
- `/features/otp/sms-messagecentral/` - Message Central OTP ✅
- `/features/storage/local/` - Local file storage ✅
- `/features/database/postgres18/` - PostgreSQL config ✅
- `/features/jobs/` - BullMQ background jobs (post-MVP)

### Dependencies to Add
- `pg` - PostgreSQL driver
- `sharp` - Image processing for responsive variants
- `grapesjs` - Page builder
- Zepto Mail SDK

---

## Conflicts Found & Resolved

### Critical (10000+ bad lines prevented)

| Conflict | Found | Resolution |
|----------|-------|------------|
| DB engine mismatch | Spec said PostgreSQL, codebase uses SQLite | Migrate to PostgreSQL |
| Fresh start vs reuse | Contradictory statements | Build on existing (56 components) |
| WYSIWYG scope unclear | "Full page builder" but no research | GrapesJS selected |

### Major (1000+ bad lines prevented)

| Conflict | Found | Resolution |
|----------|-------|------------|
| Schema incomplete | Missing sessions, otp_verifications, contact_submissions, media | Added complete schema |
| Payment FK ambiguous | `payments.booking_id` but separate workshop_bookings | Unified bookings table |
| User identity unclear | Phone vs email for auth | Phone required, email optional |
| Testing contradiction | Spec lists Vitest, interview says manual | Manual for MVP |

### Minor (clarifications)

| Item | Clarification |
|------|---------------|
| WhatsApp for MVP | Static link only, Business API in Phase 4 |
| Instructor marketplace | Deferred to Phase 3 |
| Currency | All amounts in paise (INT) |
| Timezone | All TIMESTAMPTZ (UTC), display in tenant timezone |
| Multi-day workshops | Package view with workshop_sessions table |

---

## Design System

### Brand Colors (from logo)
- Mustard/Gold: `oklch(0.75 0.15 85)` - warmth, energy
- Teal/Blue: `oklch(0.55 0.12 220)` - calm, trust
- Coral/Red: `oklch(0.60 0.18 25)` - vitality, passion
- Burgundy: `oklch(0.35 0.12 15)` - grounding, depth

### Design Mood
Warm & grounded (earthy tones, soft curves, calming imagery)

### Typography
Rounded, friendly sans-serif (Nunito, Quicksand, or similar)

### Logo
- **File:** `/Users/chintanthakkar/Downloads/happy-yogi-logo.png`
- Brand: "The Happy Yogi Co." with seated yogi illustration

---

## Sources

- [yoga.in/happy-yogi-shaala](https://yoga.in/explore/centres-and-ashrams/happy-yogi-shaala/)
- [happyyogi.in](https://happyyogi.in/)
- [happyyogi.in/about-us](https://happyyogi.in/about-us)
- [Sportsmed contact](https://sportsmed.in/contact/)
- [GrapesJS](https://grapesjs.com/)
- [SvelteKit file uploads discussion](https://github.com/sveltejs/kit/discussions/10162)
- Instagram: @theshaala
