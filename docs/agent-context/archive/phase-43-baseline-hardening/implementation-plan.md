# Implementation Plan: PR #5 Baseline Hardening

## Status

Hardening the curated PR #5 baseline before merge. The goal is to make the broad continuation branch safe enough to become the next project baseline, or to identify the parts that must be split out.

## Context

`pr5-curated-baseline` already removed generated artifacts and passed Node 24 validation. A targeted review found blockers in auth/cloud safety, documentation/product truth, and visual/CI policy.

This hardening pass is based on `origin/main` after the PGlite local-dev PR and merges the curated PR #5 baseline on top.

## Goals

1. Preserve local-first development with PGlite while keeping production DB failures lazy and explicit.
2. Harden auth/cloud/server behavior enough for baseline review:
   - OAuth callbacks use correct token accessors and validate provider payloads.
   - Redirect targets are local-path only.
   - Provider account linking requires verified email ownership.
   - Full server sessions and encrypted GitHub tokens are not serialized to clients.
   - Profile and device destructive actions are scoped to the current user.
   - Device auth records remain revocable after authorization.
   - Sync and GitHub pack payloads are validated.
   - GitHub-created pack repositories default private.
3. Remove destructive migration behavior that would drop legacy `user` and `session` tables.
4. Make Playwright/Argos CI policy explicit and self-contained.
5. Reconcile current docs so they describe baseline hardening rather than treating Phase 42 as the active truth.

## Validation Plan

- `PROTO_NODE_VERSION=24 pnpm install --frozen-lockfile`
- `PROTO_NODE_VERSION=24 pnpm check`
- `PROTO_NODE_VERSION=24 pnpm lint`
- `PROTO_NODE_VERSION=24 pnpm test:unit`
- `PROTO_NODE_VERSION=24 pnpm build`
- `PROTO_NODE_VERSION=24 pnpm test:e2e`
- `PROTO_NODE_VERSION=24 pnpm test:visual`
- `git diff --check`

## Review Gate

After validation, review only the remediated blocker areas. If no blocker remains, the hardened branch can become the merge candidate for the PR #5 baseline.

## Open Product Decision

Kibi appears coherent in the candidate baseline, but final merge should still explicitly confirm that Kibi is the intended product name.
