# Phase 38: The Terrain Architect

**Goal:** Empower the Architect to create complex custom terrain with configurable properties directly in the Builder, enabling "Hybrid" tiles and new mechanics.

## High-Level Outline

### 1. Tile Editor Upgrade

We will enhance the "Badge Maker" (Tile Editor) to allow configuring the _behavior_ of tiles, not just their look.

- **UI**: Add a "Behavior" tab or section.
- **Controls**: Dropdowns/Selectors for `passableBy` and `onEnter`.
- **Component**: Implement the `DialInput` for numeric values (Axiom 13).

### 2. Visual Feedback

Architects need to see what a tile _does_ at a glance.

- **Overlays**: Small icons rendered on top of tiles in the Builder Palette and Grid.
- **Context**: These should only be visible in Builder Mode.

### 3. The "Void" Experience

Falling into a hole should feel different from hitting a spike.

- **Animation**: A CSS/Svelte transition scaling the character down to 0.
- **Timing**: Pause the game loop briefly to let the animation play before resetting.

### 4. Props & Hybrid Tiles

- **Props**: Static tiles that are just obstacles (Trees, Rocks).
- **Hybrid**: A "Wall" that acts like a "Door" (requires Key).

## Implementation Steps

1.  **Schema & Backend**: Verify `src/lib/schema/` for `CellType` properties.
2.  **Components**:
    - Create `src/lib/components/builder/DialInput.svelte`.
    - Update `src/lib/components/builder/TileEditor.svelte`.
    - Update `src/lib/components/game/Tile.svelte` (or `TileRenderer`) to support overlays.
3.  **Game Logic**:
    - Update `src/lib/game/Engine.ts` (or `Actor.ts`) to handle the "Shrink" state.
4.  **Assets**: Add Tree/Rock/Door graphics if missing (or use generated/emoji placeholders).
