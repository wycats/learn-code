# Implementation Plan - Phase 6: Advanced Concepts

**Goal:** Introduce "Magic Blocks" (Functions) to teach code reuse and abstraction, and enhance the immersive experience with a comprehensive Audio System (Voiceover & Soundscapes).

## 1. Functions ("Magic Blocks")

The "Magic Block" allows users to define a sequence of actions once and reuse them. This introduces the concept of functions/subroutines.

### 1.1. Data Model & Schema

- [ ] **Extend Schema**: Update `LevelSchema` to support `functions` definitions (separate from the main `initialCode`).
- [ ] **Block Types**:
  - `CallBlock`: A block that executes a named function.
  - `DefineBlock` (Internal/UI): A container representing the function definition.

### 1.2. UI/UX for Function Definition

- [ ] **Function Editor**:
  - Decide on the UI pattern: A separate "tab" for the function definition, or a secondary workspace on the screen?
  - _Proposal_: A "Magic Workspace" that can be toggled or is always visible in specific levels.
- [ ] **Magic Block**:
  - Create a distinct visual style for the "Call" block (e.g., a purple "Star" block).

### 1.3. Interpreter Updates

- [ ] **Call Stack**: Ensure the `StackMachine` correctly handles `CALL` and `RETURN` operations.
- [ ] **Step-by-Step**: Ensure the "Step Forward" and "Step Back" actions work seamlessly across function boundaries (entering and exiting the function).

## 2. Audio System

Transform the silent/procedural-only experience into a fully voiced narrative.

### 2.1. Audio Architecture

- [ ] **Asset Management**: System for loading and caching audio files (MP3/WAV) for voiceovers.
- [ ] **Soundscapes**: Support for looping background ambient tracks.
- [ ] **Settings**: Global Mute/Volume controls (persisted).

### 2.2. Narrative Integration

- [ ] **Voiceover Triggers**: Play specific audio clips when `Dialogue` segments appear.
- [ ] **Character Voices**: Distinct sounds/voices for different characters.

## 3. Content (Level 7+)

Create levels that specifically require using Functions.

- [ ] **Level 7: "The Magic Spell"**: Introduce the Magic Block. The player must define a pattern (e.g., "Jump Over") and use it multiple times.
- [ ] **Level 8: "Pattern Recognition"**: A complex path that requires identifying repeating sub-patterns.

## 4. Refinement & Polish

- [ ] **Visual Feedback**: When a function is called, visually indicate that execution has jumped to the function definition.
- [ ] **Accessibility**: Captions for voiceovers (already handled by Dialogue text, but ensure sync).
