# Technical Architecture Plan

## 1. The "Brain": Execution Engine

We will build a **"Mimic" Interpreter** (Custom TypeScript Runtime) for the MVP.

- **Why**: It allows us to decouple the _visual execution_ (animations, delays) from the _logical execution_. We need precise control over the "step" timing to match the "Stop/Go" pedagogy.
- **Structure**:
  - `Block`: A JSON object representing an instruction (compatible with PXT AST structure where possible).
  - `Program`: An array of Blocks.
  - `Interpreter`: A class that takes a `Program` and a `WorldState`, and yields a sequence of `Frame` objects (or async steps).
- **Future-Proofing**: We will keep the Block data structure serializable and strictly typed, making a future migration to PXT (or generating PXT code from our blocks) straightforward.

## 2. The "Heart": State Management & Undo

We will use **Svelte 5 Runes** combined with a **Snapshot History** pattern.

- **The Model**: A `GameModel` class using `$state` runes for fine-grained reactivity.
  - `grid`: The 2D world state.
  - `program`: The list of blocks in the tray.
  - `status`: 'planning' | 'running' | 'won' | 'lost'.
- **The History**:
  - We will implement a `HistoryManager` that stores **non-reactive snapshots** of the `GameModel` data.
  - **Strategy**: Since our state is small (a 5x5 grid and <50 blocks), we can simply serialize (or structuredClone) the relevant state before any user mutation.
  - **Undo**: To undo, we pop the previous snapshot and bulk-update the `GameModel` runes. This triggers the UI to update automatically.
  - **Why**: This avoids the boilerplate of the Command Pattern (writing `undo()` logic for every action) and avoids the performance cost of keeping the entire history reactive.

## 3. The "World": Level Format

We will use **TypeScript-as-Data**.

- **Format**: `.ts` files that export a `LevelDefinition` object (or a pure function returning one).
- **Structure**:
  ```typescript
  export const Level1: LevelDefinition = {
  	id: 'level-1',
  	name: 'First Steps',
  	grid: createGrid(5, 5), // Helper function
  	start: { x: 2, y: 2 },
  	goal: { x: 4, y: 2 },
  	availableBlocks: ['move-right', 'move-up'],
  	solutionPar: 3
  };
  ```
- **Pros**:
  - **Type Safety**: Immediate feedback on broken levels.
  - **Idempotency**: The level definition is a recipe; the `GameModel` instantiates a fresh copy for the session.
  - **No Parsing**: It's just code.

## 4. Tech Stack Summary

- **Framework**: SvelteKit (Svelte 5).
- **Styling**:
  - **System**: **Open Props** for design tokens (colors, shadows, spacing).
  - **Methodology**: **Scoped CSS** (Standard Svelte) for component styles.
  - **Layouts**: **Every Layout** primitives implemented as Svelte components (e.g., `<Stack>`, `<Cluster>`, `<Grid>`) to handle composition without writing repetitive CSS.
- **Icons**: Material Icons (via a lightweight wrapper or SVG assets).
- **Testing**: Vitest for logic (Interpreter), Playwright for E2E.
