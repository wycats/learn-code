# Phase Walkthrough

## UI Unification (Diagetic Axiom)

We refactored the Builder UI to align with the "Diagetic Axiom" (Axiom 8). Previously, the Story Editor was hidden behind a "Preview Pill" trigger. We removed this trigger and made the `BuilderStoryBar` a persistent part of the interface.

### Changes
- **Removed**: `BuilderStoryTrigger.svelte`
- **Updated**: `BuilderModel` no longer has a distinct `story` mode. The `edit` mode now encompasses both layout and story editing.
- **Updated**: `BuilderStoryBar` is now always visible in the dashboard area.

## Bug Fixes

### "Select a segment" Empty State
Users reported seeing a "Select a segment" placeholder even when segments existed. This was caused by `activeSegmentId` becoming null or invalid.

**Fix**: We added a reactive effect in `BuilderModel` that strictly enforces a valid `activeSegmentId`.
- If the ID is invalid (points to a non-existent segment), it is cleared.
- If the ID is null but segments exist, the first segment is automatically selected.

### Missing IDs in Legacy Levels
Levels defined in JSON (like "The Bug") often lacked `id` fields for their story segments. This caused the auto-selection logic to fail, as it couldn't select a segment with `undefined` ID.

**Fix**: We introduced a `setPack` method in `BuilderModel` that iterates through all levels and segments upon loading. If a segment lacks an ID, a new UUID is generated immediately. This ensures the model always works with valid, addressable segments.

### Level 5 ("Stairway to the Stars") Geometry
The level was impossible to solve because walls blocked the path to the stars.

**Fix**: We removed the blocking walls from `level-5.json`.

### Level 7 ("Functions") Issues
1.  **"Call ???" Bug**: When dragging a function call block from the palette, it would lose its function name and display "Call ???".
    - **Cause**: The drag-and-drop handler in `Tray.svelte` was creating a new block object but only copying the `type` property, ignoring `functionName`. The click handler (`handlePaletteClick`) had the same issue.
    - **Fix**: Updated `Tray.svelte` to spread all properties from the source block (excluding `id`) when creating a new instance in both `onDrop` and `handlePaletteClick`. Also updated `showGhosts` to respect source block properties.
2.  **UI Flickering**: Switching between "Main" and function tabs caused a layout shift where both lists were visible simultaneously.
    - **Cause**: The `fly` in and `fade` out transitions were overlapping in a flex container, causing them to stack or shift.
    - **Fix**: Changed the container to use CSS Grid, placing both entering and leaving elements in the same grid cell so they overlap perfectly during the transition.
3.  **Incorrect Hint**: The hint "You defined the function, but you need to use the 'Call Jump' block..." was showing even when the user had already used the block.
    - **Cause**: The hint trigger was simply `attempts: 2`, meaning it showed after 2 failures regardless of the code state.
    - **Fix**: Implemented a new analysis check `missing-call:<functionName>` in `analysis.ts` and updated `level-7.json` to use this trigger. Now the hint only shows if the function is defined but not called in the main program.
4.  **Execution Visualization Persistence**: When a function was called a second time, the blocks inside it still showed the "success" (green check) state from the first call.
    - **Cause**: The `StackInterpreter` was not clearing the execution state of the function's blocks when re-entering the function.
    - **Fix**: Updated `StackInterpreter.step()` to clear the execution state of all blocks in a function immediately before pushing the new stack frame. This ensures the function runs "fresh" each time. Stepping back works correctly because the full state snapshot is restored.
5.  **Call Block Feedback**: The "Call" block itself wasn't visually marked as complete when the function started.
    - **Fix**: Updated `StackInterpreter.step()` to explicitly mark the `call` block as `success` immediately upon entering the function.
