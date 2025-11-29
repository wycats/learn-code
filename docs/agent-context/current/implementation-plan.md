# Implementation Plan - Phase 9: The Tile Lab

**Goal:** Empower users to customize the game world, fostering ownership and creativity.
**Success Criteria:** Create a custom level featuring at least 3 custom tile types (e.g., "Lava", "Ice", "Gold Brick") and successfully play through it.

## 1. Data-Driven Terrain Engine

Refactor the hardcoded `CellType` system to support dynamic properties.

- [ ] **Schema Update**:
  - [ ] Define `TileDefinition` schema:
    - `id`: string (unique)
    - `name`: string
    - `type`: 'wall' | 'floor' | 'hazard' | 'water' | 'ice'
    - `visuals`:
      - `color`: string (css var or hex)
      - `pattern`: string (svg id)
      - `decal`: string (icon name)
  - [ ] Update `LevelSchema` to include a `tiles` registry (map of ID -> Definition).
  - [ ] Update `Grid` component to render cells based on the registry lookup, not just CSS classes.

## 2. The Tile Designer (UI)

A "Badge Maker" interface for creating custom terrain.

- [ ] **Tile Editor Modal**:
  - [ ] **Preview**: Large, live preview of the tile being designed.
  - [ ] **Base Layer**: Color picker (using our semantic palette).
  - [ ] **Pattern Layer**: Grid of SVG patterns (Bricks, Waves, Dots, Pavers).
  - [ ] **Decal Layer**: Icon picker (Lucide icons).
  - [ ] **Behavior**: Dropdown to select physics (Wall, Floor, Hazard, Ice).
- [ ] **Builder Integration**:
  - [ ] Add "Edit Tiles" button to the Terrain section of the `BuilderTray`.
  - [ ] Allow selecting custom tiles to paint with.

## 3. New Mechanics (Hazards & Physics)

Implement the behaviors for the new tile types.

- [ ] **Hazards (Spikes/Lava)**:
  - [ ] Update `GameModel` movement logic.
  - [ ] If character enters a `hazard` tile -> Trigger "Loss" state (burn/spike animation).
- [ ] **Ice (Sliding)**:
  - [ ] Update `GameModel` movement logic.
  - [ ] If character enters `ice` -> Continue moving in the same direction until hitting a non-ice tile or wall.
  - [ ] Visuals: Slide animation (faster, no step delay).
- [ ] **Water (Optional/Stretch)**:
  - [ ] Fatal unless character has "Boat" status (future). For now, treat as Hazard or Wall depending on design.

## 4. Content & Polish

- [ ] **Default Tiles**: Create a set of nice presets (Grass, Dirt, Stone, Water, Lava).
- [ ] **Demo Level**: "The Gauntlet" - A level showcasing Ice slides and Lava pits.

## Execution Order

1.  **Schema & Engine**: Refactor `CellType` to be data-driven.
2.  **Mechanics**: Implement Hazard and Ice logic (using hardcoded test tiles).
3.  **UI**: Build the Tile Designer to let users create these tiles.
4.  **Integration**: Connect the UI to the Level data.
