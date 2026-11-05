# Implementation backlog

All items below remain open. The starter is repository infrastructure, not a completed feature release.

| ID | Owner | Deliverable and acceptance |
|---|---|---|
| PM-01 | Enrique | Confirm deadline, weekly capacity, eligibility, moderation, and budget; each feature gets an owner/reviewer |
| UX-01 | Vagn | Prototype browse/post/message flows including errors, empty states, mobile and keyboard use |
| AUTH-01 | Mihir + Sayan | Exact GMU signup hook, email OTP and SMTP; wrong domains and expired codes denied |
| AUTH-02 | Mihir | Sessions, logout, onboarding and profile UI; protected operations recheck identity |
| DATA-01 | Sayan | Apply foundation in test environment, execute access tests, generate database types |
| LIST-01 | Richard | Create/edit/archive listing, categories and validation; other users cannot edit |
| LIST-02 | Richard | Search/filter/sort/paginate; no drafts exposed to other users |
| IMG-01 | Richard + Sayan | Private photos, validation, size/count limits, iPhone formats, upload retries and orphan cleanup |
| SAVE-01 | Richard | Private favorites and saved-items screen |
| CHAT-01 | Anna + Sayan | Durable product-specific messaging, participant access, unread state, reconnect and retry handling |
| INTEREST-01 | Anna | Express/withdraw interest; do not reserve automatically |
| SALE-01 | Anna + Sayan | Atomic reservation/cancellation/completion, racing buyers and duplicate requests tested |
| REVIEW-01 | Anna + Sayan | Eligible reviews, derived ratings, purchase/sales history |
| NOTIFY-01 | Anna | Private in-app notifications with event deduplication |
| TRUST-01 | Anna + Sayan | Report/block, moderator roles and actions, suspension and subscription revocation tests |
| PRIVACY-01 | Mihir + Sayan + Enrique | Account deletion/retention, private data handling and support process |
| OPS-01 | Mihir + Sayan | Separate environments, CI, deployment, monitoring, rollback, database/image restore drill |
| PILOT-01 | Enrique + Vagn | Student pilot; fix core-flow, privacy, accessibility and integrity blockers |

## Milestone order
Scope/design -> foundation/login -> listings/search -> chat -> transactions/reviews -> moderation/notifications -> pilot -> launch. Integrate weekly. No fixed deadline is assumed.

## Deferred, not forgotten
Public listing comments (Anna), typing/presence/read receipts (Anna), push and email notifications (Anna/Mihir), iOS (Mihir leads frontend effort). Payments, shipping and refunds require new scope. Comments on sold items need a moderation and closure policy.

## Release gate
Real GMU verification works; unauthorized direct requests fail; all core buyer/seller journeys pass; private conversations/images stay private; competing reservations cannot double-sell; reviews are eligible; reporting/blocking works; mobile and error handling pass; recovery and rollback are exercised; support/moderation owners and cost alerts exist. Do not release while any core privacy or integrity blocker remains.
