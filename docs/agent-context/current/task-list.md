# Task List: Phase 8 - Intelligent Tutoring System

- [ ] **Program Analysis**
  - [ ] Create `src/lib/game/analysis.ts`.
  - [ ] Implement `countBlocks(program, type)`.
  - [ ] Implement `hasSequence(program, types)`.
  - [ ] Implement `findPattern(program, pattern)`.
  - [ ] Add unit tests for analysis functions.

- [ ] **Hint Engine**
  - [ ] Create `src/lib/game/hints.svelte.ts`.
  - [ ] Define `Hint` interface (id, text, trigger, condition).
  - [ ] Implement `HintManager` class with `checkHints()` loop.
  - [ ] Add `IdleTrigger` logic.
  - [ ] Add `FailTrigger` logic (track failure count in `GameModel`).

- [ ] **Guide Character**
  - [ ] Design "Robot" SVG character (Idle, Talk, Happy, Sad).
  - [ ] Create `src/lib/components/game/Guide.svelte`.
  - [ ] Implement CSS animations for states.

- [ ] **UI Integration**
  - [ ] Update `InstructionBar.svelte` to display the Guide.
  - [ ] Connect `GameModel` hint state to the UI.
  - [ ] Add "Dismiss" button for hints.

- [ ] **Authoring Tools (Builder)**
  - [ ] **Initial Code**: Add "Snapshot Tray" button to Level Config to save `initialProgram`.
  - [ ] **Story Scripting**: Add UI to Story Editor for selecting "Spotlight" targets (blocks/cells).
  - [ ] **Hint Editor**: Add UI to define hints and their triggers for the current level.

- [ ] **Content & Polish**
  - [ ] Add specific hints to Level 1 (Basic Move).
  - [ ] Add specific hints to Level 4 (Debugging).
  - [ ] Test hint triggering in-game.
