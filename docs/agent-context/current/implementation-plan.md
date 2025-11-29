# Implementation Plan - Phase 8: Intelligent Tutoring System

**Goal:** Create a responsive "Guide" that helps users when they struggle, and provide tools to author these guided experiences.
**Success Criteria:** Reimplement Levels 1-8 (including "The Bug" and "Pattern Recognition") using ONLY the Architect Mode tools.

## 1. Program Analysis Engine
We need a way to "read" the user's code to provide intelligent feedback.
- **`src/lib/game/analysis.ts`**:
    - `countBlocks(program, type)`: Count occurrences of a block type.
    - `hasSequence(program, types[])`: Check if a specific sequence exists.
    - `findPattern(program, pattern)`: More complex structural matching (e.g., "Loop containing Move").
    - `detectAntiPattern(program)`: Identify common mistakes (e.g., "Move Forward immediately after Turn" without a loop in a long path).

## 2. Hint Engine
The brain that decides *when* to show a hint.
- **`src/lib/game/hints.svelte.ts`**:
    - `HintManager` class.
    - **Triggers**:
        - `IdleTrigger`: User hasn't interacted for X seconds.
        - `FailTrigger`: User has failed the level X times.
        - `AnalysisTrigger`: User's code matches a specific pattern (or anti-pattern).
    - **State**: Tracks which hints have been shown to avoid repetition.

## 3. Guide Character ("The Robot")
A friendly face to deliver the bad news (and the good news).
- **Design**:
    - Simple SVG character.
    - States: `Idle`, `Thinking` (processing), `Talking` (hinting), `Happy` (success), `Sad` (failure).
- **Component**: `src/lib/components/game/Guide.svelte`.
- **Integration**: Embed into the `InstructionBar` or a floating overlay.

## 4. Authoring Tools (Builder Integration)
Empower the "Architect" to create guided levels.
- **Initial Code Snapshot**:
    - Add a "Snapshot" button to the Level Configuration modal.
    - Saves the current contents of the Tray as `initialProgram`.
- **Story Scripting UI**:
    - Enhance `StoryEditor` to allow selecting "Spotlight" targets.
    - UI: A picker that lets you click a block in the tray or a cell in the grid to capture its ID/coordinates.
- **Hint Editor**:
    - A new tab in the Builder UI.
    - List of hints for the level.
    - Form to edit Hint Text and Trigger Conditions (Time, Attempts, Pattern).

## 5. Content & Polish
- **Retrofit Levels**:
    - Update Level 1 to use the new Hint system for basic movement.
    - Update Level 4 ("The Bug") to use the new Hint system for debugging.
- **Verification**:
    - Ensure "The Bug" can be recreated from scratch using the Builder (requires Initial Code Snapshot).
    - Ensure "Pattern Recognition" can be recreated (requires Spotlights).

## Execution Order
1.  **Analysis Engine**: Core logic first.
2.  **Hint Engine**: State management.
3.  **Guide UI**: Visuals.
4.  **Builder Tools**: The complex UI work.
5.  **Content**: Putting it all together.
