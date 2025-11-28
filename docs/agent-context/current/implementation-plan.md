# Phase 4 Implementation Plan: Content & Curriculum

## Objective

Develop the first narrative-driven learning module, introducing "Loop" blocks and the "Stop & Go" pedagogical framework.

## Detailed Steps

### Step 1: Loop Block Logic & UI (The "Again" Block) (Completed)

- [x] **Data Model**: Update `Block` interface to support nested children.
- [x] **Interpreter**: Update `Mimic` to handle `Loop` blocks.
- [x] **UI Component**: Update `Block.svelte` for nested rendering.
- [x] **Interaction**: Refactor `Tray` for nested DnD.

### Step 2: Narrative System (The Story) (Completed)

- [x] **Types**: Define `StorySegment`.
- [x] **State**: Update `GameModel` for story state.
- [x] **Component**: Create `Dialogue.svelte`.
- [x] **Integration**: Trigger intro/outro.

### Step 2.5: Layout Refinement (Current)

**Goal:** Restructure the UI to eliminate global scrolling and optimize for touch/landscape.

- [ ] **Design**: Evaluate layout options (see `docs/design/layout-refinement.md`).
- [ ] **Implementation**: Refactor `+page.svelte` and `Tray.svelte` to implement the chosen layout (likely Two-Column).
- [ ] **Responsiveness**: Ensure it works on different aspect ratios.

### Step 3: Pedagogy UI (The Framework) (Completed)

**Goal:** Guide the user through the "Goal -> Plan -> Try" cycle.

- [x] **Goal View**: Create a "Goal" overlay that appears before the level starts (or after the intro).
- [x] **Phase Indicators**: Add clear visual cues for "Planning Mode" vs "Execution Mode".
- [x] **Feedback**: Enhance `Success` and `Failure` modals with growth-mindset oriented copy and "Try Again" / "Next Level" actions.

## Phase 4: Content & Curriculum

### Goal

Create a complete, narrative-driven learning module with 6 levels, a loop block, and a polished UI.

### Tasks

#### 1. Core Mechanics (Completed)

- [x] **Loop Block ("Again")**: Implement nested execution logic in `Mimic`.
- [x] **Block Limits**: Add `maxBlocks` constraint to Level schema and UI.
- [x] **Win/Loss States**: Add `WinModal` and collision feedback.

#### 2. Narrative System (Completed)

- [x] **Dialogue Component**: Create a specialized component for character speech.
- [x] **Story Integration**: Add `story` field to Level schema.

#### 3. Content Creation (Completed)

- [x] **Level 1-3**: Intro to movement.
- [x] **Level 4**: "The Bug" (Debugging).
- [x] **Level 5**: "Stairway" (Loops).
- [x] **Level 6**: "Big Zig Zag" (Complex Loops).

#### 4. UI Polish & Refactor (Completed)

- [x] **Layout**: Implement "IDE" 2-column layout.
- [x] **Controls**: Add "Stop" button.
- [x] **Drag and Drop Refactor (Pragmatic DnD)**:
  - [x] **Install**: `@atlaskit/pragmatic-drag-and-drop`.
  - [x] **Core Actions**: Create `draggable` and `dropTarget` Svelte actions.
  - [x] **Visuals**: Implement "Blue Line" drop indicator (No Layout Shift).
  - [x] **Nesting**: Implement header/bottom hover logic for Loops.
  - [x] **Toolbar/Trash**: Implement side toolbar with Trash Can (Select-to-delete & Drag-to-delete).
  - [x] **Cleanup**: Remove `SortableJS` and legacy DnD code.
- [x] **Interaction Polish**:
  - [x] **Click-to-Insert**: Add tap-based block insertion for better accessibility/usability.
  - [x] **Floating Toolbar**: Move Trash/Inspector to floating UI to prevent layout shifts.
  - [x] **Visual Fixes**: Center drop indicators and fix Loop block height.

### Step 5: Advanced Interaction (Multi-Select & Duplication) (Completed)

**Goal:** Enable power-user workflows for refactoring code.

- [x] **Multi-Select Logic**:
  - [x] Update `Tray.svelte` to track `Set<string>` for selection.
  - [x] Implement parent/child selection constraints (selecting parent selects children).
  - [x] Add "Multi-Select" toggle to Floating Toolbar.
- [x] **Bulk Actions**:
  - [x] **Delete**: Update `handleDeleteSelected` to remove all selected blocks.
  - [x] **Move (Drag)**: (Optional/Deferred) Support dragging multiple blocks. _Note: This is complex with the current DnD library._
- [x] **Duplication (Copy/Paste)**:
  - [x] **Clipboard State**: Add `clipboard` state to `Tray.svelte`.
  - [x] **Duplicate Action**: Add "Duplicate" button to toolbar.
  - [x] **Paste Mode**: Reuse "Ghost" logic to show paste preview.
  - [x] **Interaction**: Clicking a target pastes the clipboard contents.

#### 5. Final Review (Completed)

- [x] **Playtest**: Verify all levels are solvable and fun.
- [x] **Code Review**: Ensure strict typing and clean component hierarchy.

## Technical Considerations

- **Nested DnD**: This is the biggest technical risk. We might need to create a recursive `BlockList` component.
- **State Machine**: The `GameModel` state machine is getting more complex (`Story` -> `Goal` -> `Planning` -> `Running` -> `Success`/`Fail`). We need to ensure transitions are clean.
