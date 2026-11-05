# Patriot Marketplace

Mobile-friendly web app first: Next.js + React + TypeScript, Supabase, and Vercel.

## Current status

This is a **development foundation, not a working marketplace**. It contains a responsive project home, placeholder routes, typed Supabase data helpers, database migrations, local GMU email verification, permission/API tests, and collaboration templates. The UI does not yet handle real accounts, listings, messages, payments, or notifications. No hosted services have been configured or deployed by this contribution.

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

## Local Supabase development

With Docker running, use `npm run db:start`, `npm run db:test`, and `npm run test:data`.
These prepare and test the local database, GMU signup hook, and data helpers.
See [DATABASE](docs/DATABASE.md) for the schema contract, frontend examples,
generated types, local email verification, and separate hosted rollout steps.
GitHub pushes do not apply migrations to a hosted Supabase project.

## Contributing to the shared repository

Target: https://github.com/PatriotHacks/patriot-marketplace

Use a dedicated feature branch and a reviewed pull request. Do not push directly
to `main`, commit secrets or `node_modules`, or apply changes to a shared database
without coordinating with its owner. If working from an independently imported
copy, transfer reviewed commits onto a branch based on the shared repository's
history before proposing an upstream merge.

Everyone clones the same repository and works on individual branches. Do not create six separate repositories.

## References

- [Next.js installation](https://nextjs.org/docs/app/getting-started/installation)
- [Supabase user data](https://supabase.com/docs/guides/auth/managing-user-data)
- [Supabase access control](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Email OTP](https://supabase.com/docs/guides/auth/auth-email-passwordless)
- [SMTP setup](https://supabase.com/docs/guides/auth/auth-smtp)
- [Vercel deployment](https://vercel.com/docs/frameworks/full-stack/nextjs)
