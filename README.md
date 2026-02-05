# Asamkhya Starter Template

A modular SvelteKit starter template with optional features for databases, auth, AI, 3D graphics, and more.

## Quick Start

```bash
# Clone the template
npx degit yourusername/asamkhya-starter-template my-app
cd my-app

# Run interactive setup
node setup.js

# Install dependencies
pnpm install

# Start development
pnpm dev
```

## Features

The setup script lets you choose which features to include:

| Feature | Options | Description |
|---------|---------|-------------|
| **Database** | PostgreSQL 18, PostgreSQL, MySQL, MariaDB, SQLite, None | Kysely query builder with your preferred DB |
| **Auth** | Lucia, None | Session-based authentication |
| **OTP** | SMS (Message Central), Email (ZeptoMail) | One-time password verification |
| **Messaging** | WhatsApp Business API | Send/receive WhatsApp messages |
| **AI** | Full, Minimal, None | Vercel AI SDK with optional UI components |
| **3D Graphics** | Threlte, None | Three.js with Svelte bindings |
| **Storage** | S3-compatible, Local disk | File upload/download |
| **Background Jobs** | BullMQ + Redis, None | Reliable job processing |

## Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm preview      # Preview production build
pnpm check        # TypeScript check
pnpm test         # Run tests
pnpm test:setup   # Run setup utility tests
pnpm lint         # Check formatting
pnpm format       # Fix formatting
```

## Project Structure

```
├── setup.js              # Interactive setup script
├── features/             # Feature modules (copied on selection)
│   ├── database/         # Database configurations
│   ├── auth/             # Authentication (Lucia)
│   ├── otp/              # OTP providers
│   ├── messaging/        # WhatsApp integration
│   ├── ai/               # AI SDK + components
│   ├── graphics/         # 3D with Threlte
│   ├── storage/          # File storage
│   └── jobs/             # Background jobs
├── src/
│   ├── lib/
│   │   ├── components/ui/  # shadcn-svelte components
│   │   └── hooks/          # Svelte 5 hooks
│   └── routes/             # SvelteKit routes
└── setup/                  # Setup script utilities
```

## After Setup

1. Copy `.env.example` to `.env` and fill in your credentials
2. Run database migrations (if database selected)
3. Update `src/hooks.server.ts` for auth (if Lucia selected)

## Tech Stack

- **Framework**: SvelteKit 2 + Svelte 5
- **Styling**: Tailwind CSS v4 + shadcn-svelte
- **Forms**: Superforms + Formsnap + Zod
- **i18n**: Paraglide (pre-configured for en, hi)
- **Testing**: Vitest + Playwright

## License

MIT
