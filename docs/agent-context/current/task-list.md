# Phase 3 Task List

- [x] **Step 1: Core Game State (Model)**
  - [x] Define Types (`Grid`, `Cell`, `Block`, `Program`, `GameState`)
  - [x] Implement `GameModel` with Svelte 5 Runes
  - [x] Implement `HistoryManager` (Undo/Redo)

- [x] **Step 2: The Stage (View)**
  - [x] Create `Cell` component
  - [x] Create `Grid` component
  - [x] Create `Character` component

- [x] **Step 3: The Interpreter (Logic)**
  - [x] Implement `Mimic` engine (`runProgram` generator)
  - [x] Implement `MoveForward`, `TurnLeft`, `TurnRight` logic

- [x] **Step 4: Drag & Drop (Interaction)**
  - [x] Install `svelte-dnd-action`
  - [x] Create `Block` component
  - [x] Create `Tray` component (Palette & Sequence)

- [x] **Step 5: Integration & Game Loop**
  - [x] Implement Play/Stop/Reset controls
  - [x] Connect UI to `Mimic` interpreter
  - [x] Implement execution visualization (highlighting)
  - [x] Implement Win/Loss detection

- [x] **Step 6: Content (Level 1)**
  - [x] Define "Cross the River" level
  - [x] Load level in `GameModel`
