# Implementation Plan - Phase 7: Tutorial System Expansion

**Goal:** Enhance the learning experience with intelligent guidance and a friendly guide character.

## 1. Fresh Eyes Review
Before building new features, we will pause to consolidate.
- **Activity**: Play through Levels 1-8.
- **Output**: A "Friction Log" in `docs/design/friction-log.md`.
- **Action**: Fix low-hanging fruit immediately.

## 2. Contextual Hints
We need a system that knows *when* to help.
- **Triggers**:
  - `TimeElapsed`: User has been on the level for X seconds.
  - `FailedAttempts`: User has run the code and failed X times.
  - `Idle`: User hasn't interacted with the UI for X seconds.
- **Response**:
  - **Level 1 Hint**: A subtle visual cue (e.g., spotlighting the next block).
  - **Level 2 Hint**: A message from the Guide.
  - **Level 3 Hint**: A diagram or partial solution.

## 3. The Guide Character
- **Persona**: Friendly, encouraging, robotic but warm. (Name TBD, maybe "Bit" or "Chip"?).
- **Visuals**: A new component `Guide.svelte` that lives in the `InstructionBar` or floats nearby.
- **States**: Idle, Talking, Thinking, Celebrating, Worried (on error).

## 4. Rich Media Instructions
- **Schema**: Extend `StorySegment` to include `media?: { type: 'image' | 'video', src: string }`.
- **UI**: Update `InstructionBar` to render this media.
