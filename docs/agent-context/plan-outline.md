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

## Phase 15: Advanced Builder Features (Completed)

**Goal:** Bring advanced game mechanics into the Builder to support complex level design and empower "The Architect".

- [x] **Functions in Builder**: UI for defining and editing "Magic Blocks" (Functions) within the Builder.
- [x] **Advanced Logic**: Support for conditional blocks or more complex triggers if needed.
- [x] **Jonas's Wishlist**:
  - [x] **Difficulty Indicators**: Show difficulty on level cards.
  - [x] **Selectable Icons**: Allow choosing icons for levels/packs.
  - [x] **Speaker Avatars**: Show avatars in the dialogue system.
- [x] **New Mechanics**:
  - [x] **Hazards**: Spikes/Fire blocks (survival mechanic).
  - [x] **Pack-wide Tiles**: Define custom tiles (e.g., Lava) reusable across a pack.
- [x] **Local File System Access**: Implement `window.showDirectoryPicker` (Project Fugu) to allow Architects to save/load packs directly to their real file system.

## Phase 16: Content Expansion & Narrative Polish (Completed)

**Goal:** Expand the "endgame" content with a challenging "Gauntlet" pack and deepen the narrative experience by framing it as a playful dialogue between the Architect (Jonas) and the Explorer (Zoey).

- [x] **Narrative Deepening**: Rewrite level intros/outros to reflect the "Jonas vs. Zoey" dynamic.
- [x] **Gauntlet Expansion**: Create Levels 10 ("Slippery Slopes") and 11 ("The Floor is Lava") to complete the challenge pack.
- [x] **Content Audit**: Playtest and polish Levels 1-9, ensuring hint coverage and metadata quality.
- [x] **Feedback Mechanism**: Add a simple `mailto` feedback link.

## Phase 17: Deployment & Distribution (Completed)

**Goal:** Prepare the application for public release.

- [x] **Build Optimization**: Minimize bundle size and asset loading.
- [x] **PWA Configuration**: Ensure the app is installable and works offline.
- [x] **Hosting Setup**: Configure deployment pipeline (e.g., Vercel, Netlify, or GitHub Pages).
- [x] **Analytics (Privacy-First)**: Implement basic, privacy-respecting usage tracking (optional).

## Phase 18: Visual Regression Testing (Completed)

**Goal:** Ensure the visual integrity of the application across updates by implementing automated visual regression testing.

- [x] **Playwright Setup**: Configure Playwright for visual comparison tests.
- [x] **Baseline Creation**: Establish baseline screenshots for key UI states (Game, Builder, Home).
- [x] **CI Integration**: Integrate visual tests into the CI pipeline to catch regressions on PRs.
- [x] **Flakiness Management**: Implement strategies to handle dynamic content and animations in screenshots.

## Phase 19: Authentication Strategy

**Goal:** Evaluate and implement a robust authentication strategy to support cloud persistence and user accounts.

- [ ] **Evaluate Neon Auth**: Investigate Neon Auth features and suitability for the project.
- [ ] **Decision Record**: Document the decision between Neon Auth and Custom Auth.
- [ ] **Implementation**: Implement the chosen authentication strategy.
- [ ] **Cloud Persistence**: Enable saving user progress and levels to the cloud.

## Phase 20: P2P Sharing

**Goal:** Enable Architects to share their creations directly with Explorers without a centralized server.

- [ ] **Magic QR Codes**: Implement compressed JSON-to-QR encoding for single-level sharing.
- [ ] **WebRTC Handshake**: Implement a simple signaling mechanism for direct device-to-device transfer of larger packs.
- [ ] **Offline Support**: Ensure sharing works gracefully with cached app assets.

## Phase 21: Feedback System

**Goal:** Create a robust feedback loop that empowers users to report issues with full context.

- [ ] **Screenshot Capture**: Ability to attach a screenshot of the current state.
- [ ] **State Dump**: Automatically attach the current level JSON and interpreter state.
- [ ] **Offline Queue**: Ensure feedback is queued and sent when online (already partially implemented).
- [ ] **Admin Dashboard**: Simple view to triage feedback (optional/later).

## Phase 22: Curriculum Expansion (Post-Launch)

**Goal:** Introduce advanced programming concepts like Variables and Scoping.

- [ ] **The Box Metaphor**: Design and implement variables using a physical "box" metaphor for scoping.
- [ ] **Curriculum Update**: Create new levels to teach these concepts.
