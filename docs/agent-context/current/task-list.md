# Task List: Phase 43 — Kinetic Accessibility & Jonas Feedback

## Phase Setup

- [x] Confirm Kibi as the product name.
- [x] Archive PR #5 baseline-hardening current docs.
- [x] Review and approve this Phase 43 plan.

## Discovery

- [x] Audit current Run button behavior across `planning`, `running`, `won`, `lost`, `story`, and `goal` states.
- [x] Audit player and builder visual mode indicators.
- [x] Identify the smallest useful kinetic interaction slice for this phase.

## Run Button Logic

- [x] Define desired Run/Replay/Reset behavior for terminal states.
- [x] Implement model/UI changes.
- [x] Add model/unit tests where possible.
- [x] Add targeted E2E coverage for Jonas's reported flow.

## Visual Clarity

- [x] Improve edit/run/won/lost mode affordances for the run/replay slice.
- [x] Verify run/replay behavior in Playwright Chromium; broader mobile visual clarity remains for the next PER.
- [x] Capture targeted Playwright evidence for run/replay behavior.
- [x] PER 2: Add non-hover player mode indicators for story, goal, planning, running, step mode, won, and lost.
- [x] PER 2: Add non-hover builder mode indicators for edit, story editing, settings open, targeting active, test mode, and current level.
- [x] PER 2: Add targeted Playwright coverage for player and builder mode indicators.

## Kinetic Accessibility Slice

- [x] Choose Ghost Replay or Snap-to-intent as the first slice.
- [x] Write a small implementation plan for the chosen slice.
- [x] Implement only the approved slice.
- [x] Validate with focused automated tests.
- [x] Manual visual review of Ghost Path on the local dev server.

## Validation

- [x] `PROTO_NODE_VERSION=24 pnpm check`
- [x] `PROTO_NODE_VERSION=24 pnpm lint`
- [x] `PROTO_NODE_VERSION=24 pnpm test:unit`
- [x] `PROTO_NODE_VERSION=24 pnpm build`
- [x] Targeted Vitest coverage for run-control/interpreter/model/status panel
- [x] Targeted Playwright coverage for run/replay
- [x] PER 2 targeted Playwright `e2e/run-replay.spec.ts --project=chromium`
- [x] PER 2 targeted Playwright `e2e/builder-targets.spec.ts --project=chromium`
- [x] PER 3 targeted Vitest `src/lib/game/ghost-path.test.ts` and `src/lib/components/game/Grid.svelte.spec.ts`
- [x] PER 3 targeted Playwright `e2e/run-replay.spec.ts --project=chromium --grep "Ghost Path"`
