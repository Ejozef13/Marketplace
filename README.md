# Patriot Marketplace

Mobile-friendly web app first: Next.js + React + TypeScript, Supabase, and Vercel.

## Current status

This is a **team starter, not a working marketplace**. It contains a responsive project home, clearly labeled placeholder routes, a Supabase browser-client factory, the initial database migration, access-test scripts, and collaboration templates. No real accounts, listings, messages, payments, or notifications are handled by the UI yet. No cloud services have been configured or deployed.

## Start the web project

Install Node.js 22 or later, then open this folder in VS Code:

```sh
npm ci
npm run dev
```

Open http://localhost:3000. The starter works without Supabase credentials. Copy `.env.example` to `.env.local` only when connecting a test Supabase project. Put only the project URL and publishable key there; never a service-role/secret key.

```sh
npm run typecheck
npm run build
npx playwright install chromium
npm run test:e2e
```

## Team ownership

| Owner | Work |
|---|---|
| Enrique | Product scope, task board, acceptance, launch |
| Vagn | Figma flows, designs, accessibility |
| Mihir | Accounts, profiles, app foundation, Vercel |
| Richard | Listings, uploads, search, favorites |
| Anna | Chat, interest, transactions, reviews, notifications, moderation |
| Sayan | Schema, permissions, storage policies, migrations, recovery |

## Where things go

```text
src/app/                 Pages and route handlers
src/components/          Reusable interface components
src/features/            Feature ownership notes and future feature modules
src/lib/supabase/        Shared database client setup
supabase/migrations/     Versioned schema and permission changes
supabase/tests/          Database access tests
tests/e2e/               Browser journey tests
docs/                    Team workflow, backlog, setup, and architecture
.github/                 Automated checks and review/task templates
```

Start with [SETUP](docs/SETUP.md), [TEAM](docs/TEAM.md), [BACKLOG](docs/BACKLOG.md), and [ARCHITECTURE](docs/ARCHITECTURE.md). Verification results are in [VALIDATION](docs/VALIDATION.md).

## Publishing the initial repository

Target: https://github.com/PatriotHacks/patriot-marketplace

This starter is prepared for the shared repository above. The connected user has Write access, but the integration rejected file creation with `403 Resource not accessible by integration`. No files were uploaded. The integration still needs authorized repository-content write access, or an authenticated Git publishing workflow. Do not commit secrets or `node_modules`.

Everyone clones the same repository and works on individual branches. Do not create six separate repositories.

## References

- [Next.js installation](https://nextjs.org/docs/app/getting-started/installation)
- [Supabase user data](https://supabase.com/docs/guides/auth/managing-user-data)
- [Supabase access control](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Email OTP](https://supabase.com/docs/guides/auth/auth-email-passwordless)
- [SMTP setup](https://supabase.com/docs/guides/auth/auth-smtp)
- [Vercel deployment](https://vercel.com/docs/frameworks/full-stack/nextjs)
