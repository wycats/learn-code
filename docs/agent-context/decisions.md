# Architectural Decisions Log

## Phase 1: Foundation & Research

### 1. Pedagogy: "Stop & Go" Model

**Decision:** Adopt a strict separation between "Planning" (Stop) and "Execution" (Go) modes.
**Context:** Many coding toys (ScratchJr) allow real-time tinkering. While fun, this can lead to trial-and-error without understanding.
**Consequence:** The UI must clearly distinguish these modes. The execution engine must support a "step-by-step" visualization of the plan running.

### 2. Visual Style: "Modern Matte" & Open Props

**Decision:** Use a flat, tactile, "Modern Matte" aesthetic implemented via **Open Props**.
**Context:** We rejected the "Toy Box" (glossy, skeuomorphic) style to reduce cognitive load. We rejected Tailwind to keep markup clean and enforce a strict design system.
**Consequence:** We rely on CSS variables for all design tokens. We target **Baseline 2025** (using `light-dark()`, `@layer`, etc.) to avoid legacy hacks.

### 3. Execution Engine: Custom "Mimic" Interpreter

**Decision:** Build a custom TypeScript interpreter ("Mimic") instead of integrating Microsoft PXT immediately.
**Context:** PXT is powerful but complex to integrate and style. We need absolute control over the execution flow for the "Stop & Go" mechanics.
**Consequence:** We must maintain our own runtime. However, we will design the data structure to be compatible with PXT for potential future migration.

### 4. State Management: Svelte 5 Runes

**Decision:** Use Svelte 5 Runes (`$state`) for all game state.
**Context:** We considered XState but found it overkill for the MVP. Runes provide sufficient reactivity.
**Consequence:** We will implement "Undo" using a simple Snapshot History pattern (serializing the non-reactive state) rather than the Command Pattern.

### 5. CSS Architecture: "Every Layout" Primitives

**Decision:** Use compositional layout components (`Stack`, `Cluster`, `Grid`) instead of global layout classes.
**Context:** This keeps business logic components (like `Block` or `Character`) free of layout concerns, making them more reusable.
**Consequence:** We need to maintain a library of these primitives in `src/lib/components/layout`.

### 6. Interaction Model: Touch-First

**Decision:** Touch is the primary and required interaction model. Keyboard/Mouse are strictly enhancements.
**Context:** The target audience (3-8yo) primarily uses tablets. The interface must be fully functional and intuitive with touch alone.
**Consequence:**

- All interactive elements must have large touch targets (min 44px/48px).
- Drag-and-drop must be optimized for touch (no hover dependencies).
- "Keyboard Mode" is just the Touch UI with added shortcuts, not a separate interface.

## Phase 2: Modern CSS Foundation

### 7. CSS Layers for Specificity Management

**Decision:** Use CSS `@layer` (`reset`, `theme`, `base`, `layout`, `components`) to organize global styles.
**Context:** Managing CSS specificity can be difficult as the project grows. Layers provide a standard way to ensure resets and themes don't override component styles unintentionally.
**Consequence:** All global styles in `src/app.css` must be assigned to a layer.

### 8. Semantic Tokens with `light-dark()`

**Decision:** Define semantic tokens (e.g., `--surface-1`, `--text-1`) using the `light-dark()` function.
**Context:** We need to support both light and dark modes. Traditional media query approaches lead to code duplication or complex selector nesting.
**Consequence:** We can handle theme switching entirely within the CSS variable definitions, keeping the rest of the CSS theme-agnostic.

### 9. Container Queries for Layout Switching

**Decision:** Use Container Queries (`@container`) for the `Switch` component instead of the `flex-basis` hack.
**Context:** The `Switch` component needs to change layout based on available space, not viewport width. Container Queries are now Baseline 2025 and offer a more explicit and robust solution.
**Consequence:** The `Switch` component requires a wrapper with `container-type: inline-size`.

## Phase 3: Prototype / MVP

### 10. Generator Functions for Execution

**Decision:** Use JavaScript Generator Functions (`function*`) for the `Mimic` interpreter's execution loop.
**Context:** We need to pause execution between steps to allow the UI to render animations and the user to follow the logic. Callbacks or `setTimeout` chains are messy.
**Consequence:** The `runProgram` function yields control back to the UI loop after each step, allowing for clean `for await...of` consumption in the view layer.

### 11. Relative Movement Model (Logo-style)

**Decision:** Use relative movement commands (`Move Forward`, `Turn Left`, `Turn Right`) instead of absolute (`Move Up`, `Move Down`).
**Context:** This aligns with standard pedagogical progression (Logo, Bee-Bot) which emphasizes spatial reasoning and perspective taking ("body syntonicity").
**Consequence:** The `GameModel` must track `orientation` in addition to `position`.

### 12. Drag & Drop Library: `SortableJS`

**Decision:** Use `SortableJS` (via a custom Svelte action) for the block coding interface.
**Context:** We initially used `svelte-dnd-action` but found the UX to be "finicky" and "bouncy," especially with nested lists and layout shifts. `SortableJS` is a mature, robust library that handles these interactions more smoothly.
**Consequence:**

- We replaced `svelte-dnd-action` with `sortablejs`.
- We implemented a custom Svelte action (`src/lib/actions/sortable.ts`) to integrate it.
- We manage drag state manually (`src/lib/game/drag.svelte.ts`) to handle complex moves (like dragging from palette vs. moving existing blocks) and to sync Svelte state with Sortable's DOM mutations.

## Phase 4: Content & Curriculum

### 13. Data-Driven Levels (JSON + Zod)

**Decision:** Define levels in JSON files and validate them at runtime using Zod schemas.
**Context:** We initially hardcoded levels in TypeScript. However, to support future features like a Level Editor, database storage, or over-the-wire updates, we need a serializable format.
**Consequence:**

- `src/lib/game/schema.ts` is the source of truth for data types.
- Levels are stored in `src/lib/game/levels/*.json`.
- The application is robust against malformed data.

### 14. Drag & Drop Library: `@atlaskit/pragmatic-drag-and-drop`

**Decision:** Switch from `SortableJS` to `@atlaskit/pragmatic-drag-and-drop`.
**Context:** `SortableJS` caused layout shifts and had issues with nested "Again" blocks (dropping children vs. siblings). We needed a solution that strictly separates the "drag preview" from the "document flow" to prevent UI jumping.
**Consequence:**

- We implemented a "Blue Line" drop indicator system.
- The drag operation is purely visual until the drop occurs (no DOM mutation during drag).
- We gained better control over nested drop targets (header vs. body of loops).

### 15. Execution Engine: Stack-Based Interpreter

**Decision:** Refactor `Mimic` from Generator Functions to a Stack-Based Interpreter.
**Context:** Generators are great for forward execution, but we needed "Step Back" functionality for debugging. A stack-based approach allows us to serialize the entire execution state (including call stacks for loops) into snapshots.
**Consequence:**

- We can now implement "Time Travel" debugging (Step Forward/Back).
- The interpreter state is fully serializable.

### 16. Reactivity: `SvelteMap` and `SvelteSet`

**Decision:** Use `svelte/reactivity`'s `SvelteMap` and `SvelteSet` instead of native `Map`/`Set`.
**Context:** Svelte 5's `$state` proxying for native Maps is coarse-grained (updating a value triggers updates for all readers of the map). `SvelteMap` provides fine-grained reactivity.
**Consequence:**

- Improved performance for large collections.
- Eliminated `svelte/prefer-svelte-reactivity` lint warnings.

### 17. Audio: Procedural Web Audio API

**Decision:** Use the Web Audio API to generate sound effects procedurally (oscillators, noise buffers) instead of loading MP3/WAV assets.
**Context:** We want to keep the bundle size small and avoid asset management for simple UI sounds (clicks, pops, success chimes).
**Consequence:**

- Zero network requests for audio.
- Sounds are synthesized in real-time (`src/lib/game/sound.ts`).

## Phase 5: Interactive Pedagogy

### 18. In-Place Reactivity for Maps

**Decision:** Mutate `SvelteMap` instances in place using `clear()` and `set()` instead of reassigning the map reference.
**Context:** Reassigning a `SvelteMap` property (e.g., `game.executionState = new SvelteMap()`) breaks reactivity for components that hold a reference to the old map.
**Consequence:**

- Added `resetExecutionState()` and `restoreExecutionState()` methods to `GameModel`.
- Made map properties `readonly` to enforce this pattern.

### 19. Persistent Dashboard Layout

**Decision:** Allocate a fixed-height "Dashboard" area at the top of the game view for instructions and status.
**Context:** The previous modal-based tutorial blocked the view of the grid, preventing users from following instructions while acting. A dynamic height bar caused layout shifts that were disorienting.
**Consequence:**

- The stage is stable and does not jump when switching between Story and Planning modes.
- We have a dedicated space for "Mission Control" UI.

### 20. Interactive Triggers

**Decision:** Advance the story automatically based on game events (e.g., `block-placed`) rather than relying solely on a "Next" button.
**Context:** Clicking "Next" after performing an action felt redundant and disconnected.
**Consequence:**

- Added `advanceCondition` to the `StorySegment` schema.
- The `GameModel` now listens for and validates actions against the current story requirement.

## Phase 6: Advanced Concepts & Audio

### 22. Unified Editor Context

**Decision:** Use a single "Tray" component that switches context (Main Program vs. Function) rather than showing multiple editors side-by-side.
**Context:** Screen real estate is limited, especially on tablets. Showing multiple block lists simultaneously would clutter the UI.
**Consequence:**

- Added "Context Tabs" to the Tray.
- The `GameModel` tracks `editingContext`.
- Users focus on one scope at a time, reducing cognitive load.

### 23. Visual Execution Sync

**Decision:** Automatically switch the editor view to the active function during execution.
**Context:** The concept of a "Call Stack" is abstract. By visually jumping to the function definition when it is called, we make the flow of control concrete and observable.
**Consequence:**

- The `StackInterpreter` updates `game.editingContext` on every step.
- The UI must handle rapid context switching smoothly (using transitions).

### 24. Hybrid Audio System

**Decision:** Expand the `SoundManager` to support loading external assets (MP3/WAV) for voiceovers and music, while keeping procedural synthesis for UI SFX.
**Context:** While procedural audio is great for UI, we need high-quality recorded audio for character dialogue and ambient music to achieve the desired immersion.
**Consequence:**

- Added `playFile` and `playAmbient` methods to `SoundManager`.
- We now manage a mix of synthesized and asset-based audio.

### 25. Contextual Configuration Panel

**Decision:** Move block configuration (e.g., Loop counts) to a floating "Glassomorphism" panel in the Tray, triggered by selection.
**Context:** Inline controls on blocks were too small for touch and cluttered the block design. A modal would be too heavy. A contextual panel offers a balance of accessibility and unobtrusiveness.
**Consequence:**

- Blocks are cleaner and easier to read.
- Configuration options can be larger and more descriptive.
- We adopted a new visual layer (glass effect) to distinguish this "meta-UI" from the game UI.

## Phase 7: Level Builder

### 26. BuilderModel Separation

**Decision:** Create a dedicated `BuilderModel` class separate from `GameModel`.
**Context:** The Builder has unique state (selected tool, palette, history) that doesn't belong in the gameplay model. Overloading `GameModel` would make it brittle.
**Consequence:**

- `BuilderModel` wraps a `GameModel` instance for the preview but manages its own editing state.
- Clear separation of concerns between "Playing" and "Authoring".

### 27. Drag-to-Paint Interaction

**Decision:** Implement a "Drag-to-Paint" interaction model for the Grid Editor.
**Context:** Clicking individual cells to place terrain is tedious. Users expect to "draw" walls or water.
**Consequence:**

- Implemented `pointerdown`, `pointerenter`, and `pointerup` handlers on the Grid to support continuous painting.
- Added visual feedback (hover states) for the active tool.

### 28. JSON Serialization for Levels

**Decision:** Use standard JSON for level export/import.
**Context:** We need a portable format for sharing levels. TypeScript files are great for built-in levels but can't be easily shared or loaded dynamically by users.
**Consequence:**

- Created `serializeLevel` and `deserializeLevel` utilities.
- Levels can be saved to disk or shared via clipboard.

## Phase 8: Intelligent Tutoring System

### 29. Hint System: Idle & Attempt Triggers

**Decision:** Trigger hints based on "Idle Time" (no interaction) and "Failed Attempts" (running code that fails).
**Context:** We need to detect struggle without being annoying. Explicitly tracking "errors" is hard in a sandbox, but "failure to solve" is easy to track.
**Consequence:**

- Added `failedAttempts` and `lastInteractionTime` to `GameModel`.
- The game loop now checks these counters every second.

### 30. Guide Character: Dynamic SVG Avatar

**Decision:** Represent the Guide as a distinct entity using a dynamic SVG component (`Guide.svelte`).
**Context:** The tutorial text felt impersonal. A character (Robot) builds a connection. SVG allows for lightweight, scalable, and animatable emotions without heavy assets.
**Consequence:**

- `InstructionBar` now accepts a `speaker` prop.
- `Guide.svelte` handles internal animation states (blinking, talking) via CSS.

### 31. Story Segment IDs

**Decision:** Use explicit string `id`s for Story Segments instead of array indices.
**Context:** Array indices are brittle; inserting a new segment breaks all saved progress or logic that depends on "step 5".
**Consequence:**

- Updated `StorySegmentSchema` to require (or optionally allow) `id`.
- Updated trigger logic to reference segments by ID.

### 32. Rich Media in Instructions

**Decision:** Allow `StorySegment` to contain a `media` field (image URL) to be rendered inline.
**Context:** Text alone is insufficient for explaining spatial concepts like "loops" or "turns".
**Consequence:**

- `InstructionBar` layout updated to support an optional image slot.

### 33. Snapshot Strategy for Debugging Levels

**Decision:** Store `initialProgram` as part of the Level definition.
**Context:** We want to create "Fix the Bug" levels where the user starts with broken code.
**Consequence:**

- Added `initialProgram` to `LevelSchema`.
- Added a "Snapshot" tool in the Builder to capture the current tray state.

## Phase 13: Design & Reflection

### 34. Explicit Axioms ("The Constitution")

**Decision:** Codify implicit design rules into an explicit `axioms.md` document.
**Context:** As the project grows, "tribal knowledge" about design values (e.g., "No Hidden State", "Touch First") risks being lost or diluted.
**Consequence:**

- Future decisions must be weighed against these axioms.
- New contributors (or agents) have a clear "Constitution" to follow.

### 35. Strict Linting for Code Quality

**Decision:** Enforce strict linting rules, including `void` for floating promises and removing unused variables.
**Context:** The codebase had accumulated technical debt in the form of unused code and potential race conditions (unawaited `goto`).
**Consequence:**

- We spent significant time cleaning up the codebase.
- The CI pipeline is now stricter, preventing future regressions.
- We use `void goto(...)` to explicitly acknowledge that we are not awaiting navigation in certain fire-and-forget contexts.

## Phase 15: Advanced Builder Features

### 36. File System Access API (Project Fugu)

**Decision:** Use the File System Access API (`showDirectoryPicker`) for local file integration instead of the legacy `<input type="file">`.
**Context:** We want to allow users to "Link" a pack to a folder on their disk, enabling a true "IDE-like" experience where changes sync automatically. The legacy API only allows one-time imports.
**Consequence:**

- We can persist file handles in IndexedDB.
- We need to handle permission prompts gracefully (browser security model).
- This feature is only available in secure contexts (HTTPS/localhost) and modern browsers.

### 37. Inline Status Feedback

**Decision:** Replace global toasts and blocking alerts with inline, contextual status messages (e.g., "Saved!" next to the button).
**Context:** During the "Link to Disk" implementation, we found that frequent toasts for auto-sync events were distracting, and alerts were intrusive.
**Consequence:**

- Created a lightweight, local state pattern for status messages in `BuilderToolbar` and `PackEditor`.
- Improved immersion by keeping feedback localized to the user's locus of attention.

### 38. Function Definition in Builder

**Decision:** Treat Functions as a separate "Editing Context" within the Builder, similar to how they work in the Game.
**Context:** We needed a way to define the _body_ of a function. Opening a modal would disconnect the user from the tray.
**Consequence:**

- Reused the `editingContext` logic from the GameModel.
- The Builder Tray switches tabs/context when editing a function, just like the Game Tray.

## Phase 18: Visual Regression Testing

### 39. Design Review Workflow

**Decision:** Treat visual regression testing as a "Design Review" tool, not just a bug catcher.
**Context:** In a visual-heavy application, "changes" are often intentional design iterations. A binary "pass/fail" CI check is insufficient. We need a workflow to _see_ the changes and approve them.
**Consequence:**

- We configured Playwright to **not** block the CI/local run on failure (generating a report instead).
- We created specific scripts (`test:visual:review`, `test:visual:approve`) to facilitate this human-in-the-loop workflow.
- We accept that "failed tests" in this context often mean "pending design review".

## Phase 18: Deployment & Infrastructure

### 40. Neon Postgres via Marketplace

**Decision:** Use the **Neon** integration from the Vercel Marketplace instead of the native "Vercel Postgres" offering.
**Context:** Vercel is transitioning its native Postgres service to be fully managed by Neon via the Marketplace. Using the Marketplace integration ensures we are on the supported path with feature parity.
**Consequence:**

- We provisioned the database via the Marketplace flow.
- We use standard Postgres connection strings (`POSTGRES_URL`) compatible with `@vercel/postgres` and Drizzle.

### 41. Custom Authentication (No Managed Auth)

**Decision:** Explicitly disable Neon's "Auth" feature and rely on our custom implementation.
**Context:** Our application already has a robust, custom authentication system built with `@oslojs/crypto` and `@node-rs/argon2`. Enabling a managed auth service would introduce unnecessary complexity and redundancy.
**Consequence:**

- We maintain full control over the `user` and `session` tables in our schema.
- We avoid vendor lock-in for the authentication layer.

## Phase 19: The Architect's Polish

### 42. Granular Targeting via Callbacks

**Decision:** Implement granular targeting (e.g., specific badges on a block) by threading an `onTarget` callback prop down the component tree.
**Context:** The tutorial system needed to highlight specific sub-elements of a block (like the loop count or function name) which are deeply nested inside the `Block` component. CSS selectors were brittle.
**Consequence:**

- `Block.svelte` now accepts an `onTarget` prop.
- We can programmatically trigger highlights on specific internal elements without exposing their DOM structure globally.

### 43. "Ghost" Interaction Pattern for Reordering

**Decision:** Adopt a "Ghost" interaction pattern (Click to Select -> Click Ghost to Move) for reordering story segments, mirroring the main program builder.
**Context:** We initially considered simple Up/Down buttons, but this felt inconsistent with the rest of the app's "tactile" philosophy. Drag and Drop is good, but "Click-Click" is more accessible and precise for touch.
**Consequence:**

- The `BuilderStoryBar` now has a distinct "Move Mode".
- We reuse the mental model established in the main gameplay loop.

### 44. Icon Library Expansion (@lucide/lab)

**Decision:** Install `@lucide/lab` to access experimental icons (specifically `Broom`).
**Context:** The standard `lucide-svelte` library didn't have a suitable "Clear/Sweep" icon. We preferred using the official experimental lab over importing a custom SVG to maintain design consistency.
**Consequence:**

- We now have a dependency on `@lucide/lab`.
- We can access a wider range of icons for specific metaphors.

## Phase 20: Function UX & Builder Polish

### 46. Smart Theme Cycle

**Decision:** Implement a "Smart Cycle" for the theme toggle (System -> Dark -> Light) instead of a simple binary toggle or a dropdown.
**Context:** Users often want to quickly check how the app looks in a specific mode. A binary toggle that respects system preference by default can be confusing if the user doesn't know their system setting. A dropdown is too heavy.
**Consequence:**

- The toggle button cycles through three states.
- We prioritize immediate visual feedback (forcing Dark/Light) over returning to "System" (which is the default state but might not change the visual appearance).

## Phase 28: Test Coverage & Quality Assurance

### 47. Dependency Injection for Services

**Decision:** Refactor `FileSystemService` and `PersistenceService` to use Dependency Injection (DI) via constructor arguments in models.
**Context:** Previously, these services were imported directly as singletons or global objects. This made unit testing `BuilderModel` and `GameModel` difficult because we couldn't easily mock the file system or local storage.
**Consequence:**

- `BuilderModel` now accepts `persistenceService` and `fileSystemService` in its constructor.
- We created `InMemoryFileSystemService` and `InMemoryPersistenceService` implementations for fast, isolated unit tests.
- The production code uses default parameter values to inject the real services, maintaining ease of use.

### 48. Strict Linting Enforcement

**Decision:** Enable and enforce strict ESLint rules, specifically `no-explicit-any` and `no-unused-vars`.
**Context:** The codebase had accumulated "lazy" typing (`any`) and unused variables, which are potential sources of bugs and make refactoring harder.
**Consequence:**

- We spent time fixing or explicitly suppressing (with justification) all lint errors.
- `zod` schemas now use `z.preprocess` with safe casting instead of raw `any` casts where necessary.
- Test files use `_` prefix for unused mock arguments to signal intent.

### 49. Mocking Strategy for Browser APIs

**Decision:** Use `vi.stubGlobal` and custom mock classes for browser APIs like `AudioContext` and `FileSystemHandle`.
**Context:** `jsdom` (our test environment) does not implement these modern APIs. We needed a way to test logic that depends on them without mocking the entire universe.
**Consequence:**

- We created reusable mock implementations in test files.
- We aligned these mocks with the TypeScript interfaces to ensure type safety in tests.

## Phase 30: Builder Polish & Undo/Redo

### 50. Undo/Redo via State Snapshots

**Decision:** Implement Undo/Redo by capturing full state snapshots using `$state.snapshot` rather than the Command Pattern.
**Context:** The `BuilderModel` state is complex and deeply nested (grid, actors, logic, settings). Implementing a Command Pattern (reversible actions) for every possible mutation would be error-prone and verbose. Svelte 5's `$state.snapshot` allows us to cheaply serialize the reactive state.
**Consequence:**

- We store a stack of state objects.
- "Undo" simply replaces the current state with a previous snapshot.
- This approach is memory-intensive but acceptable for the scale of data we are handling (small JSON levels).

## Phase 30.5: Fresh Eyes Polish

### Generic HistoryManager

- **Context**: The Undo/Redo logic in `BuilderModel` was becoming complex and tightly coupled.
- **Decision**: Extract the logic into a generic `HistoryManager<T>` class.
- **Rationale**: This separates concerns, makes the history logic reusable (potentially for the Game loop later), and simplifies unit testing.

### P2P Manual Fallback

- **Context**: QR code scanning is convenient but fragile (lighting, camera quality).
- **Decision**: Add a manual "Copy/Paste Code" option as a fallback.
- **Rationale**: Ensures that P2P sharing is accessible even when hardware or environmental conditions prevent scanning. We chose a simple text-based exchange (base64 encoded JSON) as it is universal.
