# How six people work together

One repository, one web app, one shared test backend. Everyone has their own local copy in VS Code and a branch for each task. Merge reviewed changes regularly, then pull the updated main branch. Vagn works in Figma; Enrique manages GitHub Projects and Issues.

| Person | Main paths and collaboration |
|---|---|
| Enrique | `docs/`, issues, milestones, acceptance evidence |
| Vagn | Figma specifications; review `src/components/` and layouts |
| Mihir | `src/app/login/`, `src/app/profile/`, app layout, deployment, auth helpers |
| Richard | `src/app/listings/`, `src/app/sell/`, `src/features/listings/` |
| Anna | `src/app/messages/`, `src/features/messaging/`, `src/features/transactions/` |
| Sayan | `supabase/`, database types, permission review for all feature changes |

Ownership is responsibility, not exclusive permission to edit. Coordinate changes to shared files. GitHub usernames are not yet known, so CODEOWNERS and automatic assignment have deliberately not been guessed.

## Definition of done
- Feature works with real test data and its acceptance criteria pass.
- Failure, loading, empty, and restricted states work.
- Direct unauthorized requests are denied, not just hidden in the UI.
- Relevant tests and mobile/keyboard checks pass.
- A teammate reviews the pull request.
- Schema changes include migrations and rollout notes.
- Integrated feature is demonstrated in the shared preview.

Hold a planning check-in and working demo weekly. First demo: verified student posts an item; a second verified student finds it and sends a private message.

## Tools by role
- Enrique: GitHub Issues/Projects and shared documents.
- Vagn: Figma and browser accessibility tools.
- Mihir: VS Code, Git, Node/npm, Next.js/React/TypeScript, Supabase Auth, SMTP provider, Vercel.
- Richard: VS Code, Git, Next.js/React/TypeScript, Supabase Database and Storage.
- Anna: VS Code, Git, Next.js/React/TypeScript, Supabase Database and Realtime.
- Sayan: VS Code, Git, Supabase Dashboard/SQL Editor, Postgres/SQL, Supabase CLI, Docker for local Supabase.
- Shared: browser developer tools, Playwright, GitHub Actions; Postman optional for request testing.
