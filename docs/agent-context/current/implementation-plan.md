# Phase 8 Implementation Plan: Level Builder

## Goal
Create an in-game editor that allows users to design, test, and export custom levels with a "Super Mario Maker" feel—seamless, tactile, and integrated.

## 1. Foundation & State
- [ ] **Route Setup**: Create `/builder` route.
- [ ] **Builder Model**: Implement `BuilderModel` using Svelte 5 Runes.
  - Wraps a `LevelDefinition`.
  - Tracks `activeTool` (e.g., 'wall', 'goal').
  - Tracks `mode` ('edit' | 'test').
- [ ] **Canvas Interaction**: Update `Grid.svelte` (or create a wrapper) to handle click/drag events when in "Edit Mode".

## 2. The Builder Tray (UI)
- [ ] **Tool Palette**: Create a UI component to select tools.
  - **Terrain**: Grass, Water, Wall.
  - **Actors**: Start Position, Goal.
- [ ] **Configuration Panel**: UI to set level properties (Name, Size).
- [ ] **Backpack (Block Config)**: UI to define `availableBlocks` and `maxBlocks`.

## 3. Story Editor (Script)
- [ ] **Chat UI**: Create a component to list and edit `StorySegment`s.
- [ ] **Inline Editing**: Allow editing text, speaker, and emotion directly in the list.
- [ ] **Reordering**: Implement drag-and-drop reordering for script rows.

## 4. Interaction & Polish
- [ ] **Painting**: Implement "drag to paint" and "click-click" range painting for terrain.
- [ ] **Feedback**: Add sound effects and visual cues for placing elements.
- [ ] **Mode Switching**: Implement smooth transitions between "Edit" and "Test" modes.

## 5. Test Mode Enhancements
- [ ] **Cheats**: Implement Teleport (drag character) and Rotate (tap character) in Test Mode.
- [ ] **Onion Skinning**: Visualize previous character positions during execution.

## 6. Serialization
- [ ] **Export**: Button to download/copy the current level as JSON.
- [ ] **Import**: Ability to paste JSON to load a level.
- [ ] **Persistence**: Auto-save to `localStorage` so work isn't lost on refresh.
