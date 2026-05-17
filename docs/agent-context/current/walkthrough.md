# Walkthrough: Phase 43 — Kinetic Accessibility & Jonas Feedback

## Current Status

PER 1 Run / Replay behavior has been implemented. The remaining Phase 43 visual clarity and kinetic accessibility work is still open.

## Baseline

The PR #5 baseline-hardening work is complete and merged. Kibi is now the confirmed product name.

## Phase Intent

This phase should make Kibi feel clearer and more physical in the places Jonas directly noticed friction:

- the Run button should behave predictably after success or failure;
- Edit/Run mode should be visually obvious;
- the next kinetic interaction improvement should be small, testable, and grounded in real use.

## Candidate Direction

The likely best shape is a focused phase that combines:

1. deferred Phase 42 Jonas feedback;
2. the first slice of Phase 43's Kinetic Language roadmap;
3. enough tests and visual review to keep the new baseline stable.

## PER 1 Run / Replay Walkthrough

- Interpreter failures now end in `lost`, while successful runs still end in `won`.
- The main run button now follows a helper-defined state table: disabled in story/goal, `Play` from planning, `Stop` while running, `Try Again` from lost, and `Replay` from won.
- `Try Again` and `Replay` both reset to the start and immediately rerun the same program.
- Step-then-Play still resumes the paused interpreter instead of restarting.
- The win modal's `Replay` button now reruns instead of reset-only, and closing the modal no longer implicitly replays.
- The status panel has a distinct lost state, and the tray overlay now explains why editing is disabled for running/lost/won states.
- The play route guards completion sync so replaying a won level does not repeatedly push progress/cloud completion for the same level instance.

## PER 1 Validation

- `PROTO_NODE_VERSION=24 pnpm check`
- Targeted Vitest for run-control/interpreter/model/status panel
- Targeted Playwright `e2e/run-replay.spec.ts`
- `PROTO_NODE_VERSION=24 pnpm lint`
- `PROTO_NODE_VERSION=24 pnpm build`
- `git diff --check`

## What To Review Next

- Confirm the run/replay feel in the browser, especially whether terminal states should keep editing disabled until Reset.
- Continue Phase 43 by choosing the kinetic slice: Ghost Replay or Snap-to-intent.
- Mobile/touch visual validation remains open beyond the targeted desktop Playwright run/replay flow.
