# Task List: Phase 43 — Kinetic Accessibility & Jonas Feedback

## Phase Setup

- [x] Confirm Kibi as the product name.
- [x] Archive PR #5 baseline-hardening current docs.
- [x] Review and approve this Phase 43 plan.

## Discovery

- [x] Audit current Run button behavior across `planning`, `running`, `won`, `lost`, `story`, and `goal` states.
- [ ] Audit player and builder visual mode indicators.
- [ ] Identify the smallest useful kinetic interaction slice for this phase.

## Run Button Logic

- [x] Define desired Run/Replay/Reset behavior for terminal states.
- [x] Implement model/UI changes.
- [x] Add model/unit tests where possible.
- [x] Add targeted E2E coverage for Jonas's reported flow.

## Visual Clarity

- [x] Improve edit/run/won/lost mode affordances for the run/replay slice.
- [x] Verify run/replay behavior in Playwright Chromium; broader mobile visual clarity remains for the next PER.
- [x] Capture targeted Playwright evidence for run/replay behavior.

## Kinetic Accessibility Slice

- [ ] Choose Ghost Replay or Snap-to-intent as the first slice.
- [ ] Write a small implementation plan for the chosen slice.
- [ ] Implement only the approved slice.
- [ ] Validate with tests/visual checks.

## Validation

- [x] `PROTO_NODE_VERSION=24 pnpm check`
- [x] `PROTO_NODE_VERSION=24 pnpm lint`
- [ ] `PROTO_NODE_VERSION=24 pnpm test:unit`
- [x] `PROTO_NODE_VERSION=24 pnpm build`
- [x] Targeted Vitest coverage for run-control/interpreter/model/status panel
- [x] Targeted Playwright coverage for run/replay
