# Walkthrough: PR #5 Baseline Hardening

## Why This Pass Exists

The curated PR #5 branch contains substantial real work, but targeted review found blockers before it could safely become the project baseline. This pass hardens the blocker areas without starting a new product feature phase.

## What Changed

### Local/Production DB Behavior

The hardening branch combines the PGlite local-development default from `main` with the curated branch's build-safe production behavior. Local dev can run without Docker or DB env vars, while production still fails explicitly if DB-backed code paths are used without `POSTGRES_URL` or `DATABASE_URL`.

### Auth and Cloud Safety

OAuth callbacks now use proper Arctic token accessors, validate provider payloads, require verified email ownership, and restrict redirect targets to local paths. Layout data now exposes only a sanitized session shape, including a boolean GitHub connection marker instead of the encrypted GitHub token.

Profile deletion and device revocation are scoped to the current user. Device authorization now records the created session so connected devices can be revoked later.

### Sync and GitHub Publishing

Cloud sync payloads are validated before persistence. GitHub pack payloads are validated against the pack schema, generated repo/file names are sanitized, and new GitHub repositories default to private.

### Migration Safety

The auth migration no longer drops the legacy singular `user` and `session` tables. That avoids destructive behavior during baseline adoption.

### Visual and CI Policy

Playwright once again manages its own local preview server using `pnpm`. CI no longer supplies fake Postgres env vars or treats E2E/visual failures as silently advisory. Argos screenshot names are unique, and the visual scripts now match the Argos workflow.

## Remaining Decision

Kibi is coherent in the candidate baseline, but final merge should explicitly confirm that Kibi is the intended product name.

## Validation

The hardening branch should pass Node 24 install/check/lint/unit/build/E2E/visual validation before review.
