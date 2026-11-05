# Contributing

1. Pick an issue and record its owner, reviewer, dependencies, and acceptance criteria.
2. Pull current main and create a small feature branch, for example `feature/listing-form`.
3. Work in your assigned feature area and coordinate shared-file edits.
4. Run `npm run typecheck`, `npm run build`, and relevant tests.
5. Commit and open a pull request. Include permission tests for data-access changes.
6. Merge after review and passing checks. Everyone pulls the updated main branch.

Never commit credentials, .env.local, node_modules, or real student fixtures. Never change production tables ad hoc. Add a new numbered SQL migration, review it with Sayan, and test it in development. Keep auth, data permissions, and moderation fail-closed until implemented.
