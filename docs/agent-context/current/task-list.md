# Phase 6 Task List: Advanced Concepts

## 1. Functions ("Magic Blocks") - Core Logic

- [x] **Schema Update**: Extend `LevelSchema` in `src/lib/game/schema.ts` to support a `functions` dictionary (name -> block list).
- [x] **Block Types**: Add `CallBlock` to `BlockType` union in `src/lib/game/types.ts`.
- [x] **Interpreter - Call Stack**: Update `StackMachine` in `src/lib/game/mimic.ts` to handle `CALL` (push frame) and `RETURN` (pop frame) operations.
- [x] **Interpreter - Scope**: Ensure variable/state lookup respects the new stack structure.

## 2. Functions - UI & Interaction

- [x] **Function Editor UI**: Create a UI component (e.g., `FunctionTray` or `MagicWorkspace`) for editing the function definition.
- [x] **Magic Block Component**: Create `MagicBlock.svelte` (visual representation of the `CallBlock`).
- [x] **Integration**: Connect the Function Editor to the `GameModel` so edits update the level state.
- [x] **Visual Execution**: Update the "Active Block" highlighting to work when execution jumps into a function.

## 3. Audio System

- [x] **Audio Manager**: Create `src/lib/game/audio-manager.ts` to handle loading and playing audio files (MP3/WAV).
- [x] **Voiceover Support**: Update `Dialogue` component to trigger audio playback when a segment is shown.
- [x] **Soundscapes**: Add support for looping background ambient tracks in `LevelSchema`.

## 4. Content (Levels 7 & 8)

- [x] **Level 7 ("The Magic Spell")**: Design a level that requires defining a simple function (e.g., "Jump") and calling it multiple times.
- [x] **Level 8 ("Pattern Recognition")**: Design a level with a repeating complex pattern that requires a function to solve within the block limit.

## 5. Polish & Refinement

- [x] **Function Transition**: Add a visual effect when the execution jumps to/from a function.
- [x] **Accessibility**: Ensure voiceovers have synchronized captions (using existing Dialogue text).
