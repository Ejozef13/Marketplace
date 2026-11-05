# Setup and launch checklist

## Local web development — Mihir
1. Install Node.js 22+, VS Code, and Git.
2. Clone the shared repository once it is initialized; open its folder in VS Code.
3. Run `npm ci` then `npm run dev`.
4. Keep `.env.local` private. The starter pages do not require it.

## Test Supabase project — Sayan and Mihir
For the repeatable local setup and tested data contract, start with
[DATABASE.md](DATABASE.md). The committed `supabase/config.toml` replaces the
previous need to run `supabase init` yourself. Local Auth captures verification
codes without contacting a hosted project or sending real email.

1. Create a development project separate from production.
2. Review `supabase/migrations/202610080001_foundation.sql` and apply it once through the development project's SQL Editor. Never apply it blindly to an existing database.
3. Run `supabase/tests/foundation.sql` through the SQL Editor in an isolated test project. It rolls back its fixtures. This is plain SQL, not a pgTAP suite.
4. For local Supabase, install Docker and run `npm run db:start`, then `npm run db:test` and `npm run test:data`. The npm commands pin the CLI version. `npm run db:reset` is only for disposable local development and deletes that local project's data.
5. Keep migrations in Git. Do not make undocumented production dashboard changes.
6. The new migration defines `public.before_user_created` and local config enables it. Enable this Before User Created hook separately in hosted Auth to restrict signup to exact `gmu.edu`; pushing SQL files does not configure hosted Auth.
7. Configure email OTP templates, a production SMTP provider, verification expiry/rate limits, and exact redirect URLs. Test delivery to real GMU inboxes.
8. Implement and verify session handling, email-change eligibility, and server-side authentication before exposing live features. The current browser helper is not a complete Next.js authentication integration.
9. Add private image buckets and tested upload/read/delete policies in a later migration. No image bucket is created by this starter.
10. Test suspended accounts and open Realtime subscriptions when messaging is added.

## Vercel — Mihir
Import the authorized GitHub repository. Use the Next.js preset and the committed lockfile. Set preview variables to the test Supabase project; production variables must point to a separate production project. Never use `NEXT_PUBLIC_` for secret keys. Preview the starter first; do not announce an operational marketplace until the backlog's launch gate passes.

## Operations — Enrique and Sayan
Choose the email provider, monitoring, backup destination, budget ceiling, support contact, and moderation owners. Test database and image restoration separately. Define account deletion/retention before real student data is collected.
