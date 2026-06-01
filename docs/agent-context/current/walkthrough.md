# Walkthrough: Phase 47 — The Syntax Bridge

## Why This Slice Exists

Kibi has mature block-programming mechanics, but learners eventually need a gentle bridge from tactile blocks into text-like programming syntax. This phase starts that bridge with a read-only Code View: blocks remain the source of truth, and the text view explains the structure those blocks are building.

This is intentionally not an editable-code phase. The first goal is recognition and language transfer, not a second programming surface.

## What Changed

### Pure Code Formatter

`src/lib/game/codegen.ts` formats Kibi blocks into TypeScript-flavored pseudo-runtime code. It is a pure module with no Svelte dependency, which keeps the syntax rules testable and separate from presentation.

The formatter currently supports:

- `moveForward();`
- `turnLeft();`
- `turnRight();`
- `pickUp();`
- `board();`
- `repeat(count, () => { ... });`
- `repeatForever(() => { ... });`
- `callFunction("Name");`
- `defineFunction("Name", () => { ... });`

Function names are quoted instead of converted into identifiers. That keeps creator-authored names like `Turn Around` or `123 tricky-name` visible without generating invalid-looking syntax.

Held-item repeat counts render as `heldItem`. This matches the current Thought Bubble/held-item teaching model without introducing named variables or lexical scope.

### Read-Only Code View

`src/lib/components/game/CodeView.svelte` adds a native dialog that displays the generated code for the whole program: main blocks plus function definitions.

The dialog uses Shiki highlighting through a dynamic import. While Shiki loads, or if highlighting fails, the component still renders plain code so Code View remains useful.

The dialog is opened from the shared game toolbar in `Game.svelte`. That placement keeps the feature close to the run/step controls and available in the normal play/test surface without burying it inside the tray.

### Live Updates

The Code View updates from `GameModel.program` and `GameModel.functions`, so it follows committed model changes such as adding, removing, reordering, or configuring blocks.

During-drag preview is not included in this slice. That is a separate product question because it would require deciding whether hover/draft drag state should be treated as code for learning purposes.

## Why The Code Is Pseudo-Runtime TypeScript

The generated code is intentionally readable, not executable JavaScript. Names like `moveForward`, `repeat`, `pickUp`, and `defineFunction` describe Kibi runtime actions in a TypeScript-shaped syntax.

This avoids two traps:

- literal JavaScript would add implementation noise before learners need it;
- fully executable generated code would force runtime and parser commitments before the bridge has been validated.

## What To Review

1. Open `https://kibi.localhost/` with the user-managed dev server running.
2. Enter a level and open Code View from the game toolbar.
3. Confirm an empty program shows a friendly comment.
4. Add movement, turn, pickup, board, repeat, and function-call blocks.
5. Confirm Code View updates after committed block changes.
6. Check held-item Repeat renders as `repeat(heldItem, () => { ... })`.
7. Check function definitions appear after the top-level program.
8. Check the dialog closes with the close button and backdrop click.
9. Check narrow/mobile layout does not clip the header or code frame.

## Deferred Work

- During-drag code preview.
- Editable text-code mode.
- Round-trip text-to-block parsing.
- Running generated code directly.
- Builder edit-mode preview for starter programs.
- Function parameters and return values after the runtime supports those concepts.
