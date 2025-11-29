# Project Plan Outline: Wonderblocks Learning Tool

## Phase 1: Foundation & Research (Completed)

**Goal:** Establish the pedagogical and technical foundation.

- [x] Core pedagogy & mechanics.
- [x] Technical architecture & project structure.

## Phase 2: Modern CSS Foundation (Completed)

**Goal:** Establish a robust, future-proof styling architecture.

- [x] Open Props & Semantic Tokens.
- [x] Dark Mode & Touch-First sizing.

## Phase 3: Prototype / MVP (Completed)

**Goal:** Build a functional "unplugged-digital" prototype.

- [x] "Stop & Go" mechanics.
- [x] Drag & Drop interface.
- [x] Basic execution engine.

## Phase 4: Content & Curriculum (Completed)

**Goal:** Develop the first narrative-driven learning module.

- [x] Narrative system & Dialogue.
- [x] Levels 1-6 (Loops, Debugging).
- [x] Stack-based interpreter.

## Phase 5: Interactive Pedagogy (Completed)

**Goal:** Transform the tutorial into an interactive coaching system.

- [x] Persistent Instruction Bar.
- [x] Spotlight system.
- [x] Interactive triggers.

## Phase 6: Advanced Concepts (Completed)

**Goal:** Introduce complex programming concepts.

- [x] Functions (Magic Blocks).
- [x] Audio System (SFX & Ambience).

## Phase 7: Level Builder (Completed)

**Goal:** Create an in-game editor for user-generated content.

- [x] Builder UI & Tools.
- [x] Edit/Test mode switching.
- [x] JSON Export/Import.
- [x] Architect Mode (God controls).

## Phase 8: Intelligent Tutoring System (Completed)

**Goal:** Create a responsive "Guide" that helps users when they struggle, and provide tools to author these guided experiences.
**Success Criteria:** Reimplement Levels 1-8 (including "The Bug" and "Pattern Recognition") using ONLY the Architect Mode tools.

- [x] **Program Analysis Engine**: Utilities to inspect the user's code structure (AST analysis).
- [x] **Hint System**: Logic to trigger hints based on idle time, repeated failures, or specific anti-patterns.
- [x] **Guide Character**: A friendly "Robot Helper" UI component to deliver hints and encouragement.
- [x] **Authoring Tools**:
  - [x] **Initial Code Snapshot**: Tool to save the current tray as the level's starting code (for debugging levels).
  - [x] **Story Scripting UI**: Visual editor for "Spotlights" (highlights) and "Triggers" (advance conditions).
  - [x] **Hint Editor**: UI to define and configure hints for a level.
- [x] **Rich Media Instructions**: Support for diagrams and animations within the instruction stream.

## Phase 9: The Tile Lab (Completed)

**Goal:** Empower users to customize the game world, fostering ownership and creativity.

- [x] **Data-Driven Terrain**: Refactor `CellType` to support properties (walkable, swimable, hazard) rather than hardcoded strings.
- [x] **Tile Designer UI**: A "Badge Maker" interface for creating custom terrain (Base + Pattern + Decal).
- [x] **Hazards & Mechanics**: Implement new tile behaviors (Spikes, Water, Ice).

## Phase 10: The Librarian (Current)

**Goal:** Organize content into cohesive collections and improve the discovery experience.

- [ ] **Level Packs**: Support for grouping levels into Campaigns/Packs.
- [ ] **Home Screen Redesign**: A visual overhaul of the level selection screen.
- [ ] **Metadata & Ratings**: Difficulty, tags, and descriptions for levels.
- [ ] **Persistence Upgrade**: Robust local storage (IndexedDB/OPFS) for user progress and content.

## Phase 11: Advanced Builder Features

**Goal:** Bring advanced game mechanics into the Builder to support complex level design.

- [ ] **Functions in Builder**: UI for defining and editing "Magic Blocks" (Functions) within the Builder.
- [ ] **Advanced Logic**: Support for conditional blocks or more complex triggers if needed.
