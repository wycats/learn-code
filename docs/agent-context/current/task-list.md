# Phase 28: Test Coverage & Quality Assurance

**Goal:** Increase test coverage to a respectable level (e.g., 70%+) to ensure stability and prevent regressions.

## Tasks

- [x] **Coverage Analysis**
  - [x] Run coverage report and identify critical low-coverage areas.
  - [x] Prioritize areas based on risk and complexity.

- [x] **Builder Model (`src/lib/game/builder-model.svelte.ts`)**
  - [x] Test `setTool` and tool switching logic.
  - [x] Test `updateCell` and `updateActor` methods.
  - [x] Test `undo`/`redo` specifically for builder state.

- [x] **Interpreter (`src/lib/game/mimic.ts`)**
  - [x] Test error handling (hitting walls, invalid moves).
  - [x] Test complex control flow (nested loops, function calls).
  - [x] Test generator state transitions.
  - [x] Test game mechanics (hazards, ice, pick-up).

- [x] **Sound Manager (`src/lib/game/sound.ts`)**
  - [x] Mock `AudioContext` and `AudioBuffer`.
  - [x] Test `playFile` and `playAmbient` logic.
  - [x] Test mute/unmute state persistence.

- [x] **File System Service (`src/lib/services/file-system.ts`)**
  - [x] Refactor to Interface/Implementation pattern.
  - [x] Create `InMemoryFileSystemService` for testing.
  - [x] Test `savePack` and `loadPack` flows (via integration/fakes).

- [x] **Drag and Drop Adapters (`src/lib/interactions/dnd.ts`)**
  - [x] Test `draggable` and `dropTarget` adapter creation.
  - [x] Test event mapping.

- [x] **Visual Regression Expansion**
  - [x] Add tests for Mobile Layouts (Game & Builder).
  - [x] Add tests for Modals (P2P, Share, Settings).
  - [x] Add tests for Dark Mode specific components.

- [x] **CI Enforcement**
  - [x] Tune coverage thresholds in `vitest.config.ts` to block regressions.
  - [x] Ensure CI pipeline runs all tests and reports coverage correctly.
