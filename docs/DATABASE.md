# Database development and frontend contract

This increment prepares profiles, categories, listings, favorites, and GMU email
verification in **local Supabase**. It does not deploy a hosted project, implement
the login UI, or replace the listings prototype in the team's open PR.

## Start locally

Requirements: Node.js 22+, npm, and a running Docker daemon (Docker Desktop or
Docker Engine). The npm scripts pin the Supabase development CLI to 3.0.0; this
adds no application runtime dependency. First startup downloads several images.

```sh
npm ci
npm run db:start
npm run db:test
npm run test:data
npm run typecheck
npm run build
```

Run these commands from the repository root. API: `http://127.0.0.1:54321`.
Local email inbox: `http://127.0.0.1:54324`. Mail is captured locally, never sent
to real GMU inboxes. Studio, Storage, Realtime, analytics and Edge Functions are
disabled for this increment. Do not enable image uploads or chat until their
schema and permission tests are added.

To connect the web app, copy `.env.example` to `.env.local` only if it does not
already exist. Use `npx --yes supabase@3.0.0 status` locally to find the API URL
and **publishable/anon** key and set:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<local publishable or anon key>
```

Do not use the secret/service-role key in the app or commit status output.
The starter screens remain placeholders; frontend developers call the data
helpers after their login flow creates a verified session.

`npm run db:stop` stops this local project's containers and retains its data.
`npm run db:reset` destroys and recreates **this local project's data**, applying
all migrations. Never substitute `--linked` or a hosted database URL.

After adding a migration, run `npm run db:reset`, both database test commands,
and `npm run db:types`. Commit the generated `src/lib/supabase/database.types.ts`.
Generated Insert/Update types describe the SQL schema; they do not grant access
to protected columns. Use the narrower helpers and keep RLS as the authority.

## Tables and rules

| Table | Contract | Access |
| --- | --- | --- |
| `profiles` | Auth UUID `id`, `display_name`, `bio`, trusted `created_at` | Eligible members can read; only the owner can edit name/bio |
| `categories` | Stable text `id` and display `name`; six seeded categories | Eligible members read; app users cannot write |
| `listings` | UUID, `seller_id`, `category_id`, title, description, condition, integer `price_cents`, USD currency, status, timestamp | Eligible owner creates/edits; buyers see available listings; owner also sees drafts/archives |
| `favorites` | Unique `(user_id, listing_id)`, timestamp | Only that member can read, add or remove their favorites; new favorites require an available listing |
| `private.account_status` | Auth UUID and active/suspended status | No direct app access; trusted administration only |

- Exact `gmu.edu` email is required, case-insensitively. Subdomains and suffixes
  such as `gmu.edu.evil.com` are not accepted. This proves email access, not
  current enrollment; any additional eligibility policy requires team agreement.
- A Before User Created hook rejects non-GMU signup. RLS separately checks the
  current verified Auth email, ban state, and active account status on requests.
  Changing eligibility therefore does not rely solely on a stale JWT claim.
- A trigger initializes each Auth user's profile and private status record.
- Prices are integer cents (`1250` means $12.50). Never store floating-point dollars.
- Conditions: `new`, `like_new`, `good`, `fair`.
- Statuses: `draft`, `available`, `archived`. Archive rather than hard-delete.
  `pending`/`sold` await atomic transaction operations; UI must not invent them.
- Email stays in Supabase Auth, not member-readable profiles. Do not add public
  first/last names or email merely because the brainstorming PDF lists them.
- Owner IDs, currency and timestamps are database-assigned. App roles cannot
  rewrite ownership or identity through direct requests.

## Data helpers

`src/lib/supabase/marketplace.ts` accepts an authenticated typed Supabase client.
It does not create a session or use a service-role key. Browser components can use:

```ts
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { browseListings, createListing } from "@/lib/supabase/marketplace";

const client = getSupabaseBrowserClient();
const listings = await browseListings(client, {
  categoryId: "textbooks", search: "biology", offset: 0, limit: 20,
});
const draft = await createListing(client, {
  title: "Biology textbook", description: "Good condition; test example",
  category_id: "textbooks", condition: "good", price_cents: 1250,
});
```

Never run mutation examples during component render. Call them from submit
handlers, handle errors, and show loading/empty/restricted states.

| Helper | Behavior |
| --- | --- |
| `getCategories` | Alphabetical category list |
| `browseListings` | Available listings; optional category and literal title search; newest first with ID tie-break; limit 1–100 |
| `getListing` | Accessible listing or `null` if missing/hidden |
| `getMyListings` | Current user's listings, including drafts and archives |
| `createListing` | Creates a draft by default; accepts `available` when intentionally publishing |
| `updateOwnListing` | Updates permitted form fields; unauthorized/missing rows reject |
| `archiveOwnListing` | Hides listing from buyers while preserving the record |
| `getMyProfile` / `updateMyProfile` | Reads/updates the authenticated user's profile |
| `getFavorites` / `saveFavorite` / `removeFavorite` | Private saved-item IDs; duplicate saves reject; removal is idempotent |

Helpers throw on API/validation errors. A zero-row listing read does not reveal
whether an inaccessible record exists. A favorite may remain after archival,
while its listing details become inaccessible to a buyer; render an unavailable
state. Search currently covers titles only, with offset pagination. It is not
full-text search. Prices, category relationships, lengths and statuses are also
validated by the database, independently of the browser.

## Authentication integration

The document and repository specify email OTP. Frontend can request a code with
`client.auth.signInWithOtp({ email })`, then submit the received code through
`client.auth.verifyOtp({ email, token, type: "email" })`. The local templates show
six-digit codes; confirmation is required. Invalid or reused codes must fail.
Expiry is ten minutes. Real expiry timing and live GMU delivery still need
acceptance testing before launch. A successful request does not create a verified
session until the code is verified. Login UI, server-side session integration,
logout behavior and production email delivery remain separate work.

The team's existing login PR has password fields and a Mason ID button. Coordinate
the flow with its author before wiring it up; a button is not university SSO.
The planning PDF has conflicting owner lists. This contribution does not reassign
teammates or modify their UI branches.

## Tests and CI

- `db:test` executes each plain-SQL assertion file through the local Docker
  database with `ON_ERROR_STOP`. Tests switch into the actual application/Auth
  roles and roll back fixtures. They are not pgTAP tests.
- `test:data` uses the real local Auth and PostgREST APIs, data helpers and captured
  email. It tests OTP/domain checks, automatic profiles, listing creation/search,
  ownership, invalid writes, favorites, archival and anonymous access.
- Integration fixtures use unique fake identities, then delete their own records.
  The admin key is read only from the local CLI's status, never logged or accepted
  through a hosted environment override. Tests refuse an unexpected API URL.
- CI starts the same local stack, runs SQL/API tests and checks that regenerated
  types match the committed file. Web checks remain separate.

## Hosted rollout (not performed by this contribution)

1. Have the database owner confirm a separate development project and inspect
   existing schema/history before applying anything. Do not reset a shared database.
2. Review and apply migrations in version order through an approved deployment
   workflow. Pushing GitHub commits does not execute SQL in Supabase.
3. Enable the Before User Created Postgres hook `public.before_user_created` in
   hosted Auth settings. Local `config.toml` does not configure hosted Auth.
4. Require email confirmation; configure production SMTP, code templates,
   ten-minute expiry, rate limits and exact redirect URLs. Retest real GMU email.
5. Supply only the URL and publishable key to frontend environments. Test access
   rules against an isolated hosted test project, then integrate verified sessions.
6. Coordinate separate Storage, messaging and transaction migrations with their
   owners before implementing those features.
