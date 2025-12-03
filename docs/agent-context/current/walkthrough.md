# Phase 28 Walkthrough: Test Coverage & Quality Assurance

## Overview

This phase focuses on hardening the codebase by increasing test coverage and ensuring critical flows are protected against regressions. We will analyze the current coverage, identify gaps, and systematically add unit and integration tests.

## Progress

### Coverage Analysis

- [x] Initial coverage report generated.
- [x] Targets identified: `BuilderModel`, `GameModel`, `StackInterpreter`.

### Refactoring for Testability

- [x] Refactored `FileSystemService` to use Dependency Injection.
  - Created `FileSystemService` interface.
  - Renamed original implementation to `BrowserFileSystemService`.
  - Created `InMemoryFileSystemService` for testing.
- [x] Refactored `PersistenceService` consumers to use singleton instance.
  - Updated `PackManagerModal` and `CampaignService` to use `persistence` singleton instead of deprecated standalone functions.

### Unit Tests

- [x] `BuilderModel` tests created and passing.
  - Added comprehensive tests for grid manipulation, tool selection, and level metadata.
  - Used `InMemoryFileSystemService` to test persistence without browser APIs.
- [x] `StackInterpreter` tests expanded.
  - Added tests for error handling (hitting walls, invalid moves).
  - Added tests for complex control flow (nested loops, function calls).
  - Added tests for game mechanics (hazards, ice, pick-up).
- [x] `SoundManager` tests expanded.
  - Mocked `AudioContext` and `AudioBuffer`.
  - Tested `playFile` and `playAmbient` logic.
  - Tested mute/unmute state persistence.
- [x] `Drag and Drop` adapters tested.
  - Mocked `@atlaskit/pragmatic-drag-and-drop`.
  - Verified interaction with `interactionManager`.

### Visual Regression Tests

- [x] Expanded `visual-suite.spec.ts`.
  - Added tests for Mobile Viewports (Game & Builder).
  - Added tests for Modals (Share, Settings).
  - Added tests for Dark Mode.

### CI Enforcement

- [x] Thresholds updated in `vite.config.ts`.
  - Enforced high coverage for critical logic files (`mimic.ts`, `sound.ts`, `model.svelte.ts`, `dnd.ts`).

### Final Polish & Fixes

- [x] Fixed `FileSystemService` tests.
  - Recreated `file-system.test.ts` to fix corruption.
  - Aligned mock types with `FileSystemDirectoryHandle` interface.
- [x] Resolved Linting & Type Errors.
  - Fixed `no-explicit-any` in `sound.test.ts` and `schema.ts`.
  - Fixed `no-unused-vars` in `file-system.test.ts` and `memory.ts`.
  - Fixed `builder-model.test.ts` to match `LevelPack` schema (`name` vs `title`).
