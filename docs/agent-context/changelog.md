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

## Phase 13: Design & Reflection (Completed)

**Date:** November 29, 2025

**Summary:**
Conducted a "soft" phase focused on solidifying the project's design foundation. Stepped back from feature development to document personas, codify design axioms, and conduct a "Fresh Eyes" review. This work ensures future development remains aligned with core values. Additionally, addressed significant technical debt by fixing over 30 linting errors and warnings across the codebase.

**Key Deliverables:**

- **Persona Enrichment**: Updated `docs/design/personas.md` to reflect "Architect" and "Guide" roles.
- **The Constitution**: Created `docs/design/axioms.md` defining 9 core design principles.
- **Fresh Eyes Review**: Documented friction points in `docs/design/friction-log.md`.
- **Code Quality**: Fixed linting errors (unused imports, floating promises, missing keys) across the codebase.
- **Documentation Cleanup**: Reorganized `docs/design/index.md` and archived obsolete docs.

## Phase 14: Navigation & Layout Polish (Completed)

**Date:** November 29, 2025

**Summary:**
Addressed high-priority friction points identified in the "Fresh Eyes" review, focusing on navigation structure and mobile responsiveness. Reorganized the Builder UI into a cleaner, tabbed interface and implemented a responsive vertical stack layout for smaller screens. Fixed a critical usability bug in Story Mode target selection.

**Key Deliverables:**

- **Home Screen Redesign**: Added a prominent "Builder Mode" entry point.
- **Responsive Layouts**: Implemented vertical stack layout for Game and Builder interfaces on mobile (<768px).
- **Builder UI Cleanup**: Refactored `BuilderTray` into a tabbed interface (Terrain, Actors, Logic, Story) and added the "Grid" tool.
- **Navigation Consistency**: Standardized "Back" button behavior and iconography.
- **Story Mode Fix**: Fixed target selection interaction and added visual feedback for highlighting tools.

## Phase 15: Advanced Builder Features (Completed)

**Date:** November 29, 2025

**Summary:**
Empowered "The Architect" with advanced tools to create complex, rich, and shareable learning experiences. Introduced "Functions" (Magic Blocks) into the Builder, added a new "Spikes" hazard mechanic, and polished the UI with difficulty indicators, selectable icons, and speaker avatars. Crucially, enabled local file system access via the File System Access API, allowing users to "Link" packs to their local disk for seamless syncing and backup.

**Key Deliverables:**

- **Functions in Builder**:
  - `FunctionManager` and `FunctionEditor` UI components.
  - Updated `BuilderModel` to manage function definitions.
  - Integration with `StackInterpreter` for executing user-defined functions.
- **Hazards (Spikes)**:
  - Added `spikes` cell type and rendering.
  - Updated interpreter logic to handle hazard collisions (death state).
  - Added Spikes tool to the Builder palette.
- **Local File System Integration**:
  - `FileSystemService` wrapping the File System Access API.
  - "Link to Disk" feature for persistent syncing of packs.
  - "Open Local Folder" in Library for loading external packs.
  - Inline status feedback (replacing alerts/toasts) for file operations.
- **UI Polish (Jonas's Wishlist)**:
  - Difficulty indicators (Green/Yellow/Red dots) on Level Map.
  - `IconPicker` for custom level/pack icons.
  - Avatar selection support in Story Editor.

## Phase 16: Content Expansion & Narrative Polish (Completed)

**Date:** November 30, 2025

**Summary:**
Expanded the "endgame" content with a challenging "Gauntlet" pack and deepened the narrative experience by framing it as a playful dialogue between the Architect (Jonas) and the Explorer (Zoey). Created two new levels ("Slippery Slopes" and "The Floor is Lava") to complete the Gauntlet pack. Updated the metadata and hints for Levels 1-8 to reflect the new narrative arc. Added a feedback mechanism to the Home Screen.

**Key Deliverables:**

- **Gauntlet Expansion**:
  - Created Level 10 ("Slippery Slopes") focusing on ice mechanics.
  - Created Level 11 ("The Floor is Lava") focusing on hazard avoidance.
  - Updated `GAUNTLET_PACK` to include the new levels.
- **Narrative Polish**:
  - Rewrote intros/outros for Levels 1-8 to feature "Jonas vs. Zoey" dialogue.
  - Updated Guide hints to reference "The Architect".
- **Hint System Audit**:
  - Added missing "Idle" and "Anti-Pattern" hints to Levels 3, 5, 6, 7, and 8.
- **Feedback Mechanism**:
  - Added a `mailto` link to the Home Screen for user feedback.

## Phase 16 Polish: Bug Fixes & UI Unification (Completed)

**Date:** November 30, 2025

**Summary:**
Addressed critical bugs and unified the Builder UI to align with the "Diagetic Axiom". Merged the Story Editor directly into the main layout, removing the need for a separate mode trigger. Fixed several high-priority bugs in Level 7 ("Functions") and the Builder.

**Key Deliverables:**

- **UI Unification**:
  - Removed `BuilderStoryTrigger` and embedded `BuilderStoryBar` in the main layout.
  - Simplified `BuilderModel` by removing the explicit `story` mode.
- **Bug Fixes**:
  - Fixed "Select a segment" empty state in Story Editor.
  - Fixed missing IDs in legacy levels causing UI issues.
  - Fixed Level 5 ("Stairway to the Stars") impossible geometry.
  - **Level 7 Fixes**:
    - Fixed "Call ???" data loss bug.
    - Fixed UI flickering between Main/Function tabs.
    - Fixed incorrect hint logic.
    - Fixed execution visualization persistence (green checks).
    - Improved "Call" block feedback (immediate success mark).

## Phase 17: Deployment & Distribution (Completed)

**Date:** November 30, 2025

**Summary:**
Prepared the application for public release by implementing a robust Progressive Web App (PWA) strategy and configuring the deployment pipeline. Implemented a custom Service Worker with a "Kill Switch" for emergency updates and offline-first caching. Configured Vercel hosting with Postgres database integration.

**Key Deliverables:**

- **PWA Implementation**:
  - Custom `service-worker.ts` with precaching and runtime caching.
  - "Kill Switch" logic to force updates when critical bugs are fixed.
  - `manifest.json` and app icons for installability.
  - `OfflineIndicator` component for network status feedback.
- **Deployment Setup**:
  - Configured `adapter-auto` for Vercel deployment.
  - Set up Drizzle ORM with Postgres (local Docker + Vercel Postgres).
  - Created `docker-compose.yml` for local development database.
- **Infrastructure**:
  - `sw-manager.ts` for client-side Service Worker lifecycle management.
  - `feedback.ts` service with offline queueing support.

## Phase 18: Visual Regression Testing & Deployment (Completed)

**Date:** November 30, 2025

**Summary:**
Established a robust "Design Review" workflow using automated visual regression testing with Playwright. This system acts as a safety net for UI changes and a tool for reviewing design updates. Additionally, finalized the deployment pipeline by provisioning a Neon Postgres database via the Vercel Marketplace and successfully deploying the application to production.

**Key Deliverables:**

- **Visual Regression Testing**:
  - Configured `playwright.config.ts` for visual comparison tests.
  - Created `e2e/visual.spec.ts` covering Home, Library, Game, and Builder.
  - Added NPM scripts (`test:visual`, `test:visual:review`, `test:visual:approve`) for the workflow.
- **Deployment**:
  - Provisioned Neon Postgres database on Vercel.
  - Configured `drizzle.config.ts` and environment variables for production.
  - Pushed database schema to production.
  - Verified live deployment at `https://learn-coding-q0z9g8l76-yehuda-katzs-projects.vercel.app`.

## Phase 18 Polish: Backward Compatibility & CI Optimization (Completed)

**Date:** November 30, 2025

**Summary:**
Ensured backward compatibility for existing user-created levels following the "Targeting Workflow" refactor and optimized the CI pipeline for faster, more reliable feedback. Implemented a schema migration layer to automatically transform legacy `highlight` fields into the new `targets` array format. Additionally, restored missing system default emojis in the Builder and expanded visual regression test coverage.

**Key Deliverables:**

- **Schema Migration**: Updated `StorySegmentSchema` and `HintSchema` in `src/lib/game/schema.ts` with `z.preprocess` logic to handle legacy data formats transparently.
- **CI Optimization**:
  - Implemented caching for Playwright browsers to reduce build times.
  - Configured visual regression tests to be non-blocking in CI, allowing the build to pass while visual diffs are reviewed separately.
- **Visual Testing**: Added `e2e/visual-extended.spec.ts` to cover Design System, Pack Details, and Builder states.
- **Bug Fixes**: Restored system default emojis and characters in the Builder configuration dropdowns.

## Phase 19: The Architect's Polish (Completed)

**Date:** November 30, 2025

**Summary:**
Refined the Builder and Game experience based on direct feedback from our primary persona, Jonas. This phase focused on visual polish, builder usability enhancements, and content refinement. Key improvements include a new "Ghost" move system for story segments, granular targeting for tutorials, and a significant expansion of the "endgame" content with the "Gauntlet" and "Hard" packs.

**Key Deliverables:**

- **Builder Enhancements**:
  - **Story Reordering**: Implemented Drag & Drop and "Ghost" move system for story segments.
  - **Granular Targeting**: Enabled targeting of specific block properties (Repeat Count, Function Name) for tutorials.
  - **Visual Polish**: Updated "Clear Blocks" icon to Broom (via `@lucide/lab`) and improved "Call ???" block empty state.
- **Content Expansion**:
  - **Gauntlet Pack**: Polished narrative and mechanics for Levels 9-11.
  - **Hard Pack ("The Void")**: Created a new expert-level pack with a purple "glitch" theme (Levels 12-14).
- **UX Improvements**:
  - Updated "Architect's Library" back button to use SVG arrow.
  - Refined "Move" mechanics in Story Editor to auto-open the timeline.

## Phase 20: Function UX & Builder Polish (Completed)

**Date:** December 1, 2025

**Summary:**
Addressed remaining usability issues in the Builder and improved the Function creation workflow. This phase focused on refining the "Call Function" block behavior, adding visual polish to the Builder (Glassomorphism), and implementing a robust Undo/Redo system for the Level Editor.

**Key Deliverables:**

- **Function UX**:
  - Improved `CallBlock` to show distinct states: "Select...", "Deleted", and "No Functions".
  - Added visual cues (red border/text) for invalid states.
- **Builder Polish**:
  - **Glassomorphism**: Added a frosted glass effect to the "Cover" tile.
  - **Undo/Redo**: Implemented a full state history stack for the Level Builder using `$state.snapshot`.
  - **Loop Config**: Added a custom input field for loop counts.
  - **UI Cleanup**: Removed redundant tile dropdown and updated button text.

## Phase 21: P2P Sharing (Completed)

**Date:** December 1, 2025

**Summary:**
Enabled Architects to share their creations directly with Explorers without a centralized server. Implemented a WebRTC-based P2P sharing system that uses QR codes for the initial handshake (signaling), allowing for direct device-to-device transfer of levels and packs. This feature works entirely offline and leverages the PWA architecture.

**Key Deliverables:**

- **P2P Service**: `P2PConnection` class handling WebRTC offer/answer exchange and data channels.
- **Share UI**:
  - `ShareModal`: Generates shareable links and QR codes for single levels.
  - `P2PModal`: Step-by-step wizard for the "Sender" and "Receiver" handshake flow.
- **QR Code Integration**: Dynamic QR code generation for signaling data.
- **Offline Support**: Verified functionality in offline-first PWA context.

## Phase 22: Mobile & Phone Polish (Completed)

**Date:** December 1, 2025

**Summary:**
Optimized the application for mobile devices and touch interactions, ensuring a native-like experience on small screens. This phase involved a comprehensive audit of touch targets, implementation of responsive stacked layouts for the Game and Builder, and the conversion of static toolbars into floating bottom sheets. Additionally, native HTML5 Drag and Drop was verified as the baseline for mobile, simplifying the tech stack.

**Key Deliverables:**

- **Touch Target Audit**: Systematically updated all interactive elements to meet the 44px minimum size.
- **Mobile Layouts**:
  - Implemented vertical stack layout for Game and Builder modes on mobile.
  - Converted control bars to floating bottom sheets for better thumb reachability.
  - Optimized `InstructionBar` and `StatusPanel` for compact screens.
- **UX Polish**:
  - Refined P2P sharing flow (auto-detection of intent).
  - Simplified Function configuration UI.
  - Fixed scrolling issues in Tray configuration panels.
- **Visual Polish**:
  - Upgraded typography to variable fonts (`Outfit`, `Inter`, `JetBrains Mono`).
  - Refined visual presentation of status indicators.

## Phase 24: Visual Polish & Coverage (Completed)

**Date:** December 1, 2025

**Summary:**
Addressed remaining visual friction points (especially on mobile) and established a comprehensive visual regression test suite. This phase also included an ad-hoc "Schema Stability" initiative to ensure backward compatibility for user data.

**Key Deliverables:**

- **Visual Regression Suite**:
  - Created `e2e/visual-comprehensive.spec.ts` covering Home, Library, Game, and Builder.
  - Implemented "Golden Master" testing for schema stability (`src/fixtures/levels/v1`).
- **Mobile Polish**:
  - Fixed `BuilderGoalModal` overflow on small screens.
  - Implemented responsive stacking for the Library header.
  - Verified horizontal scrolling for the Builder toolbar.
- **Schema Stability**:
  - Created comprehensive JSON fixtures for all level features.
  - Implemented `schema-compat.test.ts` to validate fixtures against the Zod schema.

## Phase 25: Variables & Memory ("The Thought Bubble") (Completed)

**Date:** December 2, 2025

**Summary:**
Implemented the "Thought Bubble" variable system, introducing the concept of state and possession to the game. This allows the character to pick up items (like keys) and use them as parameters in blocks (like Loop counts). The system uses a "Held Item" token that can be dragged or clicked to assign its value to other blocks.

**Key Deliverables:**

- **Core Logic**:
  - Updated `GameModel` to track `heldItem`.
  - Implemented `PickUp` block logic.
  - Implemented `VariableRef` parameter resolution in `StackInterpreter`.
- **UI Components**:
  - **Held Item Token**: A draggable/clickable token in the Tray representing the character's inventory.
  - **Loop Badge**: Clickable badge on Loop blocks to assign variables.
  - **Loop Popover**: Added "Use Held Item" button for quick assignment.
- **Interaction Design**:
  - Implemented "Click-Click" interaction pattern (Select Source -> Click Target) as an alternative to Drag-and-Drop.
- **Testing**:
  - Added unit tests for the new "Click-Click" interaction flow.
  - Enforced code coverage thresholds in CI.

## Phase 26: Variable Interaction Refinement (Completed)

**Date:** December 2, 2025

**Summary:**
Refined the "Variables" feature based on user feedback, improving visual affordances and type safety. The "Thought Bubble" metaphor was strengthened with clearer iconography and drop zones. Strict typing was enforced to prevent invalid variable assignments (e.g., dropping a string into a number field).

**Key Deliverables:**

- **Visual Affordances**:
  - Updated "Brain" icon and "Thought Bubble" visual style.
  - Added clearer drop zone indicators for variable targets.
- **Targeting Mode**:
  - Implemented visual pulsing for valid targets when dragging a variable.
- **Strict Typing**:
  - Enforced type checks in `InteractionManager` to prevent invalid drops.
- **Narrative**:
  - Updated level intros to explain the "Thought Bubble" concept.

## Phase 27: Component Architecture & Shared Abstractions (Completed)

**Date:** December 2, 2025

**Summary:**
Refactored the core interaction logic into a "Headless Interaction System" and implemented "Native Modality" support. This separation of concerns allows for robust, testable interaction patterns (Drag-and-Drop, Click-Click, Keyboard) that are decoupled from the UI rendering. The system uses a central `InteractionManager` and `InteractionRegistry` to coordinate state, while `dnd.ts` adapters handle the specific input methods.

**Key Deliverables:**

- **Headless Interaction System**:
  - `InteractionManager`: Central state machine for interaction sessions (Source, Target, Candidates).
  - `InteractionRegistry`: Registry for interactive elements (Blocks, Slots, Tokens).
  - `InteractionSession`: Transient state object for active interactions.
- **Native Modality**:
  - **Drag-and-Drop**: Implemented via `@atlaskit/pragmatic-drag-and-drop` adapters in `dnd.ts`.
  - **Click-Click**: Implemented via `ActionManager` for accessible, pointer-based interactions.
- **Refactoring**:
  - Updated `Tray.svelte` and `Block.svelte` to use the new system.
  - Removed ad-hoc event handling logic from components.
- **Testing**:
  - Comprehensive unit tests for `InteractionManager`, `dnd` adapters, and `Tray` integration.
  - Verified "Click-Click" and "Drag-and-Drop" flows.

## Phase 28: Test Coverage & Quality Assurance (Completed)

**Date:** December 2, 2025

**Summary:**
Hardened the codebase by significantly increasing test coverage and resolving technical debt. This phase focused on ensuring the stability of critical systems like the Builder, Interpreter, and File System integration. We also addressed strict linting rules and type safety issues to ensure a clean and maintainable codebase.

**Key Deliverables:**

- **Test Coverage**:
  - **BuilderModel**: Added comprehensive tests for grid manipulation, tool selection, and persistence.
  - **StackInterpreter**: Expanded tests for error handling, complex control flow, and game mechanics.
  - **SoundManager**: Added tests for audio playback logic and state persistence.
  - **FileSystemService**: Recreated and fixed tests for the File System Access API wrapper.
- **Quality Assurance**:
  - **Linting**: Resolved strict ESLint errors (`no-explicit-any`, `no-unused-vars`) across the codebase.
  - **Type Safety**: Fixed type mismatches in `LevelPack` schema and test mocks.
  - **CI Enforcement**: Updated coverage thresholds to block regressions in critical files.
- **Refactoring**:
  - **Dependency Injection**: Refactored `FileSystemService` and `PersistenceService` for better testability.
  - **Mocking**: Improved mock implementations for browser APIs (`AudioContext`, `FileSystemHandle`).

## Phase 29: Variable Visual Feedback (Completed)

**Date:** December 2, 2025

**Summary:**
Refined the visual representation of variables to strengthen the "Memory" metaphor. Added a "Brain" icon to the held item (Thought Bubble) and variable slots in blocks, while keeping the item on the ground simple (raw value). This distinction clarifies that the "Brain" represents the character's internal storage. Also improved grid rendering to prevent visual clutter when the character stands on an item.

**Key Deliverables:**

- **Visual Metaphor**:
  - **Thought Bubble**: Added `Brain` icon to indicate "Memory".
  - **Ground Item**: Kept simple (no icon) to distinguish from held state.
  - **Variable Slots**: Added "Mini Brain Token" to Loop blocks when a variable is used.
- **Grid Polish**:
  - **Overlap Handling**: Hidden items on the ground when the character is standing on them.

## Phase 29 Polish: Variable Visual Refinement (Completed)

**Date:** December 2, 2025

**Summary:**
Further refined the "Variables" visuals based on user feedback. The "Thought Bubble" is now persistent (showing an empty state) to solidify the memory metaphor, and items on the ground now "dock" to the corner when the character stands on them, ensuring they remain visible.

**Key Deliverables:**

- **Persistent Thought Bubble**: Always visible; shows dashed outline/gray brain when empty.
- **Corner Docking**: Ground items move to the top-right corner when the character overlaps them.
