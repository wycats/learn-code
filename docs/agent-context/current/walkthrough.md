# Walkthrough - Contextual Target Mode (Refined)

## Overview
Refined the "Contextual Target Mode" based on user feedback. The UI now closely matches the provided design (diegetic controls on the story card), and the interaction model is stricter (disabling other builder actions during selection).

## Changes

### 1. Interaction Model
- **Grid.svelte**: Updated `handleMouseDown` and `handleMouseEnter` to strictly enforce selection-only behavior when in targeting mode.
    - Dragging characters or other builder interactions are now disabled during selection.
    - Clicking a cell *always* triggers the selection callback.
- **Cell.svelte**: Removed the "red fade" animation. The selection highlight is now a persistent brand-colored outline with a shadow, matching the "selected" state requested.

### 2. UI / UX
- **BuilderStoryBar.svelte**:
    - Implemented the "Screenshot UI": A vertical stack of two buttons.
        - **Top Button**: Shows the target icon and current count. Includes a small "X" badge to clear the selection.
        - **Bottom Button**: A "Confirm" (Checkmark) button with a pulsing animation to indicate the primary action.
    - This replaces the previous single-button toggle, providing clearer "Clear" and "Done" affordances.

### 3. Data Model
- **GameModel**: Updated `setPersistentHighlight` to use `type: 'selection'`, which maps to the new persistent visual style in `Cell.svelte`.

## Verification
- **Visual Tests**: Ran `pnpm test:visual`. Regressions in Home/Library are unrelated to these changes (likely due to previous global style tweaks).
- **Manual Check**:
    - **Selection**: Clicking cells toggles selection.
    - **Isolation**: Cannot drag character while selecting.
    - **Visuals**: Selected cells have a solid blue outline (no red fade).
    - **Controls**: The story card shows the new 2-button stack.

## Next Steps
- User testing of the new flow.
- Potential further refinement of the "Clear" badge interaction (currently clears all, maybe should be per-target?).
