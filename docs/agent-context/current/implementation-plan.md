# Implementation Plan: Phase 43 — Kinetic Accessibility & Jonas Feedback

## Status

PER 1 Run / Replay behavior is implemented. PER 2 Visual Clarity is implemented. PER 3 Ghost Replay is implemented as the first kinetic accessibility slice and is ready for visual review.

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

### PER 2 Implemented Visual Clarity Slice

- Player mode chip covers story, goal, planning, running, local paused/step mode, won, and lost.
- Step mode stays local to `Game.svelte`; no `GameStatus` schema or interpreter/run-control behavior changed.
- Status panel and tray overlays now name the current non-editable mode visibly.
- Builder toolbar now exposes edit, story editing, settings open, targeting active, test mode, and current level indicators.
- Builder story bar now has a visible story/targeting ribbon.
- Root and pack-level builder route wrappers now both show settings/targeting affordances consistently.

### 3. Kinetic Interaction Candidate Slice

Pick a small, concrete slice from the Phase 43 roadmap rather than attempting all kinetic language ideas at once:

- **Preferred first slice**: Ghost Replay / Staff Ghost planning affordance, if it directly supports solvability and debugging.
- **Alternative first slice**: Snap-to-intent / magnetic drop targets, if current drag/drop feels unclear during review.
- **Defer**: Kinetic deletion/flinging unless it clearly solves an existing usability problem.

### PER 3 Implemented Ghost Replay Slice

- Added a planning-only Ghost Path preview for the main program when the learner has at least one block.
- The preview is Staff Ghost-shaped groundwork only: it does not add reference/staff solution schema or solution authoring.
- Added a pure `simulateGhostPath()` helper that reads level/start/program/functions/terrain/items and returns immutable preview data with ordered path entries, final position/orientation, and outcomes (`won`, `blocked`, `failed`, `stopped-short`, `capped`).
- The preview intentionally does not use `StackInterpreter` or mutate the live `GameModel`.
- `Grid.svelte` renders a subtle non-interactive overlay under the live character with `pointer-events: none`, `aria-hidden="true"`, and stable Ghost Path test IDs.
- `Game.svelte` computes/passes the preview only during non-builder `planning`, and hides it during running/story/goal/won/lost.
- A small planning status chip names the Ghost Path outcome without changing run-control or interpreter semantics.

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

## Resolved PER 1 Decisions

1. Run from `won` is labeled `Replay` and immediately reruns the same program from the start.
2. Run from `lost` is labeled `Try Again` and immediately reruns the same program from the start.
3. Step-then-Play resumes the paused interpreter instead of restarting.

## Resolved PER 2 Decisions

1. Use persistent chips/ribbons instead of hover-only labels for mode clarity.
2. Keep paused/step mode as local `Game.svelte` UI state rather than expanding `GameStatus`.
3. Treat builder test mode as the existing game/architect path with a clearer `BUILDER TEST` label.

## Resolved PER 3 Decisions

1. Ship Ghost Replay first; defer snap-to-intent and kinetic deletion/flinging.
2. Keep Ghost Path tied to the learner's current main program, not hidden state or a reference solution.
3. Keep builder/test mode out of this slice so the overlay cannot interfere with builder grid editing.

## Open Questions

1. Should the next visual pass include mobile-specific toolbar simplification beyond the current responsive chip compression?
2. Should a later Staff Ghost system introduce explicit reference-solution schema, or continue deriving previews only from learner-authored code?
