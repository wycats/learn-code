# Project Plan Outline: Wonderblocks Learning Tool

## Phase 1: Foundation & Research (Completed)

**Goal:** Establish the pedagogical and technical foundation for the project.

- [x] Document core pedagogy (Wonderblocks).
- [x] Research and document prior art.
- [x] Define core mechanics and MVP scope.
- [x] Create initial technical architecture plan.
- [x] Set up project structure (SvelteKit/Vite).

## Phase 2: Modern CSS Foundation (Completed)

**Goal:** Establish a robust, future-proof styling architecture using Baseline 2025 features.

- [x] Configure Open Props with a semantic token layer (Brand, Surface, Text).
- [x] Implement Dark Mode using `light-dark()` and semantic tokens.
- [x] Refine "Every Layout" primitives to use modern CSS (Logical Properties, etc.).
- [x] Establish Touch-First sizing defaults (min 44px targets).
- [x] Create a "Kitchen Sink" style guide page to validate the design system.

## Phase 3: Prototype / MVP (Completed)

**Goal:** Build a functional "unplugged-digital" prototype to test the core "Stop & Go" mechanic.

- [x] Implement the "Stop" (Planning) mode interface (Touch-First Drag & Drop).
- [x] Implement the "Go" (Execution) mode interface.
- [x] Create basic "Do Blocks" (Sequencing).
- [x] Build a simple level/scenario (e.g., "Cross the River").
- [x] Implement the "Play" execution engine.

## Phase 4: Content & Curriculum (Completed)

**Goal:** Develop the first narrative-driven learning module.

- [x] Design the first story arc.
- [x] Implement the 11-step problem-solving framework in the UI.
- [x] Add "Again" (Loop) blocks.
- [x] Create a "Debugging" scenario.

## Phase 5: Interactive Pedagogy (Completed)

**Goal:** Transform the "Tutorial" from a passive reading experience into an interactive, non-blocking coaching system.

- [x] **Technical Refactor**: Encapsulate state maps for in-place reactivity.
- [x] **UI**: Implement persistent "Instruction Bar" above the stage.
- [x] **Interaction**: Add "Spotlight" system to highlight UI elements.
- [x] **Triggers**: Allow story to advance based on user actions.
- [x] **Polish**: Smooth character animations.

## Phase 6: Advanced Concepts (Completed)

**Goal:** Introduce complex programming concepts.

- [x] **Functions**: "Higher Order Blocks" (Callbacks).
- [x] **Audio**: Voiceover and soundscapes.
- [x] **UI Polish**: Contextual Configuration for blocks.

## Phase 7: Tutorial System Expansion (Completed)

**Goal:** Flesh out the interactive tutorial system to support complex, multi-stage guidance and non-linear progression.

- [x] **Fresh Eyes Review**: Conduct a holistic review of the current UX/UI and codebase to identify friction points before adding new complexity.
- [x] **Contextual Hints**: System for detecting user struggle and offering specific hints.
- [x] **Rich Media**: Support for diagrams/animations within the instruction bar.
- [x] **Guide Character**: Introduce a "Guide" character (e.g., a robot helper) who delivers the tutorial content.

## Phase 8: Level Builder (Completed)

**Goal:** Create an in-game editor to allow users to create, test, and share custom levels with a "Super Mario Maker" feel.

- [x] **Editor UI**: "Builder Tray" for painting terrain and placing actors.
- [x] **Interaction**: Seamless switching between "Edit" and "Test" modes.
- [x] **Configuration**: "Backpack" UI for defining available blocks.
- [x] **Serialization**: Export/Import levels as JSON.
