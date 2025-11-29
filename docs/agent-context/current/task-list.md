# Task List: Phase 9 - The Tile Lab

- [x] **Data-Driven Terrain**
  - [x] Update `src/lib/game/schema.ts` with `TileDefinition`.
  - [x] Update `LevelSchema` to include `customTiles` registry.
  - [x] Refactor `Grid.svelte` to use dynamic tile lookup.
  - [x] Create default tile registry (migration for existing 'wall', 'water', etc.) - *Handled via backward compatibility in Cell.svelte*.

- [x] **Mechanics**
  - [x] Implement `Hazard` logic in `GameModel` (collision detection).
  - [x] Implement `Ice` logic in `GameModel` (sliding movement).
  - [ ] Add visual feedback for Hazard death (particle effect or animation).

- [x] **Tile Designer UI**
  - [x] Create `TileEditorModal.svelte`.
  - [x] Implement Color Picker (using semantic tokens).
  - [x] Implement Pattern Picker (SVG assets) - *Placeholder for now*.
  - [x] Implement Decal Picker (Lucide icons).
  - [x] Add "Manage Tiles" button to `BuilderTray`.
  - [x] Refactor to use Native HTML APIs (`<dialog>`, `popover`).

- [x] **Builder Integration**
  - [x] Update `BuilderModel` to handle custom tile selection.
  - [x] Ensure `drag-to-paint` works with custom tile IDs.
  - [x] Update `Export/Import` to include custom tile definitions - *Automatic via Schema*.
  - [x] Add custom tiles to `BuilderToolbar` selector.

- [x] **Content**
  - [x] Create "The Gauntlet" demo level.
  - [x] Verify backward compatibility with old levels.
