# Task List: Phase 27

## Analysis & Design

- [x] Analyze current `dnd.ts` and identify common patterns.
- [x] Analyze `Tray.svelte` and `Block.svelte` for "Click-Click" logic duplication.
- [x] Propose a new directory structure for shared interaction primitives.
- [x] **STOP**: Review the proposed architecture with the user.

## Implementation: Interaction Primitives

- [x] Define `InteractionRole` and `DataType` types.
- [x] Implement `InteractionRegistry` (Logical & Visual).
- [x] Implement `InteractionSession` (State Machine).
- [x] Implement `InteractionManager` (Orchestrator).
- [x] Implement `use:interactionTarget` Svelte Action.
- [x] Refactor Drag & Drop adapters into a unified system.
- [x] Extract "Click-Click" state machine into a reusable store or class.
- [x] Implement Focus Management primitive.

## Implementation: UI Components

- [x] Refactor `Block.svelte` to use new primitives.
- [x] Refactor `Tray.svelte` to use new primitives.
- [x] Standardize Modal components (Native `<dialog>` & `popover`).

## Testing

- [x] Unit tests for Drag & Drop primitives.
- [x] Unit tests for Click-Click logic.
- [x] Unit tests for Focus Management.
- [x] Integration tests for `Tray` and `Block` using new components.
