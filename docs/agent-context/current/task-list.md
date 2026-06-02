# Task List: Phase 47 — The Syntax Bridge

## Recon and Planning

- [x] Confirm Phase 46 is closed and current context files are empty.
- [x] Read the Phase 47 roadmap goal from `docs/agent-context/plan-outline.md`.
- [x] Inspect current block schema, program state, function representation, and runtime semantics.
- [x] Identify likely formatter, UI, and test seams for a first read-only code view slice.
- [x] Decide PER 1 should avoid PXT, editable text, syntax highlighting dependencies, schema changes, and runtime changes.

## PER 1 — Read-Only Code View

- [x] Decide where the first Code View should appear:
  - [x] shared `Game.svelte` surface;
  - [ ] inside `Tray.svelte`;
  - [ ] other / deferred builder edit-mode location.
- [x] Decide what “current program” means for display:
  - [ ] active editing context only;
  - [x] whole program without a `main()` wrapper, plus functions;
  - [ ] whole program with active context emphasized.
- [x] Decide code style:
  - [ ] Kibi API pseudo-code;
  - [ ] literal JavaScript/TypeScript-like loops;
  - [x] hybrid TypeScript-flavored pseudo-runtime.
- [x] Decide visible name for held-item values in generated code.
- [x] Add a pure block-to-code formatter module.
- [x] Cover all current block types: Move, Turn Left, Turn Right, Pick Up, Board, Repeat, and Call.
- [x] Handle held-item Repeat counts without changing zero-repeat runtime behavior.
- [x] Handle arbitrary function names without emitting invalid syntax.
- [x] Add formatter unit tests.
- [x] Add a read-only Code View component.
- [x] Integrate the Code View in the chosen UI surface with a low-risk, touch-friendly layout.
- [x] Rework the Code View as a native dialog opened by command invokers, with Shiki highlighting.
- [x] Add focused component coverage for code rendering and live updates after committed block changes.
- [x] Backfill `implementation-plan.md`, `technical-architecture.md`, `walkthrough.md`, and `changelog-plan.md` for Phase 47 review.

## Validation Checklist

- [x] Focused formatter tests pass.
- [x] Focused Code View component tests pass.
- [x] Nearby game/tray/block tests pass if touched.
- [x] `PROTO_NODE_VERSION=24 pnpm check`.
- [x] `PROTO_NODE_VERSION=24 pnpm lint`.
- [x] `git diff --check`.
- [x] Manual browser review at `https://kibi.localhost/`.

## Follow-Up Topics

- [x] Syntax highlighting with Shiki or another highlighter.
- [x] PER 2: add block-to-code line mapping from formatter output.
- [x] PER 2: highlight selected block lines in Code View.
- [x] PER 2: highlight executing block lines in Code View.
- [x] PER 2: add playback controls to Code View using existing run/step/reset handlers.
- [x] PER 2: add a compact board preview to Code View when space allows.
- [x] PER 2: validate line mapping and highlight rendering with focused tests.
- [x] PER 2: visually review selected/executing line highlights at `https://kibi.localhost/`.
- [ ] During-drag code preview if we later define “live updates” as hover/draft-state live.
- [ ] Editable text-code mode.
- [ ] Round-trip text-to-block parsing.
- [ ] Running generated code directly.
- [ ] Builder edit-mode code preview for starter programs.
- [ ] Function parameter and return syntax once the runtime supports those concepts.
