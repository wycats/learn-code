# Implementation Plan: Test Coverage & Quality Assurance

## Phase Goal

Increase test coverage to a respectable level (aiming for >50% initially, then >70%) to ensure stability and prevent regressions.

## 1. Coverage Analysis & Strategy

We currently have ~15% coverage. The goal is to systematically improve this by targeting high-value, high-risk areas first.

### Priority Areas

1.  **Core Game Logic (`src/lib/game`)**:
    - `model.svelte.ts`: The heart of the application. Needs thorough testing of state transitions, history (undo/redo), and level loading.
    - `interpreter.ts`: The execution engine. Needs to cover all block types and edge cases (already partially covered).
    - `analysis.ts`: Static analysis of user code.

2.  **Core UI Components (`src/lib/components/game`)**:
    - `Block.svelte`: The fundamental building block. Needs tests for rendering, interaction (click, drag), and state reflection (blocked, success).
    - `Tray.svelte`: The palette and program area. Needs tests for drag-and-drop, selection, and toolbar actions.
    - `Game.svelte`: The main game container. Needs integration tests for the game loop.

3.  **Services (`src/lib/services`)**:
    - `file-system.ts`: Persistence layer.

## 2. Testing Infrastructure

- **Vitest**: Our unit test runner.
- **Vitest Browser Mode**: For testing Svelte components in a real browser environment (headless Chromium).
- **Playwright**: For E2E tests (already set up).

## 3. Execution Plan

### Step 1: Core Logic Hardening

- Write comprehensive tests for `GameModel`.
- Expand `StackInterpreter` tests to cover new block types (PickUp, Variables).

### Step 2: Component Testing

- Expand `Tray.svelte` tests (started in Phase 25).
- Create `Block.svelte` tests.
- Create `Game.svelte` integration tests.

### Step 3: Threshold Tuning

- Incrementally raise the coverage thresholds in `vite.config.ts` as we add tests.
- Final Goal: 50% Statements/Branches/Functions/Lines.

## 4. Success Criteria

- `pnpm test:unit` passes with new thresholds.
- Critical paths (Game Loop, Level Editing, Persistence) are covered.
- No regressions in existing functionality.
