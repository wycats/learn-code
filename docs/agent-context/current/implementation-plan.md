# Implementation Plan: Phase 43 — Kinetic Accessibility & Jonas Feedback

## Status

Planning. Do not implement until this plan is reviewed and approved.

## Why This Phase

The PR #5 baseline is now merged and Kibi is the locked-in product identity. The next useful product step is to improve the tactile feel and clarity of the player/builder loop before adding another large system.

This combines the existing Phase 43 roadmap with the deferred Jonas feedback from Phase 42:

- **Run Button Logic**: If the character is already at the goal or in a failure state, Run should restart/replay cleanly rather than feeling stuck.
- **Visual Clarity**: Make Edit/Run/Failure/Win states visually distinct enough that Jonas and Zoey can understand what mode they are in without reading implementation details.
- **Kinetic Accessibility**: Improve physical-feeling interaction affordances while keeping touch-first behavior central.

## Product Goals

1. Make state transitions legible: editing, running, won, lost, and reset/replay should each have clear visual affordances.
2. Make the Run button feel reliable and obvious in all terminal states.
3. Improve tactile interaction without adding fragile novelty.
4. Preserve local-first behavior and avoid adding new auth/cloud complexity in this phase.

## Proposed Scope

### 1. Run Button State Machine

- Audit current `GameModel` status transitions and `Game.svelte` / toolbar controls.
- Define expected behavior for Run in these states:
  - planning → start execution
  - running → probably disabled or pause/stop if already supported
  - won/lost → reset to start and run again, or present a clear Replay action
  - story/goal → do not run until user has entered planning
- Add unit tests for model-level status behavior where possible.
- Add or update E2E coverage for the reported Jonas flow.

### 2. Edit / Run Visual Clarity

- Audit the player and builder surfaces for mode indicators.
- Improve labels, icon states, color/tone, and disabled affordances so mode is visually obvious.
- Avoid relying on hover or tiny text.
- Validate on mobile viewport.

### 3. Kinetic Interaction Candidate Slice

Pick a small, concrete slice from the Phase 43 roadmap rather than attempting all kinetic language ideas at once:

- **Preferred first slice**: Ghost Replay / Staff Ghost planning affordance, if it directly supports solvability and debugging.
- **Alternative first slice**: Snap-to-intent / magnetic drop targets, if current drag/drop feels unclear during review.
- **Defer**: Kinetic deletion/flinging unless it clearly solves an existing usability problem.

## Out of Scope

- Full Syntax Bridge / code view.
- New auth/cloud features.
- Full feedback system.
- Large redesign of the Builder.
- New curriculum packs beyond small test fixtures if needed.

## Validation Plan

- `PROTO_NODE_VERSION=24 pnpm check`
- `PROTO_NODE_VERSION=24 pnpm lint`
- `PROTO_NODE_VERSION=24 pnpm test:unit`
- `PROTO_NODE_VERSION=24 pnpm build`
- Targeted Playwright coverage for run/replay and mode clarity
- Visual check for key affected screens

## Open Questions

1. Should Run from `won` immediately replay, or should the button label change to `Replay`?
2. Should Run from `lost` reset and replay, or reset to planning only?
3. Which kinetic slice should ship first: Ghost Replay or Snap-to-intent?
