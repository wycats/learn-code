# Implementation Plan: Builder Refinement & Targeting

## Phase Goal
Enhance the Level Builder with precise targeting capabilities, pack-wide asset management, and further UX polish ("whimsy").

## 1. Schema & Data Model
- [ ] **Update Schemas** (`src/lib/game/schema.ts`)
    - [ ] Replace `highlight` with `targets: string[]` in `HintSchema` and `StorySegmentSchema`.
    - [ ] Define target ID formats (`block:<uuid>`, `cell:<x>,<y>`, `ui:<id>`).
- [ ] **Migration**: Ensure existing levels (if any dynamic ones exist) are compatible or migrated.

## 2. Targeting System ("Pick Mode")
- [ ] **Selection State**: Create a store/context to manage "Selection Mode" state (active, selected items).
- [ ] **Builder UI**:
    - [ ] Add "Target" button to `HintEditor` and `StoryEditor`.
    - [ ] Implement "Selection Overlay" or interaction layer on the Game/Grid.
    - [ ] Allow clicking Blocks (in Tray and Workspace) and Cells to select them.
    - [ ] Show selected targets as "chips" in the editor.
- [ ] **Game Runtime**:
    - [ ] Update `HintManager` to process `targets`.
    - [ ] Implement visual highlighting (pulse/border) for targeted elements in the Game View.

## 3. Pack-Wide Assets
- [ ] **Pack Settings UI**:
    - [ ] Create `PackAssetsEditor` component.
    - [ ] Allow adding/editing/deleting Characters (Name, Color, Avatar).
    - [ ] Allow adding/editing/deleting Emotions (Name, Icon).
- [ ] **Inheritance Logic**:
    - [ ] Update `LevelDefinition` usage to merge Pack assets with Level assets.
    - [ ] Ensure "None" mood is available by default.

## 4. UX Polish
- [ ] **"None" Mood**: Ensure `none` emotion renders correctly (no icon) in Story/Dialogue views.
- [ ] **Whimsy**: Continue refining sounds and visuals (e.g., particle effects on clear?).

## 5. Verification
- [ ] **Test**: Verify targeting works for Blocks, Cells, and UI.
- [ ] **Test**: Verify Pack assets appear in new levels.
