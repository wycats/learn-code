# Changelog

## Phase 1: Foundation & Research (Completed)

**Date:** [Current Date]

**Summary:**
Established the pedagogical and technical foundation for "Wonderblocks". Defined the core "Stop & Go" mechanics, researched prior art (Cubetto, ScratchJr), and established the "Modern Matte" visual style. Set up the SvelteKit project structure with Open Props for styling and a custom "Mimic" interpreter architecture.

**Key Deliverables:**

- `docs/design/mechanics.md`: Core game mechanics definition.
- `docs/design/visual-style.md`: Visual design system (Modern Matte).
- `docs/design/personas.md`: User personas (Zoey, Jonas).
- `docs/agent-context/current/technical-architecture.md`: Technical stack and architecture.
- Project Skeleton: SvelteKit app with Open Props and "Every Layout" primitives.

## Phase 2: Modern CSS Foundation (Completed)

**Date:** November 27, 2025

**Summary:**
Established a robust, future-proof styling architecture using Baseline 2025 features. Implemented the "Modern Matte" aesthetic using Open Props and semantic tokens with `light-dark()` for native dark mode support. Refined layout primitives and created a "Kitchen Sink" page to validate the design system.

**Key Deliverables:**

- `src/app.css`: Global styles with `@layer`, semantic tokens, and `light-dark()`.
- `src/lib/components/layout/Switch.svelte`: New layout primitive using Container Queries.
- `src/routes/design/+page.svelte`: Kitchen Sink / Style Guide page.
- Refined `Stack`, `Grid`, `Cluster`, `Center`, `Box` components.

## Phase 3: Prototype / MVP (Completed)

**Date:** November 27, 2025

**Summary:**
Built the functional "unplugged-digital" prototype implementing the core "Stop & Go" mechanics. Developed the `GameModel` using Svelte 5 Runes, the `Mimic` interpreter using generator functions for step-by-step execution, and a touch-friendly drag-and-drop interface using `svelte-dnd-action`. Created the first level "Cross the River" to validate the end-to-end loop.

**Key Deliverables:**

- `src/lib/game/model.svelte.ts`: Reactive game state with Undo/Redo.
- `src/lib/game/mimic.ts`: Generator-based execution engine.
- `src/lib/components/game/Tray.svelte`: Drag-and-drop block coding interface.
- `src/lib/components/game/Grid.svelte`: 5x5 Game Stage.
- `src/routes/game/+page.svelte`: Integrated game prototype.
- `src/lib/game/levels.ts`: Level 1 definition.

## Phase 4: Content & Curriculum (Completed)

**Date:** November 27, 2025

**Summary:**
Expanded the prototype into a playable learning module with a narrative arc. Implemented the "Again" (Loop) block with nested drag-and-drop, a dialogue system for storytelling, and a "Block Limit" mechanic to enforce efficient coding. Created Levels 1-6 covering basic movement, loops, and debugging. Refined the UI into a responsive "IDE-style" layout. Migrated the drag-and-drop system to `@atlaskit/pragmatic-drag-and-drop` for a robust, no-layout-shift experience. Implemented a Stack-Based Interpreter to support "Step Back" debugging. Added procedural sound effects and ensured full accessibility compliance.

**Key Deliverables:**

- **Loop Block**: Nested drag-and-drop support and interpreter logic.
- **Narrative System**: `Dialogue` component and story segments in levels.
- **Levels 1-6**:
  - 1-3: Basic Movement & Intro.
  - 4: "The Bug" (Debugging pre-filled code).
  - 5: "Stairway" (Forced Loop via Block Limit).
  - 6: "Big Zig Zag" (Complex Patterns).
- **UI Refinement**: Two-column layout, "Stop" button, "Ghost" drag effect.
- **Win/Loss States**: `WinModal` and visual feedback for collisions.
- **Technical Refactor**:
  - Replaced `SortableJS` with `@atlaskit/pragmatic-drag-and-drop`.
  - Implemented Stack-Based Interpreter for "Step Back" capability.
  - Migrated to `SvelteMap`/`SvelteSet` for fine-grained reactivity.
  - Added `SoundManager` (Web Audio API) for procedural sound effects.
  - Fixed Accessibility issues (keyboard navigation, ARIA roles).

## Phase 5: Interactive Pedagogy (Completed)

**Date:** November 28, 2025

**Summary:**
Transformed the tutorial from a passive reading experience into an interactive, non-blocking coaching system. Implemented a persistent "Dashboard" layout to stabilize the UI and allow simultaneous reading and playing. Added a "Spotlight" system to visually guide users to specific UI elements. Refactored the state management to use in-place updates for `SvelteMap` to ensure robust reactivity. Polished the visual experience with smooth character animations, win state effects, and a harmonized color palette.

**Key Deliverables:**

- **Persistent Tutorial UI**: `InstructionBar` and `StatusPanel` integrated into a fixed-height Dashboard.
- **Interactive Triggers**: Story advances automatically based on user actions (e.g., placing a block).
- **Spotlight System**: Visual highlighting for blocks and grid cells driven by story data.
- **Visual Polish**:
  - Smooth CSS transitions for character movement.
  - "Pop-in" animations for Win Modal.
  - Explicit loop counts on blocks.
  - Harmonized "Modern Matte" color usage.
  - Fixed layout shifts and grid rendering issues (off-by-one error).
- **Technical Refactor**: Encapsulated `executionState` and `loopProgress` in `GameModel` to prevent reactivity bugs.

## Phase 6: Advanced Concepts & Audio (Completed)

**Date:** November 28, 2025

**Summary:**
Implemented "Functions" (Magic Blocks) to introduce the concept of reusable code, and a comprehensive Audio System for immersive feedback. This involved a significant update to the `GameModel` to support multiple editing contexts and updating the `StackInterpreter` to handle function calls with a call stack.

**Key Deliverables:**

- **Functions Core Logic**:
  - Updated `LevelSchema` to support `functions`.
  - Added `CallBlock` type.
  - Updated `StackInterpreter` to handle `CALL` and `RETURN` operations with stack frames.
  - Implemented context switching in `GameModel` (`activeProgram`).
- **Function Editor UI**:
  - Updated `Tray.svelte` with tabs to switch between Main Program and Function definitions.
  - Added `MagicBlock` (Call Block) visualization.
  - Added smooth transitions (`fly`/`fade`) when switching contexts.
- **Visual Execution**:
  - Updated Interpreter to automatically switch the UI context when execution enters a function, allowing users to see the function executing step-by-step.
- **Audio System**:
  - Implemented `SoundManager` using Web Audio API.
  - Added support for voiceovers in `Dialogue` and looping ambient tracks.
- **Content**:
  - Level 7 ("The Magic Spell"): Introduction to functions.
  - Level 8 ("Pattern Recognition"): Complex pattern solving with functions.
- **UI Refinements**:
  - Implemented "Infinite Loop" logic and UI.
  - Refactored Loop Block configuration into a "Contextual Configuration Panel" in the Tray using Glassomorphism and Popover API.

## Phase 7: Level Builder (Completed)

**Date:** November 28, 2025

**Summary:**
Implemented a comprehensive "Level Builder" inspired by Super Mario Maker, enabling users to create, test, and share custom levels. The builder features a tactile "drag-to-paint" interface, a dedicated Story Editor for narrative elements, and seamless switching between Edit and Test modes. This phase also introduced serialization (Export/Import) to allow sharing of level files.

**Key Deliverables:**

- **Builder Core**:
  - `BuilderModel`: Svelte 5 Runes-based state management for the editor.
  - `Grid` Updates: Added support for "Edit Mode" with drag-to-paint interactions and hover effects.
- **Builder UI**:
  - `BuilderTray`: A comprehensive tool palette with Terrain/Actor tools, Level Config, and Backpack (Block limits).
  - `StoryEditor`: A dedicated interface for crafting Intro/Outro dialogue sequences.
  - **Mode Switching**: Seamless toggle between "Edit" (Builder UI) and "Test" (Game UI) modes.
- **Test Mode Features**:
  - **Cheats**: Added "Rotate Character" and "Reset Position" tools to facilitate rapid debugging.
- **Serialization**:
  - Implemented JSON Export and Import functionality for level sharing.

## Phase 8: Intelligent Tutoring System (Completed)

**Date:** November 28, 2025

**Summary:**
Transformed the learning experience into an active, intelligent coaching system. Introduced a "Guide" character (a friendly robot) who provides context-aware hints when users struggle. Empowered level creators to author these guided experiences using new tools in the Level Builder, including a Hint Editor, Snapshot Tool, and Spotlight targeting system.

**Key Deliverables:**

- **Program Analysis Engine**:
  - Implemented static analysis utilities (`countBlocks`, `hasSequence`, `detectAntiPatterns`) to inspect user code.
- **Hint Engine**:
  - Created `HintManager` to trigger hints based on Time, Idle, Attempts, or Code Analysis.
- **Guide Character**:
  - Implemented `Guide.svelte`, an animated SVG robot with emotional states (Idle, Thinking, Talking, Happy, Sad).
- **Authoring Tools**:
  - **Hint Editor**: UI in `BuilderTray` to define hints and triggers.
  - **Snapshot Tool**: Ability to save the current tray as `initialProgram` for debugging levels.
  - **Spotlight Targeting**: "Map Pin" tool in Story Editor to select grid/block targets.
- **Content Updates**:
  - Updated Level 1 and Level 4 ("The Bug") to use the new hint system.
- **UI Polish**:
  - Added live highlight previews, gentle fade effects, and an emoji picker for story configuration.

