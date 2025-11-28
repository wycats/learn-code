# Phase 6 & 3 Walkthrough: Functions & Audio

## Overview

This phase focused on two major additions: the "Magic Blocks" (Functions) system and the Audio System. These features significantly expand the depth and immersion of the game.

## 1. Functions ("Magic Blocks")

The core of this phase was enabling users to define and call their own functions. This required changes across the entire stack, from the data model to the execution engine and the UI.

### Data Model & Schema

- **`LevelSchema`**: Added a `functions` dictionary (mapping function names to block lists) to the level definition.
- **`BlockType`**: Added a new `call` block type, which references a function name.
- **`GameModel`**: Introduced `editingContext` state. When `null`, the user edits the main program. When set to a string (e.g., "spell"), the user edits that function's block list.

### Execution Engine (`StackMachine`)

- **Call Stack**: The interpreter was rewritten to use a stack of `StackFrame` objects. Each frame tracks its own `blocks`, `programCounter`, and `context`.
- **`CALL` Opcode**: Pushes a new frame onto the stack, pointing to the target function's blocks.
- **`RETURN`**: Pops the current frame, resuming execution in the caller.
- **Context Sync**: During execution, the interpreter updates `game.editingContext` to match the active frame. This allows the UI to visually "jump" into the function being executed.

### UI (`Tray.svelte`)

- **Context Tabs**: Added tabs above the program list to switch between "Main" and available functions.
- **Transitions**: Added `fly` and `fade` transitions to the program list, providing a smooth visual cue when switching contexts (both during editing and execution).
- **Reactivity**: The UI is fully reactive to `game.editingContext`, ensuring the displayed blocks always match the active scope.

## 2. Audio System

We implemented a robust audio system using the Web Audio API to support voiceovers and ambient soundscapes.

### `SoundManager`

- **`AudioContext`**: Uses a shared `AudioContext` to manage sound.
- **`playFile(path)`**: Loads and plays a one-shot audio file (e.g., voiceovers).
- **`playAmbient(path)`**: Loads and plays a looping track. Handles cross-fading or restarting if the track changes.
- **Asset Management**: Audio files are stored in `src/lib/assets/audio/`.

### Integration

- **`Dialogue.svelte`**: Automatically triggers `soundManager.playVoiceover` when a dialogue segment with an `audio` property is displayed.
- **`LevelSchema`**: Added `ambient` property to define background music for each level.

## 3. Content

Two new levels were created to introduce and reinforce the concept of functions:

- **Level 7 ("The Magic Spell")**: Introduces the concept. The player must define a "spell" (function) to jump over a hazard, and then call it multiple times.
- **Level 8 ("Pattern Recognition")**: A more complex puzzle where a repeating pattern must be encapsulated in a function to solve the level within the block limit.

## 4. UI Refinements (Contextual Configuration Panel)

We significantly improved the usability and aesthetics of block configuration, specifically for Loop blocks.

- **Problem**: The previous "Mini Picker" on the Loop block was small, hard to click, and cluttered the block's visual design.
- **Solution**: Implemented a **Contextual Configuration Panel** that appears adjacent to the floating toolbar when a configurable block is selected.
- **Visual Style**: Adopted a **Glassomorphism** aesthetic (translucent white, blur effect, subtle shadows) to make the panel feel like a modern, floating overlay that sits above the game UI without fully obscuring it.
- **Interaction**:
  - Selecting a Loop block triggers the panel to slide out from the toolbar.
  - The panel offers large, easy-to-tap buttons for loop counts (2x, 3x, 4x, 5x, 10x) and an "Infinity" option.
  - The active setting is clearly highlighted.
- **Implementation**:
  - `Tray.svelte`: Added the `.config-panel` component with `fly` transitions and backdrop filters.
  - `Block.svelte`: Simplified the block rendering to remove inline controls, making the blocks cleaner and more readable.

## Key Decisions

- **Unified Editor**: We decided to use a single "Tray" component that switches context, rather than showing multiple editors side-by-side. This saves screen space and focuses the user's attention on the current scope.
- **Visual Execution**: Syncing the editor view with the execution stack was a crucial decision. It makes the abstract concept of a "call stack" concrete and visible to the learner.
- **Web Audio API**: We chose the native Web Audio API over a library for better control and to avoid external dependencies.
- **Contextual Configuration**: Moving block configuration to the Tray establishes a pattern for future block properties (e.g., function arguments), keeping the blocks themselves simple and readable.

## Verification

- **Unit Tests**: Verified the `StackMachine` logic for `CALL` and `RETURN` operations.
- **Manual Verification**: Confirmed that `GameModel` correctly updates function definitions when `editingContext` is active (via a reproduction script).
- **UI Polish**: Verified that transitions and tab switching work smoothly.
- **Loop Config**: Verified that selecting a loop block shows the options in the tray and updates the block correctly.
