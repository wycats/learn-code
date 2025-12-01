# Implementation Plan: The Architect's Polish (Phase 19)

## Phase Goal

Refine the Builder and Game experience based on direct feedback from our primary persona, Jonas. This phase focuses on visual polish, builder usability enhancements, and content refinement.

## 1. Visual Polish

- [ ] **Player Occlusion**: Implement a "Cover" block style (Glassomorphism) when the player character is behind a block to ensure visibility.
- [ ] **Icon Updates**: Replace the "Clear Blocks" icon with a "Broom" (add to Lucide if needed or find alternative).
- [ ] **Builder UI Cleanup**: Remove the redundant tile dropdown in the Level Editor now that we have the dedicated Tile Editor.

## 2. Builder Enhancements

- [ ] **Repeat Block**: Allow users to input a custom repeat count instead of selecting from a preset list.
- [ ] **Targeting**:
  - [ ] Enable targeting of the "Repeat Count" specifically in Story Mode.
  - [ ] Enable targeting of the "Function Name" specifically in Story Mode.
  - [ ] Disable/Hide targeting for "Infinity" loop count as it's not a visible element in the same way.
- [ ] **Text Updates**: Change "Use current workspace" to "Use test level" for clarity.
- [ ] **Story Editor**: Implement reordering for story segments (Drag & Drop or Up/Down buttons).
- [ ] **Undo/Redo**: Implement Undo/Redo functionality for the Level Editor (placing tiles, actors, etc.).

## 3. Function UX

- [ ] **Empty State**: Improve the "Call ???" block behavior. If no functions are defined, it should be disabled or show a helpful tooltip/state instead of being active but broken.

## 4. Content Polish

- [ ] **Gauntlet Pack**: Refine the "Gauntlet" levels to feel more cohesive and designed.
- [ ] **New Pack**: Create a "Hard" built-in pack with a Purple theme to challenge advanced players.

## 5. Verification

- [ ] **Visual Tests**: Update visual tests to capture the new "Cover" block style and Builder UI changes.
- [ ] **Playtest**: Verify the new "Hard" pack and Gauntlet improvements.
