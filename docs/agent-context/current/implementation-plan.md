# Phase 5 Implementation Plan: Interactive Pedagogy

## Objective

Transform the "Tutorial" from a passive reading experience into an interactive, non-blocking coaching system. Refine the technical architecture to support robust state management without reference-swapping pitfalls.

## Design Philosophy

- **"Don't Cover the Board"**: Instructions should live in the persistent space above the stage, allowing the user to read and act simultaneously.
- **"Show, Don't Just Tell"**: Use visual spotlights and highlights to guide attention to specific blocks or grid cells.
- **"In-Place Reactivity"**: State should be mutated in place, preserving object references to ensure stable reactivity and cleaner code.

## Detailed Steps

### Step 1: Technical Refactor (State Abstraction)

**Goal:** Encapsulate `executionState` and `loopProgress` to prevent reactivity bugs caused by reference swapping.

- [ ] **Create `ReactiveMap` Abstraction** (or usage pattern):
  - Instead of `game.executionState = new SvelteMap()`, implement `game.resetExecutionState()` and `game.restoreExecutionState(snapshot)`.
  - Ensure `GameModel` properties are `readonly` where possible to enforce this pattern.
- [ ] **Update `StackInterpreter`**:
  - Refactor `restoreSnapshot` to update maps in-place.
  - Refactor `reset` logic.

### Step 2: Persistent Tutorial UI

**Goal:** Move the narrative out of the modal.

- [ ] **Component**: Create `InstructionBar.svelte` (or update `Dialogue.svelte`).
  - **Placement**: Above the `Grid`, below the `Header`.
  - **Layout**: Compact, readable text with a "Next" button (if needed) or auto-advance triggers.
  - **Animations**: Smooth entry/exit.
- [ ] **Layout Update**:
  - Adjust `src/routes/game/+page.svelte` grid layout to allocate space for the instruction bar.
  - Ensure it works on mobile/tablet (responsive height).

### Step 3: Interactive Spotlights

**Goal:** Allow the story to point at things.

- [ ] **Spotlight System**:
  - Add `highlight` field to `StorySegment` (e.g., `{ target: 'block:move-forward', type: 'pulse' }`).
  - Implement visual indicators (CSS pulsing, overlay dimming, or arrows) on the target elements.
- [ ] **Target Resolution**:
  - Need a way to resolve "UI IDs" (e.g., a specific block in the palette, a specific cell (2,2)).

### Step 4: Interactive Triggers

**Goal:** Advance the story based on actions, not just clicks.

- [ ] **Trigger System**:
  - Add `advanceCondition` to `StorySegment` (e.g., `type: 'block-placed', blockType: 'move-forward'`).
  - Update `GameModel` or `Tray` to emit events that the Story system listens to.

### Step 5: Visual Polish

- [ ] **Character Animation**: Smooth CSS transitions for movement (remove "teleporting").
- [ ] **Win Animation**: Particle effect or happy jump when reaching the goal.

## Phase 5 Task List

- [ ] Refactor `GameModel` to use in-place Map updates (Custom Abstraction).
- [ ] Implement `InstructionBar` component (Top of Stage).
- [ ] Update Layout to accommodate persistent instructions.
- [ ] Implement Spotlight/Highlight system.
- [ ] Implement Interactive Triggers (Advance story on action).
- [ ] Add Character Movement Animations.
