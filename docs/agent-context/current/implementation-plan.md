# Implementation Plan - Phase 28: Test Coverage & Quality Assurance

## Goal

Increase test coverage to a respectable level (e.g., 70%+) to ensure stability and prevent regressions.
Focus on core logic and critical services.

## Current Coverage Baseline (Statements)

- `src/lib/game/model.svelte.ts`: 81.4% (Good)
- `src/lib/game/builder-model.svelte.ts`: 67.3% (Target: > 80%)
- `src/lib/game/mimic.ts`: 67.9% (Target: > 80%)
- `src/lib/game/sound.ts`: 14.8% (Target: > 50%)
- `src/lib/services/file-system.ts`: 44.3% (Target: > 70%)
- `src/lib/interactions/dnd.ts`: 11.1% (Target: > 50%)

## Proposed Changes

### 1. Builder Model (`src/lib/game/builder-model.svelte.ts`)

- **Goal**: Increase coverage to > 80%.
- **Tasks**:
  - Test `setTool` and tool switching logic.
  - Test `updateCell` and `updateActor` methods.
  - Test `undo`/`redo` specifically for builder state.
  - Test `serialize` and `deserialize` integration (if handled here).

### 2. Interpreter (`src/lib/game/mimic.ts`)

- **Goal**: Increase coverage to > 80%.
- **Tasks**:
  - Test error handling (hitting walls, invalid moves).
  - Test complex control flow (nested loops, function calls).
  - Test generator state transitions (yield points).

### 3. Sound Manager (`src/lib/game/sound.ts`)

- **Goal**: Increase coverage to > 50%.
- **Tasks**:
  - Mock `AudioContext` and `AudioBuffer`.
  - Test `playFile` and `playAmbient` logic (ensure calls are made).
  - Test mute/unmute state persistence.

### 4. File System Service (`src/lib/services/file-system.ts`)

- **Goal**: Increase coverage to > 70%.
- **Tasks**:
  - Mock `FileSystemHandle` API.
  - Test `savePack` and `loadPack` flows.
  - Test permission handling logic.

### 5. Drag and Drop Adapters (`src/lib/interactions/dnd.ts`)

- **Goal**: Increase coverage to > 50%.
- **Tasks**:
  - Test `draggable` and `dropTarget` adapter creation.
  - Test event mapping (dragstart, drop).

### 6. Visual Regression Expansion

- **Goal**: Expand visual coverage to include critical interactions and mobile states.
- **Tasks**:
  - **Mobile Layouts**: Verify stacked layouts for Game and Builder on mobile viewports.
  - **Builder Interactions**: Capture "Drag Active" and "Hover" states if possible.
  - **Modals**: Add snapshots for `P2PModal`, `ShareModal`, and `SettingsModal`.
  - **Dark Mode**: Ensure specific components (like the new Glassomorphism panels) are verified in dark mode.

## Verification Plan

- Run `pnpm test:unit` after each module update to verify coverage increase.
- Ensure no regressions in existing tests.
- Run `pnpm test:visual` and verify new snapshots are generated and match expectations.
