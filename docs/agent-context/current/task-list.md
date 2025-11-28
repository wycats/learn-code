# Phase 5 Task List

- [x] **Technical Refactor**
  - [x] Create `ReactiveMap` pattern / methods in `GameModel`.
  - [x] Update `StackInterpreter` to use in-place updates.
  - [x] Verify reactivity (green checks/badges) still works.

- [x] **UI/UX: Persistent Tutorial**
  - [x] Design `InstructionBar` component.
  - [x] Update `+page.svelte` layout (Grid rows).
  - [x] Replace `Dialogue` modal with `InstructionBar`.

- [x] **Interaction: Spotlights**
  - [x] Add `highlight` support to `StorySegment` schema.
  - [x] Implement visual highlighting (CSS class/overlay) for Blocks and Grid Cells.

- [x] **UI/UX: Layout Stability**
  - [x] Create fixed-height Dashboard area.
  - [x] Implement `StatusPanel` for non-story states.
  - [x] Center stage and fix layout shifts.

- [x] **Interaction: Triggers**
  - [x] Add `advanceCondition` to `StorySegment`.
  - [x] Wire up game events (Drag, Drop, Run) to Story engine.

- [x] **Polish**
  - [x] Visual cleanup (Dashboard, Modals, Tray).
  - [x] Explicit loop count on blocks.
  - [x] Fix story-to-planning transition layout shift.
  - [x] Character CSS transitions (smooth movement).
  - [x] Win state animations.
