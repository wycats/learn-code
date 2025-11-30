# Phase 15 Implementation Plan: Advanced Builder Features

## Goal
Empower "The Architect" with advanced tools to create complex, rich, and shareable learning experiences. This phase focuses on introducing Functions (Magic Blocks) into the Builder, adding new gameplay mechanics (Hazards), polishing the UI with "Jonas's Wishlist", and enabling local file system access for easier sharing.

## 1. Functions in Builder (Magic Blocks)
**Objective**: Allow level designers to create and edit custom functions (Magic Blocks) that players can use or that serve as pre-defined subroutines.

- [ ] **Data Model Update**:
    - Update `LevelSchema` to support a `functions` registry.
    - Each function needs: `id`, `name`, `icon`, `program` (list of blocks).
- [ ] **Builder UI**:
    - Add a "Functions" manager in the Builder interface (likely in the Palette or a new "Logic" tab).
    - **Create/Edit Function**: A modal or secondary workspace to compose the function's code.
    - **Usage**: Once defined, the function appears as a usable block in the "Available Blocks" palette.

## 2. New Mechanics: Hazards
**Objective**: Introduce "Spikes" (or generic hazards) to add a survival element to puzzles.

- [ ] **Tile System**:
    - Add `Hazard` to `CellType` or a new `Overlay` layer?
    - Let's stick to `CellType` for now: `Spikes` (toggleable?).
- [ ] **Interpreter**:
    - Update `move` logic to check for hazards.
    - If robot enters a hazard tile -> `FAIL` state with specific animation/message.
- [ ] **Builder Support**:
    - Add Hazard tiles to the Terrain painter.

## 3. Jonas's Wishlist (Polish)
**Objective**: Add high-value visual polish and metadata features requested by the primary stakeholder.

- [ ] **Difficulty Indicators**:
    - Add `difficulty` field (1-5) to `LevelSchema` and `PackSchema`.
    - Display as stars/icons on `LevelCard` and `PackCard`.
- [ ] **Selectable Icons**:
    - Create an `IconPicker` component.
    - Use it in Level Settings and Pack Settings to customize the thumbnail/icon.
- [ ] **Speaker Avatars**:
    - Update `DialogueStep` schema to include `avatar` (string/enum).
    - Update `InstructionBar` to display the avatar alongside the text.

## 4. Local File System Access (Project Fugu)
**Objective**: Allow Architects to own their data by saving/loading packs directly to their local file system.

- [ ] **File System API**:
    - Implement `savePackToDisk(pack)` using `showSaveFilePicker`.
    - Implement `loadPackFromDisk()` using `showOpenFilePicker`.
- [ ] **UI Integration**:
    - Add "Import" and "Export" buttons to the Architect's Library.

## Execution Order
1.  **Functions**: This is the most complex technical task and affects the data model significantly.
2.  **Hazards**: A fun mechanic that expands the puzzle space.
3.  **Wishlist**: Visual polish that makes the builder feel more "pro".
4.  **File System**: A standalone feature for power users.
