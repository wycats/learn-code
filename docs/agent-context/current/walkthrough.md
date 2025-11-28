# Phase 5: Interactive Pedagogy - Walkthrough

## Goals

- Replace blocking modals with a persistent instruction bar.
- Implement "Spotlight" highlighting for tutorial steps.
- Refactor state management for robust in-place reactivity.

## Progress

### 1. Technical Refactor (State Abstraction)

- **Problem**: Reassigning `SvelteMap` instances (`game.executionState = new SvelteMap()`) caused reactivity issues where components holding the old reference wouldn't update.
- **Solution**: Implemented "In-Place Reactivity".
  - Made `executionState` and `loopProgress` `readonly` properties in `GameModel`.
  - Added `resetExecutionState()` and `restoreExecutionState()` methods to mutate the maps in place.
  - Updated `StackInterpreter` to use these methods instead of reassigning.

### 2. Persistent Tutorial UI

- **Problem**: The `Dialogue` modal blocked the game board, making it hard to follow instructions while looking at the grid.
- **Solution**: Created `InstructionBar` component.
  - Placed persistently above the stage area.
  - Allows users to read instructions and interact with the game simultaneously.
  - Updated `+page.svelte` layout to accommodate the new bar.

### 3. Spotlight System

- **Problem**: Users need visual cues to know which blocks or grid cells to interact with during the tutorial.
- **Solution**: Implemented a data-driven highlighting system.
  - **Schema**: Added `highlight` field to `StorySegment` (e.g., `{ target: 'block:move-forward', type: 'pulse' }`).
  - **Model**: Added `currentStorySegment` derived state to `GameModel` to expose the current highlight.
  - **Components**:
    - `Block.svelte`: Accepts `highlight` prop and applies pulsing outline.
    - `Cell.svelte`: Accepts `highlight` prop and applies pulsing outline.
    - `Tray.svelte`: Highlights palette items based on `target` (e.g., `block:move-forward`).
  - **Visuals**: Added `@keyframes pulse-highlight` for attention-grabbing animations.

### 4. Layout Stability & Dashboard

- **Problem**: The `InstructionBar` caused layout shifts when appearing/disappearing. The "chat" metaphor felt inconsistent without history.
- **Solution**: Implemented a fixed-height "Dashboard" area.
  - **Structure**: A persistent top panel (`.dashboard-area`) that houses either the `InstructionBar` (during story) or a new `StatusPanel` (during planning/running).
  - **StatusPanel**: Displays current phase ("Planning", "Running", "Won") and level info, replacing the floating phase indicator.
  - **Result**: The stage is now centered and stable. The UI feels more like a "Mission Control" dashboard.

### 5. Interactive Triggers

- **Problem**: Users had to manually click "Next" after performing an action (like dragging a block), which felt disconnected.
- **Solution**: Implemented automatic story advancement based on game events.
  - **Schema**: Added `advanceCondition` to `StorySegment` (e.g., `{ type: 'block-placed', blockType: 'move-forward' }`).
  - **Model**: Added `checkTrigger()` to `GameModel` to validate actions against the current story segment.
  - **UI**: `InstructionBar` hides the "Next" button when waiting for a trigger, guiding the user to perform the action instead.

### 6. Visual Polish

- **Problem**: The UI felt "gross" with clashing backgrounds, dark overlays, and disconnected cards.
- **Solution**: Refined the visual design.
  - **Dashboard**: Removed the "card-in-a-box" look. `StatusPanel` and `InstructionBar` now blend seamlessly into the dashboard area.
  - **Modals**: Lightened the overlay opacity and used a blur effect for a cleaner, more modern look.
  - **Tray**: Refined typography for headers (smaller, uppercase, wider tracking).
  - **Colors**: Harmonized background colors (`surface-1` for dashboard and stage) to reduce visual noise.
  - **Blocks**: Made loop count explicit (e.g., "Repeat 1x") to clarify the effect of the "Repeat" control.
  - **Layout**: Fixed layout shifts by using CSS Grid for the dashboard area, ensuring smooth transitions between Story and Planning modes.

### 7. Animation & Feedback

- **Problem**: The game felt static and unresponsive. Character movement was instant (teleporting), and winning felt anticlimactic.
- **Solution**: Added smooth transitions and celebratory effects.
  - **Character**: Implemented CSS transitions for character movement. Moved the character out of the grid cells into a dedicated overlay layer to allow smooth interpolation of position using `transform: translate(...)`.
  - **Win State**: Added a "pop-in" animation to the Win Modal and a celebratory sound effect (`soundManager.play('win')`).
  - **Transitions**: Added fade-in effects for the `StatusPanel` to smooth out state changes.

## Next Steps

- **Phase Transition**: Prepare for Phase 6 (Content Expansion).
