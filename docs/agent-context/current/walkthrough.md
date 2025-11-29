# Phase 9: The Tile Lab - Walkthrough

## Overview
In this phase, we implemented the "Tile Lab," a feature that allows users to create custom terrain tiles with unique visuals and behaviors. This transforms the game from a static set of blocks into a customizable platform where users can design their own hazards, slippery surfaces, and decorative elements.

## Key Changes

### 1. Data Schema (`src/lib/game/schema.ts`)
We introduced a `TileDefinition` schema to define custom tiles:
- **Identity**: `id`, `name`.
- **Behavior**: `type` (floor, wall, hazard, ice, water).
- **Visuals**: `color`, `pattern` (future), `decal` (icon).

We also updated the `LevelDefinition` to include a `customTiles` registry, mapping IDs to `TileDefinition` objects.

### 2. Rendering Engine (`src/lib/components/game/Cell.svelte`)
The `Cell` component was upgraded to support dynamic rendering based on `TileDefinition`.
- It now accepts a `customTile` prop.
- It dynamically applies `background-color` and renders Lucide icons as decals.
- It maintains backward compatibility with standard cell types (`grass`, `wall`, etc.).

### 3. Physics & Logic (`src/lib/game/mimic.ts`)
The `StackInterpreter` was updated to handle the new tile behaviors:
- **Hazards**: Moving onto a hazard tile immediately fails the level with a "Hazard!" error.
- **Ice**: Moving onto an ice tile triggers a sliding mechanic. The character continues moving in the current direction until they hit a wall, a non-ice tile, or a hazard.

### 4. Builder UI
We added a comprehensive UI for managing custom tiles:
- **Tile Editor (`src/lib/components/builder/TileEditorModal.svelte`)**: A modal interface for creating and editing tiles.
    - **Interaction Design**: Refined to use "Modern Matte" styling with popover menus for color/decal selection to reduce clutter.
    - **Native HTML APIs**: Refactored to use `<dialog>` for the modal and the `popover` API for satellite menus, ensuring better accessibility and standard browser behavior without custom state management.
    - **Inline Editing**: Tile names can be edited directly in the header for a seamless experience.
- **Builder Tray Integration (`src/lib/components/builder/BuilderTray.svelte`)**: Added a new "Tiles" tab to the builder tray. This allows users to:
    - View their custom tiles.
    - Create new tiles.
    - Edit or delete existing tiles.
    - Select a tile to paint onto the grid.
- **Toolbar Integration (`src/lib/components/builder/BuilderToolbar.svelte`)**:
    - Updated the main terrain picker to dynamically include custom tiles.
    - Custom tiles appear with their assigned icon and color in the dropdown.

### 5. Builder Model (`src/lib/game/builder-model.svelte.ts`)
Updated the `BuilderModel` to:
- Initialize the `customTiles` registry for new levels.
- Handle the selection of custom tiles as the active painting tool.

## Verification
- **Rendering**: Custom tiles render correctly in both the editor preview and the game grid.
- **Logic**: Hazards kill the player, and ice causes sliding as expected.
- **Persistence**: Custom tiles are saved as part of the level definition.
- **Content**: Created "The Gauntlet" (Level 9) to showcase the new mechanics.

## Next Steps
- **Patterns**: Implement SVG patterns for tiles (currently placeholder).
- **Water Logic**: Implement swimming/drowning logic for water tiles (currently treated as walls or visual-only depending on context).
- **Playtesting**: extensive testing of the sliding mechanics in complex layouts.
