# Task List: PR #5 Baseline Hardening

## Merge/Base Setup

- [x] Create hardening branch/worktree from `origin/main`.
- [x] Merge `pr5-curated-baseline` into the hardening branch.
- [x] Resolve DB conflict by combining lazy production DB behavior with local PGlite migrations.

## Auth / Cloud / Server

- [x] Fix OAuth token accessor usage.
- [x] Validate OAuth provider payloads.
- [x] Require verified Google/GitHub emails for account linking.
- [x] Sanitize OAuth redirect targets.
- [x] Stop serializing full server session data to the client.
- [x] Preserve GitHub-connected UI with a boolean session marker.
- [x] Add secure session cookie flags.
- [x] Scope profile deletion to the current user.
- [x] Scope device revocation to the current user.
- [x] Preserve authorized device records so devices remain revocable.
- [x] Validate sync payloads.
- [x] Validate GitHub pack payloads.
- [x] Sanitize generated GitHub repo/file names.
- [x] Make GitHub pack repositories private by default.

## Migrations

- [x] Remove destructive legacy `user`/`session` table drops from the auth migration.

## Visual / CI Policy

- [x] Restore Playwright self-managed web server with `pnpm`.
- [x] Use local preview URL for Playwright base URL.
- [x] Remove fake Postgres env vars from CI.
- [x] Make CI E2E/visual tests fail on real failures.
- [x] Align `test:visual` with Argos visual specs.
- [x] Clarify that visual approvals happen in Argos, not local snapshot updates.
- [x] Deduplicate Argos screenshot names.

## Docs / Product Truth

- [x] Replace current Phase 42 docs with baseline-hardening docs.
- [x] Keep Phase 42 deferred items in deferred work.
- [ ] Confirm Kibi as the product name before final baseline merge.

## Validation

- [ ] Run Node 24 install/check/lint/unit/build/E2E/visual validation.
- [ ] Run `git diff --check`.
- [ ] Re-review remediated blockers.
