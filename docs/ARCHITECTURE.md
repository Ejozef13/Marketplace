# Architecture and agreed contracts

The browser loads a Next.js application hosted on Vercel. Supabase provides Auth, Postgres, Storage, and Realtime. No payments are processed in the initial release. A later mobile frontend can reuse the backend; Next.js does not automatically convert to Swift.

## Implemented database foundation
`auth.users` -> `profiles`; profiles own `listings`; `categories` classify listings; `favorites` joins members to listings. Private account status controls suspension. Member eligibility checks the current Auth record, verification, exact email domain, ban state, and private account status. Email is not copied into a member-readable profile.

RLS and restricted column grants prevent users from changing identity/ownership columns. Only the owner can edit a listing; other eligible users see available listings. Favorites are visible only to the user who saved them. Users archive listings rather than delete historical records. Initial application roles cannot delete accounts or listings.

This foundation intentionally supports draft/available/archived only. Add pending/sold when atomic transaction operations are implemented and tested. Authentication hooks, storage policies, messaging, and moderation are not yet implemented.

## Next schema increments
1. `listing_images`: private storage path, listing ID, display order.
2. `interests`: user/listing unique pair; explicit interest distinct from private favorites.
3. `conversations`, members, `messages`: one listing/buyer thread, participant-only access, retry-deduplication ID.
4. `transactions`: buyer, seller, listing, agreed cents, state, both confirmations; one active exchange per item enforced in the database.
5. `reviews`: completed participants only, one per author/transaction, stars 1–5, no self-review.
6. `notifications`, `blocks`, `reports`, restricted admin roles and audit history.

## Transaction rules
Interest and messages do not reserve an item. Seller proposes a buyer, buyer accepts, listing becomes pending atomically. Cancellation returns the item to available. Both parties confirm exchange before completion and review eligibility. Sold-elsewhere is separate and creates no fictitious buyer or verified review. Lock material listing edits during reservations. Preserve history through archival and controlled account deletion.

## Common contracts
Use UUID identities, integer cents in USD, trusted timestamps, pagination, and the same status names across code and SQL. Never trust a browser-supplied ownership ID. Feature engineers own feature logic; Sayan reviews schema/permissions. Share operation input, output, and failure cases before integrating screens.
