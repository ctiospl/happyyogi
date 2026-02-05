# Happy Yogi Platform - Task Plan

## Project Overview
**Client:** Happy Yogi Shaala
**Domain:** happyyogi.in
**Type:** Multi-tenant SaaS yoga/fitness studio platform with white-label support
**MVP Focus:** Happy Yogi website (8 pages) + workshop booking system

---

## Current Phase: Phase 1 - MVP Development

### Phase 1.1: Infrastructure Setup ✅
- [x] Migrate database from SQLite to PostgreSQL
- [x] SSH to 172.105.39.220, create PostgreSQL DB with strong password
- [x] Create MVP migrations (15 tables)
- [x] Configure Kysely for PostgreSQL with $env/static/private
- [x] Seed data: Happy Yogi tenant, admin user, Deepa Rao instructor

### Phase 1.2: Auth System ✅
- [x] Phone-based OTP with Message Central
- [x] Session management with multi-device support
- [x] Basic role check (user vs admin)

### Phase 1.3: Page Builder ✅
- [x] GrapesJS Svelte 5 wrapper component
- [x] Admin UI for page management (CRUD, publish/draft)
- [x] Dynamic [slug] route for page display

### Phase 1.4: Workshop System ✅
- [x] Workshop CRUD in admin
- [x] Workshop detail page (dates, venue, capacity, pricing, FAQs)
- [x] Multi-session support (workshop_sessions table)
- [x] Capacity tracking

### Phase 1.5: Booking Flow ✅
- [x] Guided booking wizard
- [x] Hold system (booking_hold_minutes, hold_expires_at)
- [x] Manual payment flow (UPI screenshot upload)
- [x] Admin payment marking
- [x] Waitlist support

### Phase 1.6: Notifications ✅
- [x] Zepto Mail integration (src/lib/server/notifications/)
- [x] Booking confirmation email template
- [x] Payment marked email template

### Phase 1.7: Content & Launch ⏳
- [ ] Create 8 Happy Yogi pages with content
- [ ] Extract instructor images from happyyogi.in/about-us
- [ ] Generate gallery/hero images with nano-image-generator skill
- [ ] Create sample workshop: "Weekend Ashtanga Intensive" with Deepa Rao
- [ ] SEO setup (meta tags, sitemap, structured data)
- [ ] Deploy to VPS with PM2 + Caddy

---

## Future Phases

### Phase 2: Full Booking System
- Payment gateway integrations (Razorpay first)
- Class scheduling system
- Recurring class support
- Package/subscription management
- Automated payments + dunning

### Phase 3: Multi-Tenant
- Tenant isolation architecture
- Custom domain routing + SSL
- White-label theming engine
- Instructor marketplace
- Cross-tenant instructor invites

### Phase 4: Advanced Features
- Zoom API integration
- WhatsApp Business API
- Advanced analytics
- Gift cards + promos
- Blog/content system

### Phase 5: Scale
- Native app wrappers (Capacitor)
- AI-powered content suggestions
- Community features
- API for third-party integrations

---

## Critical Decisions

| Decision | Resolution | Rationale |
|----------|------------|-----------|
| Fresh start vs existing | **Build on existing** | 56 shadcn components, Tailwind tokens, Kysely setup worth keeping |
| SQLite vs PostgreSQL | **Migrate to PostgreSQL** | pgvector, RLS, production-ready |
| WYSIWYG scope | **GrapesJS with Svelte wrapper** | Full page builder; Tiptap/Edra are rich text only |
| Testing | **Manual for MVP** | Add Vitest/Playwright post-MVP |
| User identity | **Phone required, email optional** | Phone for auth/WhatsApp, email for notifications |
| PostgreSQL hosting | Same VPS (172.105.39.220) | Create DB with strong password in .env |
| Admin URL | `/admin` route (same app) | Simpler deployment |
| File uploads | Custom server with /var/www/happyyogi/uploads/ | Survives deploys, UUID filenames |

---

## Tech Stack (MVP)

- **Framework:** SvelteKit 2 + Svelte 5 (build on existing repo)
- **Database:** PostgreSQL 16+ (migrate from SQLite)
- **Query Builder:** Kysely with kysely-codegen
- **Auth:** Custom session-based (lucia-auth.com guide) with phone OTP
- **OTP:** Message Central
- **Email:** Zepto Mail (Zoho)
- **Page Builder:** GrapesJS with custom Svelte 5 wrapper
- **Hosting:** VPS with PM2 + Caddy
- **Storage:** Local initially → Cloudflare R2 migration path
- **Images:** Sharp for multi-format responsive (srcset: sm, md, lg + WebP)

---

## Database Schema (MVP)

```sql
-- Core
tenants (id, name, slug, domain, timezone, currency, settings, theme, created_at, updated_at)
users (id, phone, phone_verified_at, email, name, avatar_url, timezone, created_at)
sessions (id, user_id, tenant_id, device_info, expires_at, created_at)
otp_verifications (id, phone, otp_hash, purpose, attempts, expires_at, verified_at)
user_tenant_links (id, user_id, tenant_id, role, wallet_balance_paise, created_at)

-- Instructors
instructors (id, user_id, slug, bio, certifications, specializations, avatar_url, gallery)

-- Workshops
workshops (id, tenant_id, instructor_id, title, slug, description, content_html, faqs,
           venue_name, venue_address, mode, capacity, price_paise, deposit_amount_paise,
           registration_opens_at, registration_closes_at, booking_hold_minutes,
           cancellation_policy, status, published_at, seo_*, created_at)
workshop_sessions (id, workshop_id, title, starts_at, ends_at, session_order)

-- Bookings
bookings (id, tenant_id, user_id, workshop_id, status, hold_expires_at,
          cancelled_at, promo_code_id, discount_amount_paise, created_at)
waitlists (id, tenant_id, user_id, workshop_id, position, status, created_at)

-- Payments
payments (id, tenant_id, booking_id, user_id, amount_paise, currency, payment_type,
          method, proof_url, marked_by, marked_at, status, created_at)

-- Content
pages (id, tenant_id, slug, title, content_html, content_json, template,
       seo_title, seo_description, og_image_url, status, published_at)
media (id, tenant_id, filename, mime_type, storage_key, url, variants, uploaded_by)
contact_submissions (id, tenant_id, name, email, phone, message, status, created_at)

-- Audit
audit_logs (id, tenant_id, actor_id, action, resource_type, resource_id, old_values, new_values, created_at)
```

**Key Design Decisions:**
- All money in **paise** (INT) - avoids floating-point issues
- All timestamps as **TIMESTAMPTZ** (UTC storage)
- `deleted_at` for soft-delete on main entities
- `tenant_id` on all tenant-scoped tables
