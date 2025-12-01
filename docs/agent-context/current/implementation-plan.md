# Implementation Plan - Phase 20

## Goal

Address remaining usability issues in the Builder and improve the Function creation workflow.

## Proposed Changes

### 1. Function UX: "Call ???" Block

**Problem:** The "Call Function" block might be confusing or broken when no function is selected or available.
**Solution:**

- Investigate current behavior of `CallBlock` when `functionName` is empty.
- Improve the empty state (e.g., disable interaction, show "Select Function" prompt).
- Ensure it handles cases where functions are deleted.

### 2. Builder Polish

- **Glassomorphic UI**: Add a visual effect to the "Cover" block to indicate it's obscuring something but still part of the world (or maybe just style it better).
- **Remove Tile Dropdown**: The tile selector in the Level Editor might be redundant or clunky.
- **Custom Repeat Amount**: Allow users to type a number in the Repeat block instead of just using the preset.
- **Fix "Infinity" Targeting**: The "Infinity" option in Repeat blocks shouldn't be targetable by the Story Mode spotlight if it's not a valid learning target for that level? Or maybe it's just broken.
- **"Use test level" Text**: Clarify the button text.
- **Undo/Redo**: Implement undo/redo stack for the Level Editor.

## Execution Steps

1.  **Function UX Investigation & Fix**
    - Analyze `CallBlock.svelte` and `FunctionDefinition.svelte`.
    - Implement improvements.
2.  **Builder Polish Items**
    - Tackle them one by one.
