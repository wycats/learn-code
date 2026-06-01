# Technical Architecture: Phase 47 — The Syntax Bridge

## Architecture Summary

Phase 47 adds a read-only syntax bridge over the existing block runtime. Blocks remain the source of truth. Generated code is an explanatory projection of `GameModel.program` and `GameModel.functions`, not an executable artifact.

## Current Program Architecture

- `GameModel.program` stores the main block list.
- `GameModel.functions` stores named function block lists.
- `GameModel.editingContext` controls which block list the tray edits.
- Runtime execution still uses the stack interpreter and existing block schema.
- `VariableRefSchema` currently only supports `heldItem`, and only loop counts consume it.

## PER 1 Architecture

1. `src/lib/game/codegen.ts` provides a pure formatter from block state to code text.
   - A small `CodeWriter` helper owns line/block indentation so block formatters do not manually concatenate leading whitespace.
   - PER 2 extends the formatter with a block-ID to generated-line-range map while preserving the string-only `formatProgramCode()` helper.
2. `src/lib/components/game/CodeView.svelte` renders the formatter output in a native dialog.
3. `CodeView.svelte` imports Shiki dynamically so the game can render a plain-code fallback while highlighting loads or if highlighting fails.
4. `CodeView.svelte` uses `game.activeBlockId` and `interactionManager.selection` to mark executing and selected code lines.
5. `src/lib/components/game/CodeViewBoard.svelte` renders a visual-only compact board preview beside the code on wider dialogs.
6. `Game.svelte` owns the Code View trigger in the shared game toolbar.
7. No schema, runtime, interpreter, drag/drop, or Builder state changes are required.

## Formatter Rules

- Top-level blocks render first.
- Function definitions render after the top-level program.
- Function names are JSON-quoted instead of normalized into identifiers.
- Empty block lists render a comment rather than a blank panel.
- Numeric repeats render as `repeat(number, () => { ... })`.
- Held-item repeats render as `repeat(heldItem, () => { ... })`.
- Omitted repeat counts render as `repeatForever(() => { ... })`.
- Block line ranges are one-based and inclusive.
- Loop ranges cover the full rendered loop construct; nested child blocks keep their own narrower ranges.

## Why Not Editable Text Yet

Editable text would require parser rules, reconciliation with block IDs, error recovery, and decisions about whether generated code can express states that blocks cannot. This slice focuses on recognition and transfer: children can see text syntax emerge from blocks without having to debug a text editor.

## Why Not PXT Yet

PXT remains a possible future bridge, but introducing it here would make the first syntax slice depend on an external engine before Kibi's own generated-language shape is understood. The current formatter lets us validate the pedagogical bridge with very low runtime risk.

## Testing Strategy

- Unit test the formatter across empty programs, primitive blocks, loops, held-item repeats, and function definitions.
- Unit test source-map ranges for primitive blocks, nested loops, and function bodies.
- Component test Code View rendering, committed model updates, active line classes, selected line classes, controls, and the compact board preview.
- Keep full app validation focused on check/lint and nearby tests unless the UI changes expand.
- Manually review Code View at `https://kibi.localhost/` with the user-managed dev server.
