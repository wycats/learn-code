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

## Phase 10: The Librarian (Completed)

**Goal:** Organize content into cohesive collections and improve the discovery experience.

- [x] **Level Packs**: Support for grouping levels into Campaigns/Packs.
- [x] **Home Screen Redesign**: A visual overhaul of the level selection screen.
- [x] **Metadata & Ratings**: Difficulty, tags, and descriptions for levels.
- [x] **Persistence Upgrade**: Robust local storage for user progress and content.

## Phase 11: The Campaign Builder (Completed)

**Goal:** Empower the Architect to create, edit, and organize Level Packs using a diagetic interface.

- [x] **Pack Editor**: UI to create/edit packs (Title, Description, Cover).
- [x] **Level Organizer**: Drag-and-drop interface to manage levels within a pack.
- [x] **Architect's Library**: A management screen for user-created campaigns.
- [x] **Diagetic Integration**: Seamless transition between playing and building.

## Phase 12: Quality Assurance & Polish (Completed)

**Goal:** Establish a robust testing culture and apply final polish to the Builder experience.

- [x] **Level Settings Polish**:
  - [x] **Diegetic Constraints**: Replace "Par/Limit" inputs with inline editing matching the Game Mode UI.
  - [x] **Visual Grid Resizer**: Add/remove rows and columns by clicking handles near the grid.
  - [x] **Biome Picker**: Replace dropdown with an icon-based popover (similar to character editor).
  - [x] **Clarify "Snapshot"**: Rename/redesign "Snapshot Tray" to clearly indicate "Set Starting Code".
- [x] **Level Organizer Polish**: Investigate and smooth out interactions in the drag-and-drop target UI.
- [x] **Unit Testing**: Expand coverage for core logic (Builder Model, Interpreter).
- [x] **Integration Testing**: Test critical flows (Level Loading, Pack Management).
- [x] **E2E Testing**: Playwright tests for the Builder and Game Loop.
- [x] **CI/CD**: Automated testing pipeline.

## Phase 13: Design & Reflection (Completed)

**Goal:** Deepen our understanding of the users (Personas) and the system's core laws (Axioms) to ensure the product remains coherent as it grows.

- [x] **Persona Enrichment**: Review and update personas based on the current implementation and "Builder" context.
- [x] **Fresh Eyes Review**: Conduct a comprehensive design review of the current app through the lens of each persona.
- [x] **The Constitution**: Flesh out `axioms.md` to define the immutable laws of the system.

## Phase 14: Navigation & Layout Polish (Completed)

**Goal:** Address high-priority friction points identified in Phase 13, focusing on navigation structure and mobile responsiveness.

- [x] **Home Screen Redesign**: Add a top-level "Create" entry point to make the Architect mode more accessible.
- [x] **Responsive Layout**: Implement a vertical stack layout for the Game and Builder interfaces on smaller screens.
- [x] **Builder UI Cleanup**: Organize the crowded Builder palette into logical groups or tabs.
- [x] **Navigation Consistency**: Standardize the "Back" button behavior across the app.
- [x] **Bug Fix**: Fix the "Story Mode" highlight target selection interaction.

## Phase 15: Advanced Builder Features

**Goal:** Bring advanced game mechanics into the Builder to support complex level design and empower "The Architect".

- [ ] **Functions in Builder**: UI for defining and editing "Magic Blocks" (Functions) within the Builder.
- [ ] **Advanced Logic**: Support for conditional blocks or more complex triggers if needed.
- [ ] **Jonas's Wishlist**:
  - [ ] **Difficulty Indicators**: Show difficulty on level cards.
  - [ ] **Selectable Icons**: Allow choosing icons for levels/packs.
  - [ ] **Speaker Avatars**: Show avatars in the dialogue system.
- [ ] **New Mechanics**:
  - [ ] **Hazards**: Spikes/Fire blocks (survival mechanic).
  - [ ] **Pack-wide Tiles**: Define custom tiles (e.g., Lava) reusable across a pack.
- [ ] **Local File System Access**: Implement `window.showDirectoryPicker` (Project Fugu) to allow Architects to save/load packs directly to their real file system.

## Phase 16: Content Audit & Polish

**Goal:** Review and refine the built-in levels to ensure they align with the new design axioms and utilize the latest engine features.

- [ ] **Level Review**: Playtest all built-in levels (1-9) and verify they meet the "Low Floor, High Ceiling" axiom.
- [ ] **Hint Coverage**: Ensure all levels have appropriate hints and guide interactions.
- [ ] **Visual Polish**: Update level thumbnails and descriptions.
- [ ] **Feedback Mechanism**: Add a simple way for users to send feedback (e.g., mailto link).

## Phase 17: Deployment & Distribution

**Goal:** Prepare the application for public release.

- [ ] **Build Optimization**: Minimize bundle size and asset loading.
- [ ] **PWA Configuration**: Ensure the app is installable and works offline.
- [ ] **Hosting Setup**: Configure deployment pipeline (e.g., Vercel, Netlify, or GitHub Pages).
- [ ] **Analytics (Privacy-First)**: Implement basic, privacy-respecting usage tracking (optional).

## Phase 18: Curriculum Expansion (Post-Launch)

**Goal:** Introduce advanced programming concepts like Variables and Scoping.

- [ ] **The Box Metaphor**: Design and implement variables using a physical "box" metaphor for scoping.
- [ ] **Curriculum Update**: Create new levels to teach these concepts.
