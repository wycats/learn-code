# Phase 3 Walkthrough: Prototype / MVP

## Overview

In this phase, we built the functional "unplugged-digital" prototype. The core focus was on the "Stop & Go" mechanic, where users plan a sequence of commands (Stop) and then execute them (Go).

## Key Implementations

### 1. Game Model (Svelte 5 Runes)

We implemented `GameModel` in `src/lib/game/model.svelte.ts` using Svelte 5 Runes (`$state`).

- **State**: Tracks `program`, `characterPosition`, `characterOrientation`, and `status`.
- **History**: Implemented a snapshot-based Undo/Redo system that serializes the `program` array.
- **Types**: Defined strict types for `Direction` ('N', 'E', 'S', 'W') and `BlockType` (relative movement).

### 2. The Mimic Interpreter

We built a custom execution engine in `src/lib/game/mimic.ts`.

- **Generator Pattern**: The `runProgram` function is an async generator. This allows the UI to iterate through steps (`for await...`) and visualize the execution flow with pauses.
- **Logic**: Implemented relative movement (`move-forward` depends on orientation) and rotation.
- **Safety**: Added bounds checking and wall collision detection.

### 3. Drag & Drop Interface

We used `svelte-dnd-action` to implement the block coding interface.

- **Tray Component**: Contains the `Palette` (source) and `Sequence` (program).
- **Copy-on-Drag**: The Palette resets its items on drop to simulate an infinite supply of blocks.
- **Block Component**: Visual representation of commands using Open Props for "Modern Matte" styling.

### 4. The Stage

- **Grid**: Renders the 5x5 game board using CSS Grid.
- **Character**: Renders the avatar with CSS transforms for rotation.
- **Cells**: Visual feedback for Grass, Water, Walls, and Goal.

### 5. Integration

The `src/routes/game/+page.svelte` page ties everything together.

- **Game Loop**: Manages the `runProgram` generator execution.
- **Controls**: Play, Reset, Undo, Redo buttons.
- **Feedback**: Visual highlighting of the active block during execution.

## Next Steps

- **Testing**: Verify touch interactions on actual devices.
- **Content**: Expand to more levels.
- **Polish**: Add animations and sound effects.
