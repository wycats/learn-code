# Phase 3 Implementation Plan: Prototype / MVP

## Objective

Build a functional "unplugged-digital" prototype to test the core "Stop & Go" mechanic. This involves implementing the game state, execution engine, and the primary UI for planning and running code.

## Detailed Steps

### Step 1: Core Game State (Model)

- [ ] **Define Types**: Create TypeScript interfaces for `Grid`, `Cell`, `Block`, `Program`, and `GameState` in `src/lib/game/types.ts`.
- [ ] **GameModel**: Implement the `GameModel` class in `src/lib/game/model.svelte.ts` using Svelte 5 Runes (`$state`). This will manage the grid state, character position/orientation, and the current program.
- [ ] **HistoryManager**: Implement a simple snapshot-based Undo/Redo system within `GameModel`.

### Step 2: The Stage (View)

- [ ] **Cell Component**: Create `src/lib/components/game/Cell.svelte` to render individual grid cells (grass, water, goal).
- [ ] **Grid Component**: Create `src/lib/components/game/Grid.svelte` to render the 5x5 game board.
- [ ] **Character Component**: Create `src/lib/components/game/Character.svelte` to render the player avatar with proper positioning and rotation.

### Step 3: The Interpreter (Logic)

- [ ] **Mimic Engine**: Implement the `Mimic` interpreter in `src/lib/game/mimic.ts`.
- [ ] **Instruction Set**: Define the core commands: `MoveForward`, `TurnLeft`, `TurnRight`.
- [ ] **Execution Generator**: Implement the `run()` method as a generator function to allow step-by-step execution and state yielding.

### Step 4: Drag & Drop (Interaction)

- [ ] **Library Selection**: Evaluate and select a touch-friendly DnD solution compatible with Svelte 5 (e.g., `svelte-dnd-action` or a custom pointer-event implementation).
- [ ] **Block Component**: Create `src/lib/components/game/Block.svelte` representing code blocks.
- [ ] **Palette & Sequence**: Create `Tray.svelte` containing the `Palette` (available blocks) and `Sequence` (program timeline).
- [ ] **Wiring**: Connect the DnD events to update the `GameModel`'s program state.

### Step 5: Integration & Game Loop

- [ ] **Play Controls**: Implement Play/Stop/Reset buttons in the UI.
- [ ] **Execution Loop**: Connect the UI controls to the `Mimic` interpreter.
- [ ] **Visualization**: Add state to `GameModel` to track the "active block" index and highlight it during execution.
- [ ] **Win/Loss Detection**: Implement logic to check if the character is on the goal or an invalid tile after each step.

### Step 6: Content (Level 1)

- [ ] **Level Definition**: Define the "Cross the River" level data structure (grid layout, start pos, goal pos).
- [ ] **Level Loader**: Add functionality to `GameModel` to load a level definition.
