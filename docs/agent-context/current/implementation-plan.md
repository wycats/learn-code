# Implementation Plan: Phase 47 — The Syntax Bridge

## Status

Phase 47 is in its first implementation slice: a read-only Code View that helps learners connect Kibi blocks to text-like syntax without changing the block runtime or introducing editable code.

## Context

Phase 46 made held item state more visible and learnable through Key/Door and Number/Repeat mechanics. That gives Phase 47 a useful bridge target: learners can now see blocks, physical game state, and generated syntax describe the same program.

The roadmap goal is to bridge block-based coding and real-world text syntax. The first slice should be deliberately modest because editable text, parsing, direct code execution, and PXT/MakeCode integration each carry larger semantic and product commitments.

## Goals

1. Add a pure formatter that turns the current block program into readable TypeScript-flavored pseudo-runtime code.
2. Cover all current gameplay block types:
   - Move Forward;
   - Turn Left;
   - Turn Right;
   - Pick Up;
   - Board;
   - Repeat;
   - Call Function.
3. Include function definitions in the generated code so the displayed program represents the whole user-authored solution.
4. Represent held-item repeat counts as a readable value name without changing runtime behavior.
5. Add a read-only Code View surface in the shared game UI.
6. Add syntax highlighting with Shiki while preserving a plain-code fallback.
7. Keep updates live for committed model changes such as adding/removing/reordering/configuring blocks.

## Non-Goals

- Do not add editable text code.
- Do not parse text code back into blocks.
- Do not run generated code directly.
- Do not introduce PXT/MakeCode in this slice.
- Do not change the level schema or runtime semantics.
- Do not define during-drag preview as required for this first slice.

## Implementation Shape

### Formatter

Create a small pure module, `src/lib/game/codegen.ts`, that accepts the main program, function map, and an optional held-item display name. It returns a stable string representation.

The formatter should avoid pretending arbitrary Kibi function names are JavaScript identifiers. Function definitions and calls should quote names through JSON string escaping.

Loop formatting should preserve current semantics:

- numeric repeat counts render as `repeat(3, () => { ... })`;
- held-item counts render as `repeat(heldItem, () => { ... })`;
- omitted counts continue to represent forever loops.

### Code View UI

Add `src/lib/components/game/CodeView.svelte` as a dialog-based, read-only surface. It should:

- generate code from `GameModel.program` and `GameModel.functions`;
- syntax-highlight with Shiki using dynamic import;
- render plain code while highlighting loads or if highlighting fails;
- close through native dialog behavior and backdrop click;
- remain touch-friendly on tablet and full-screen on narrow mobile viewports.

Integrate the trigger in `Game.svelte` rather than `Tray.svelte` so the Code View is available from the shared play/test surface and does not create a new nested editing mode.

## Validation Plan

- Focused formatter tests.
- Focused Code View component tests.
- Nearby game/tray/block tests if touched.
- `PROTO_NODE_VERSION=24 pnpm check`.
- `PROTO_NODE_VERSION=24 pnpm lint`.
- `git diff --check`.
- Manual browser review at `https://kibi.localhost/` using the user-managed dev server.

## Review Gate

This slice is ready for review when:

- generated code is readable for empty programs, movement, loops, held-item repeats, and functions;
- Code View opens and closes reliably in the game UI;
- the display updates after committed block changes;
- docs clearly state that during-drag preview and editable text remain future work.

## PER 2 — Code/Block Correspondence

After PER 1, the Code View explains the program, but it still sits beside the blocks rather than clearly connecting to them. PER 2 should make correspondence visible while keeping the view read-only.

### Goals

1. Extend the formatter to return a lightweight source map from block IDs to generated line ranges.
2. Highlight code lines for the currently executing block through `game.activeBlockId`.
3. Highlight code lines for selected tray blocks through the existing interaction selection state.
4. Add a compact playback toolbar inside Code View that delegates to the existing run, step, back, and reset handlers.
5. Add a compact, read-only board preview when the Code View has enough horizontal room.
6. Keep line highlighting resilient for nested loops and function definitions.
7. Avoid changing runtime semantics, block schema, drag/drop behavior, or the Code View's read-only contract.

### Non-Goals

- Do not add editable text.
- Do not parse code back into blocks.
- Do not add during-drag preview yet.
- Do not require source maps for comments that do not correspond to a block.
- Do not make function definition header lines selectable unless there is an actual block backing them.

### Validation Additions

- Formatter tests should assert block-to-line ranges for primitive blocks, nested loops, and function bodies.
- Component tests should assert active and selected code line rendering.
- Component tests should assert Code View playback controls render and delegate actions.
- Component tests should assert the compact board preview renders in Code View.
- Browser review should step or select a block and confirm the corresponding code line is visually connected.
