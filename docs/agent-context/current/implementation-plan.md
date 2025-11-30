# Implementation Plan: Builder Refinement & Targeting

## Phase Goal

Enhance the Level Builder with precise targeting capabilities, pack-wide asset management, and further UX polish ("whimsy").

## 1. Schema & Data Model

- [x] **Update Schemas** (`src/lib/game/schema.ts`)
  - [x] Replace `highlight` with `targets: string[]` in `HintSchema` and `StorySegmentSchema`.
  - [x] Define target ID formats (`block:<uuid>`, `cell:<x>,<y>`, `ui:<id>`).
- [x] **Migration**: Ensure existing levels (if any dynamic ones exist) are compatible or migrated.

## 2. Targeting System ("Pick Mode")

- [x] **Selection State**: Create a store/context to manage "Selection Mode" state (active, selected items).
- [x] **Builder UI**:
  - [x] Add "Target" button to `HintEditor`.
  - [x] Add "Target" button to `StoryEditor`.
  - [x] Implement "Selection Overlay" or interaction layer on the Game/Grid.
  - [x] Allow clicking Blocks (in Tray and Workspace) and Cells to select them.
  - [x] Show selected targets as "chips" in the editor.
- [x] **Game Runtime**:
  - [x] Update `HintManager` to process `targets`.
  - [x] Implement visual highlighting (pulse/border) for targeted elements in the Game View.

## 3. Pack-Wide Assets

- [x] **Pack Settings UI**:
  - [x] Create `PackAssetsEditor` component.
  - [x] Allow adding/editing/deleting Characters (Name, Color, Avatar).
  - [x] Allow adding/editing/deleting Emotions (Name, Icon).
- [x] **Inheritance Logic**:
  - [x] Update `LevelDefinition` usage to merge Pack assets with Level assets.
  - [x] Ensure "None" mood is available by default.

## 4. UX Polish

- [x] **"None" Mood**: Ensure `none` emotion renders correctly (no icon) in Story/Dialogue views.
- [ ] **Whimsy**: Continue refining sounds and visuals (e.g., particle effects on clear?).

## 5. Verification

- [x] **Test**: Verify targeting works for Blocks, Cells, and UI.
- [x] **Test**: Verify Pack assets appear in new levels.
