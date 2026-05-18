# Walkthrough: Phase 43 — Kinetic Accessibility & Jonas Feedback

## Current Status

PER 1 Run / Replay behavior, PER 2 Visual Clarity, and PER 3 Ghost Replay have been implemented. The Ghost Replay slice is ready for manual visual review.

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

## PER 2 Visual Clarity Walkthrough

- The player header now has a persistent mode chip for `story`, `goal`, `planning`, `running`, local paused/step mode, `won`, and `lost` states.
- Local step mode remains local to `Game.svelte`; it is surfaced visually without changing `GameStatus`, interpreter behavior, or run-control behavior.
- The player status panel now distinguishes running from step mode, and the tray disabled overlay names the current non-editable mode instead of relying on hover or disabled styling alone.
- Builder edit surfaces now show a persistent mode chip for edit, story editing, settings open, and targeting active states, plus a current-level chip.
- Builder test mode uses the existing `architectMode` path but labels it as `BUILDER TEST` and keeps the player mode chip visible inside the test run.
- Story editing has a visible ribbon that changes from `Story Editing` to `Targeting N` during story target selection.
- The pack-level builder route was brought into parity with the root builder route for targeting overlays and target callbacks.

## PER 2 Validation

- `PROTO_NODE_VERSION=24 pnpm check` — passed with existing warnings in unrelated files.
- `PROTO_NODE_VERSION=24 pnpm exec playwright test e2e/run-replay.spec.ts --project=chromium` — passed.
- `PROTO_NODE_VERSION=24 pnpm exec playwright test e2e/builder-targets.spec.ts --project=chromium` — first run exposed a strict locator issue from duplicate transition elements; after scoping to the active story editor, passed.
- `PROTO_NODE_VERSION=24 pnpm lint` — passed.
- `PROTO_NODE_VERSION=24 pnpm build` — passed with existing warnings in unrelated files.
- `PROTO_NODE_VERSION=24 pnpm test:unit` — passed.
- `git diff --check` — passed.
- Svelte MCP autofixer was run on the changed Svelte components. It reported no blocking issues; the remaining notes were existing advisory suggestions in larger components, and `svelte-check` stayed clean.

## PER 2 Review

- The implementation matched the prepare hypothesis: persistent player/builder mode chips and ribbons, no kinetic behavior changes, no run-control/interpreter/model scope creep.
- Step mode remains local to `Game.svelte` and is surfaced only through local UI affordances.
- The only meaningful residual risk is visual density on smaller player/builder headers, which should be checked before or during the next kinetic slice.

## PER 3 Ghost Replay Walkthrough

- The first kinetic accessibility slice is Ghost Replay, not snap-to-intent.
- `simulateGhostPath()` provides a pure planning preview from the level start, current main program, functions, terrain, and items. It returns immutable path entries, final position/orientation, and an outcome of `won`, `blocked`, `failed`, `stopped-short`, or `capped`.
- The preview does not run `StackInterpreter`, does not touch the live `GameModel`, and does not play sounds.
- `Game.svelte` computes the preview only when the learner is in `planning`, outside builder test mode, and the main program has at least one block.
- `Grid.svelte` renders the path as a subtle non-interactive ghost trail beneath the live character, with `aria-hidden="true"`, `pointer-events: none`, and stable `data-testid` hooks.
- A small Ghost Path status chip appears near the player mode chip while planning, naming whether the path reaches the goal, is blocked, fails, stops short, or hits the preview cap.

## PER 3 Validation

- `PROTO_NODE_VERSION=24 pnpm check` — passed with existing unrelated warnings.
- `PROTO_NODE_VERSION=24 pnpm exec vitest --run src/lib/game/ghost-path.test.ts src/lib/components/game/Grid.svelte.spec.ts` — passed.
- `PROTO_NODE_VERSION=24 pnpm exec playwright test e2e/run-replay.spec.ts --project=chromium --grep "Ghost Path"` — passed.
- Focused TypeScript `tsc --noEmit --pretty false --skipLibCheck` still reports an existing unrelated `src/hooks.ts` implicit-any error; `pnpm check` remains the project-level validation source and passed.
- Manual local visual review — accepted as decent for this slice.

## What To Review Next

- Confirm the run/replay feel in the browser, especially whether terminal states should keep editing disabled until Reset.
- Review the PER 2 visual clarity layer in the browser, especially crowded toolbar behavior on smaller widths.
- Review Ghost Path visually at `https://learn-coding.localhost/play/basics/level-1`: enter planning, add Step blocks one at a time, confirm the ghost trail appears only in planning, sits below Zoey, and disappears while running.
- Mobile/touch visual validation remains open beyond the targeted desktop Playwright coverage.
