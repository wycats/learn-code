# Phase 29 Polish: Variable Visual Refinement

## Context

Following the initial Phase 29 implementation, user feedback requested further refinements to the "Variables" feature:

1.  **Persistent Thought Bubble**: The thought bubble should always be visible (even when empty) to reinforce the "Memory" metaphor.
2.  **Item Visibility**: Items on the ground should not disappear when the character stands on them; instead, they should move to the corner to remain visible.

## Changes

### 1. Persistent Thought Bubble

- **Empty State**: Updated `ThoughtBubble.svelte` to always render. When no item is held, it displays a dashed border and a grayed-out "Brain" icon.
- **Visuals**: Added CSS for the `.empty` state, including a dashed tail.

### 2. Grid & Cell Updates

- **Corner Docking**: Updated `Grid.svelte` to pass an `isCharacterHere` prop to `Cell.svelte`.
- **Cell Rendering**: Updated `Cell.svelte` to apply a `.docked` class to the item marker when the character is present. This moves the item to the top-right corner and scales it down (0.7x), ensuring it remains visible without obscuring the character.

## Verification

- **Visual Check**:
  - **Empty Bubble**: Visible with dashed outline.
  - **Held Item**: Normal bubble with Brain + Value.
  - **Ground Item**: Normal center position.
  - **Character on Item**: Item moves to top-right corner.
- **Type Check**: `pnpm check` passed.
