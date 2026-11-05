# Verification record

## Database-security increment — November 5, 2026

Validated against the real local Supabase stack (CLI 3.0.0, PostgreSQL 17),
not an emulated Auth schema:

- Both migrations applied on a clean local reset; stop/restart also succeeded.
- Three SQL assertion files passed: foundation permissions, current membership
  changes, and signup-hook domain checks/execution privileges. Fixtures roll back.
- Nine API scenarios passed in one parent test (Node reports 10 tests total):
  rejected non-GMU signup; captured email OTP with invalid/reused-code rejection;
  automatic profiles and owner-only editing; private listing drafts; publication,
  search and pagination; invalid writes and ownership forgery; private favorites;
  archival; and anonymous denial. Fixtures are removed after the suite.
- TypeScript checks and production build passed.
- Existing desktop/mobile-sized Chromium navigation tests passed (2 tests), using
  installed Chromium via an external cloud configuration. Not Safari or real iOS.
- Types were generated from the actual public schema; CI checks regeneration drift.
- Local `.env.local` uses only the local API URL/public key and is ignored by Git.

Cloud-only startup needed local Docker proxy exclusions, a BusyBox loopback
health-check correction, and public email-template read permissions. No external
network route or TLS verification was bypassed. Teammates on a normal Docker setup
use the documented npm scripts; the cloud helper stays outside the repository.

Hosted Supabase, SMTP delivery to real GMU inboxes, time-based code expiration,
login/session UI, Storage, Realtime, transactions and production deployment remain
unverified or unfinished. CI configuration was added; a local pass does not claim
GitHub Actions has run. See [DATABASE.md](DATABASE.md) for rollout requirements.

## Original starter verification (historical)

Prepared October 8, 2026.

- Dependency installation completed and generated package-lock.json. Installation audit reported zero vulnerabilities at that time.
- Production build passed with Next.js 16.4.0.
- TypeScript check passed.
- Playwright starter navigation tests passed in desktop Chromium and a mobile-sized Chromium viewport (2 tests). This is not a real iPhone/Safari test.
- Local homepage returned HTTP 200.
- Foundation migration and SQL access assertions passed in PGlite (embedded Postgres) using a minimal emulated Supabase Auth schema. Checks covered verified eligibility, wrong domain, unverified users, suspension, owner versus non-owner edits, draft visibility, favorite privacy, protected identity fields, and anonymous access denial.

## Not yet verified or implemented

No hosted Supabase project was connected. Run the committed SQL test against an isolated Supabase project before accepting the migration. SMTP delivery, Auth hooks, real sessions, image storage, Realtime, transactions, reviews, moderation, backup recovery, and production deployment are unfinished backlog items. The current UI does not collect or persist marketplace data.

The connected user has Write access to PatriotHacks/patriot-marketplace, but the initial README upload failed with `403 Resource not accessible by integration`. No files were published. Local Git credential-manager access also failed, so that publishing route was unavailable. The results above remain local checks; GitHub Actions has not run. No hosted Supabase or Vercel deployment was performed.
