# Phase 7 Walkthrough: Tutorial System Expansion

## Overview

This phase focuses on enhancing the learning experience by introducing an intelligent "Guide" character, contextual hints, and rich media instructions.

## Work Log

### 1. Fresh Eyes Review

Conducted a review of the current state and identified key friction points:

- **Error Loop**: Users could get stuck in a "fail" state where the "Play" button didn't reset the game.
- **Accessibility**: Screen readers didn't announce new instructions.
- **Lack of Guidance**: No feedback when users struggled.

### 2. Core Fixes

- **Error State**: Updated `handlePlay` in `+page.svelte` to detect if the game is in a blocked/fail state and reset it before running.
- **Accessibility**: Added `aria-live="polite"` to the `InstructionBar` content area.

### 3. Hint System Architecture

Implemented a flexible hint system in `GameModel`:

- **Triggers**: Added support for `time` (elapsed seconds), `attempts` (failed runs), and `idle` (time since last interaction) triggers.
- **State Tracking**: Added `failedAttempts`, `lastInteractionTime`, and `activeHintId` to `GameModel`.
- **Schema**: Updated `LevelDefinition` to include optional `hints`.
- **Integration**: Added a `checkHints()` method called every second via `setInterval` in the game loop.

### 4. Guide Character & UI

- **Visuals**: Added the "Guide" character, represented by a `Bot` icon (using Lucide icons).
- **InstructionBar**: Updated to support:
  - **Rich Media**: Can now render images inside story segments.
  - **Dynamic Avatar**: Renders the Bot icon for the Guide, and character images for others.
  - **Hint Display**: Hints are injected as high-priority story segments.

### 5. Verification

- **Unit Tests**: Created `src/lib/game/hints.spec.ts` to verify hint triggering logic (time, attempts, idle).
- **Manual Check**: Verified the UI updates for the Guide character.

### 6. Refinement: Named Steps

- **Schema Update**: Updated `StorySegmentSchema` to include an optional `id`.
- **Trigger Update**: Changed `story-step` trigger to use `segmentId` instead of numeric index for robustness.
- **Deferred Work**: Removed experimental "program analysis" triggers (missing-block, etc.) to be designed properly in a future phase.

### 7. Content Integration

- **Level 1 (Cross the River)**:
  - Added "Guide" character introduction.
  - Added hints for idle users (15s) and repeated failures (2 attempts).
  - Verified with `src/lib/game/level1.spec.ts`.
- **Level 2 (The Long Walk)**:
  - Added "Guide" dialogue explaining loops.
  - Added hints for using the "Repeat" block.

## Next Steps

- Phase Transition: Complete Phase 7.
