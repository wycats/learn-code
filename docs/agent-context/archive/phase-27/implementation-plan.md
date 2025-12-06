# Implementation Plan - Phase 27: Component Architecture & Shared Abstractions

## Goal

Extract shared interaction patterns into reusable components and test them rigorously. This phase focuses on refactoring the codebase to improve maintainability, reduce duplication, and ensure consistent behavior across the application.

## Scope

- **Interaction Primitives**: Extract core interaction logic (Click-Click, Drag, Focus) into reusable Svelte actions or components.
- **UI Components**: Identify and refactor shared UI patterns (e.g., Buttons, Modals, Tooltips) into the `src/lib/components/common` directory.
- **Testing**: Implement comprehensive unit and interaction tests for the new shared components.

## Key Components to Refactor

1.  **Interaction Logic**:
    - `draggableBlock` / `draggableVariable` -> Unified Drag Source
    - `dropTarget` / `dropTargetForVariable` -> Unified Drop Target
    - "Click-Click" Selection Logic (currently in `Tray.svelte` and `Block.svelte`)
    - Focus Management (Keyboard Navigation)

2.  **UI Patterns**:
    - `BlockComponent` (ensure it uses shared primitives)
    - `Tray` (Toolbar buttons, Palette items)
    - Modals (Standardize on a single Modal primitive)

## User Involvement

- **Collaborative Design**: The user has requested deep involvement in the extraction and structuring process. We will stop for feedback before finalizing major architectural decisions.

## Verification Plan

- **Unit Tests**: Verify each new shared component in isolation.
- **Integration Tests**: Ensure refactored components work correctly in the Game and Builder contexts.
- **Visual Regression**: Verify no visual regressions in the UI.
