# Phase 15 Task List

## 1. Functions in Builder
- [x] **Schema**: Update `LevelSchema` (and Zod validators) to include `functions`.
- [x] **State**: Update `BuilderModel` to manage the list of defined functions.
- [x] **UI - Manager**: Create a `FunctionManager` component in the Builder sidebar.
- [x] **UI - Editor**: Create a `FunctionEditor` modal/view to compose the function's body.
- [x] **Integration**: Ensure defined functions appear in the "Available Blocks" list for the level.

## 2. Hazards
- [x] **Schema**: Add `SPIKES` to `CellType` enum.
- [x] **Rendering**: Add a visual representation for Spikes in `GridCell.svelte`.
- [x] **Logic**: Update `Interpreter` to handle death-by-hazard.
- [x] **Builder**: Add Spikes to the Terrain palette.

## 3. Jonas's Wishlist
- [ ] **Difficulty**: Add `difficulty` to schemas and display it on cards.
- [ ] **Icons**: Build `IconPicker` and integrate into Level/Pack settings.
- [ ] **Avatars**: Update `Dialogue` schema and `InstructionBar` to support avatars.

## 4. Local File System
- [ ] **Service**: Create `FileSystemService` to wrap the File System Access API.
- [ ] **UI**: Add Import/Export buttons to `Library` page.
