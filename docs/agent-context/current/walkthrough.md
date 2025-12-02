# Walkthrough: Phase 27 - Headless Interaction System

## Overview

In this phase, we implemented a **Headless Interaction System** to decouple interaction logic (Drag & Drop, Selection) from UI components (`Block.svelte`, `Tray.svelte`). We adopted the **Ember Pattern** (Pull-based reactivity) using Svelte 5 Runes.

## Key Changes

### 1. Interaction Primitives (`src/lib/interactions/`)

We created a new directory for the interaction system:

- **`manager.ts`**: The singleton `InteractionManager` that orchestrates the system. It holds the `InteractionSession` and `InteractionRegistry`.
- **`session.ts`**: A state machine representing the current interaction (e.g., dragging a block). It tracks `activeTargetId`, `activeEdge`, and `candidates`.
- **`registry.ts`**: Manages the registration of interactive elements (Logical Index).
- **`types.ts`**: Defines core types like `InteractionNode`, `ComponentState`, and `InteractionRole`.
- **`dnd.ts`**: Adapters for `@atlaskit/pragmatic-drag-and-drop` that integrate with the `InteractionManager`.

### 2. Pull-Based Reactivity

Components now "pull" their interaction state from the manager using `$derived`:

```typescript
let interactionState = $derived(interactionManager.getComponentState(block.id));
```

This ensures that components are purely reactive to the central state, eliminating "push" logic where actions manually update component state.

### 3. Edge Detection & Visual Fidelity

We integrated `closest-edge` detection into the `InteractionSession`.

- The `dnd.ts` adapter calculates the closest edge during drag.
- It updates `session.activeEdge`.
- `InteractionManager` exposes this edge in `ComponentState`.
- Components (`Block.svelte`, `Tray.svelte`) use `interactionState.edge` to render `<DropIndicator />`.

### 4. Component Refactoring

- **`Block.svelte`**: Refactored to use `use:interactionTarget` and `interactionState`. Removed local `dragCtx` usage for drop indicators.
- **`Tray.svelte`**: Refactored to use `interactionState` for drop indicators in the program list. Kept `monitorForElements` for game logic (model updates) and variable dragging.

### 5. Editor Logic Extraction (`EditorState`)

We extracted the complex "Click-Click" interaction logic (Move, Copy, Paste, Ghosts) from `Tray.svelte` into a headless `EditorState` class.

- **`EditorState`**: Manages high-level editor modes (`idle`, `move`, `paste`) and the "Ghost" logic (recursive placement of placeholders).
- **TDD Approach**: We implemented `EditorState` using Test-Driven Development, ensuring robust logic for recursive ghost insertion and complex move/paste operations before integrating with the UI.
- **UI Integration**: `Tray.svelte` was refactored to delegate all state transitions and interaction logic to `editorState`, removing fragile local state.

## Technical Decisions

- **Singleton Manager**: We used a singleton `interactionManager` for simplicity, as there is only one active interaction context in the game.
- **Hybrid Approach for Tray**: We kept `monitorForElements` in `Tray.svelte` for the "Controller" logic (executing drops) while moving the "View" logic (indicators) to the `InteractionManager`. This provides a clean separation of concerns.
- **Edge in State**: We added `edge` to `ComponentState` to ensure that visual indicators are driven by the same reactive source as other interaction states.
- **Headless Editor**: By moving editor logic to `EditorState`, we made it testable without a DOM environment.

### 6. Focus Management

We implemented a `FocusManager` to handle keyboard navigation and accessibility.

- **`FocusManager`**: A singleton that manages focus traversal (Next/Prev) based on the `InteractionRegistry`.
- **Keyboard Support**: `Tray.svelte` now listens for Arrow keys to navigate between interactive elements.
- **Component API**: The `ComponentInterface` was extended to include a `focus()` method, allowing the manager to imperatively focus DOM elements without direct DOM access.

### 7. Native Modality Standardization

We enforced the "Native Modality" axiom by refactoring all custom overlay components to use native web standards.

- **`<dialog>`**: Replaced all `div.overlay` and `div.backdrop` implementations with native `<dialog>` elements.
  - `WinModal`, `GoalModal`, `ShareModal`, `P2PModal`, `BuilderGoalModal`.
  - Leveraged `::backdrop` for consistent styling.
  - Used `$effect(() => dialog.showModal())` for lifecycle management.
- **`popover`**: Adopted the Popover API for lightweight overlays.
  - `ToastContainer`: Converted to `popover="manual"` to avoid `z-index: 9999`.
  - `BuilderGoalModal`: Updated biome picker to use `popover="auto"`.
- **Z-Index Cleanup**: Removed "z-index hacks" from `BuilderStoryBar` and `+page.svelte`, relying on natural stacking contexts and top-layer promotion where appropriate.

## Technical Decisions

- **Singleton Manager**: We used a singleton `interactionManager` for simplicity, as there is only one active interaction context in the game.

## Testing

We implemented a comprehensive testing strategy for the interaction system:

- **Unit Tests (`dnd.svelte.test.ts`)**: Verified the `draggableSource` and `dropTarget` adapters in a browser-like environment using `vitest-browser-svelte`.
- **Integration Tests (`Block.svelte.test.ts`, `Tray.svelte.test.ts`)**: Verified that UI components correctly register with the `InteractionManager` and reflect state changes (selection, ghosts, drop indicators).
- **Logic Tests (`editor.test.ts`, `interactions.test.ts`)**: Verified the core state machines and business logic in isolation.

## Next Steps

- Proceed to Phase Transition.
