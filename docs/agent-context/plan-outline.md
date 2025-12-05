# Project Plan Outline: Wonderblocks Learning Tool

## Epoch 1: Foundation & MVP

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

## Epoch 2: The Builder & Architect

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

## Phase 19: The Architect's Polish (Completed)

**Goal:** Refine the Builder and Game experience based on direct feedback from our primary persona, Jonas.

- [x] **Visual Polish**:
  - [x] "Clear blocks" icon update (Broom).
- [x] **Builder Enhancements**:
  - [x] Target repeat _count_ or function _name_ in Story Mode.
  - [x] Story segment reordering (Drag & Drop / Click-Click).
- [x] **Content Polish**:
  - [x] Finish "Gauntlet" pack (make it feel less random).
  - [x] Create "Hard" built-in pack (Purple theme).

## Phase 20: Function UX & Builder Polish (Completed)

**Goal:** Address remaining usability issues in the Builder and improve the Function creation workflow.

- [x] **Function UX**:
  - [x] Improve "Call ???" block behavior (empty state/disable).
- [x] **Builder Polish**:
  - [x] Glassomorphic UI for player occlusion (Cover block).
  - [x] Remove tile dropdown in Level Editor.
  - [x] Custom amount in Repeat blocks.
  - [x] Fix "Infinity" targeting (hide/disable).
  - [x] "Use test level" text update.
  - [x] Undo/Redo in Level Editor.

## Phase 21: P2P Sharing (Completed)

**Goal:** Enable Architects to share their creations directly with Explorers without a centralized server.

- [x] **Magic QR Codes**: Implement compressed JSON-to-QR encoding for single-level sharing.
- [x] **WebRTC Handshake**: Implement a simple signaling mechanism for direct device-to-device transfer of larger packs.
- [x] **Offline Support**: Ensure sharing works gracefully with cached app assets.

## Epoch 3: Refinement & Expansion

## Phase 22: Mobile & Phone Polish (Completed)

**Goal:** Optimize the experience for small screens and touch interactions, ensuring the app feels native on mobile devices.

- [x] **Touch Targets**: Audit and increase touch targets to meet accessibility standards (44px+).
- [x] **Mobile Layouts**: Refine the vertical stack layout for the Builder and Game on phones.
- [x] **Gesture Support**: Improve swipe and pinch interactions where appropriate. (Deferred)
- [x] **Keyboard Handling**: Ensure the virtual keyboard doesn't obscure critical UI elements.

## Phase 23: Dark Mode Deep Dive (Completed)

**Goal:** Conduct a comprehensive audit and polish of the dark mode experience to ensure visual consistency and comfort.

- [x] **Color Audit**: Review all semantic tokens and ensure sufficient contrast in dark mode.
- [x] **Shadows & Depth**: Adjust shadow values for dark backgrounds to maintain depth perception.
- [x] **Image Assets**: Ensure all icons and illustrations work well on dark backgrounds.
- [x] **Theme Toggle**: Verify the theme toggle persists and respects system preferences.

## Phase 24: Visual Polish & Coverage (Completed)

**Goal:** Address remaining visual friction points (especially on mobile) and establish a comprehensive visual regression test suite.

- [x] **Expanded Visual Coverage**: Create a dedicated test suite covering all major routes (Home, Library, Builder, Game).
- [x] **Mobile Polish**: Refine layout and spacing on the Packs and Builder screens based on visual feedback.
- [x] **Argos Integration**: Ensure the new test suite reports correctly to Argos CI.

## Phase 25: Variables & Memory ("The Thought Bubble") (Completed)

**Goal:** Implement the "Thought Bubble" variable system, allowing the character to pick up items, hold them (visible state), and use them in block parameters.

- [x] **Schema & State**: Update `CharacterState` to support holding items (Keys, Numbers).
- [x] **Visual Metaphor**: Implement the "Thought Bubble" visualization above the character.
- [x] **New Blocks**: Implement `PickUp` block and `VariableRef` parameter type.
- [x] **Editor Interaction**: Allow dragging the "Bubble Token" into block parameters.
- [x] **Curriculum**: Create "The Keeper of Keys" levels to teach possession.

## Phase 26: Variable Interaction Refinement (Completed)

**Goal:** Refine the "Variables" feature based on user feedback, improving visual affordances and type safety.

- [x] **Visual Affordances**: "Brain" icon, "Thought Bubble" metaphor, and clearer drop zones.
- [x] **Targeting Mode**: Visual pulsing for valid targets in Architect Mode.
- [x] **Strict Typing**: Enforce type safety for variable drops (e.g., Loop only accepts Numbers).
- [x] **Story Update**: Explain the metaphor in the level intro.

## Phase 27: Component Architecture & Shared Abstractions (Completed)

**Goal:** Extract shared interaction patterns into reusable components and test them rigorously.

- [x] **Interaction Abstraction**: Extract "Click-Click", "Drag", and "Focus" logic into shared primitives.
- [x] **Component Extraction**: Identify and refactor other shared UI patterns.
- [x] **Rigorous Testing**: Comprehensive unit and interaction tests for the new shared components.
- [x] **Collaborative Design**: Deep user involvement in the extraction and structuring process.

## Phase 28: Test Coverage & Quality Assurance (Completed)

**Goal:** Increase test coverage to a respectable level (e.g., 80%+) to ensure stability and prevent regressions.

- [x] **Coverage Analysis**: Identify critical low-coverage areas.
- [x] **Unit Tests**: Expand unit tests for UI components and game logic.
- [x] **Integration Tests**: Add integration tests for complex flows.
- [x] **CI Enforcement**: Tune coverage thresholds to block regressions.

## Phase 29: Variable Visual Feedback (Completed)

**Goal:** Address visual feedback regarding the variables feature to improve clarity and usability.

- [x] **Visual Audit**: Review current variable interactions and visual cues.
- [x] **Feedback Implementation**: Implement specific visual improvements requested by the user (Persistent Thought Bubble, Corner Docking, Pickup Animation).
- [x] **Refinement**: Polish animations and transitions for variable states.

## Phase 30: Builder Polish & Undo/Redo (Completed)

**Goal:** Address the deferred items from Phase 19 to refine the Level Builder experience, specifically focusing on Undo/Redo capabilities and visual refinements.

- [x] **Undo/Redo System**: Implement a robust Undo/Redo history for the Level Builder.
- [x] **Visual Polish**: Glassomorphic "Cover" block style, remove tile dropdown.
- [x] **Interaction Polish**: Custom input for Repeat Block count, disable targeting for "Infinity".
- [x] **Function UX**: Improve the UX for creating and managing functions.

## Phase 30.5: Fresh Eyes Polish (Completed)

**Goal:** Address friction points identified in the "Fresh Eyes Review II" and user feedback, focusing on mobile ergonomics, P2P sharing fallback, and code maintainability.

- [x] **HistoryManager Refactoring**: Extract Undo/Redo logic into a generic class.
- [x] **Mobile Polish**:
  - [x] Optimize Builder toolbar for mobile (hide Level Selector).
  - [x] **Tray Keypad**: Custom keypad for Loop blocks.
- [x] **Browser Support**: Graceful fallback for File System Access API.
- [x] **P2P Manual Fallback**: Add manual code entry/display for P2P sharing.
- [x] **Visual Polish**: Glassmorphic "Cover" block style.

## Phase 31: P2P Progress Sync (Completed)

**Goal:** Enable users to sync their progress (levels unlocked, stars earned) between devices without creating a cloud account, using the existing P2P infrastructure.

- [x] **Sync Logic**: Implement `SyncService` to merge progress data (best score wins).
- [x] **Sync UI**: Create `SyncModal` reusing the `P2PModal` component.
- [x] **Entry Point**: Add "Sync Devices" button to the Home screen.
- [x] **Verification**: E2E tests for the modal and visual regression.

## Phase 32: Sync Optimization & Builder Polish Refinement (Completed)

**Goal:** Optimize performance and verify the Builder Polish implementation.

- [x] **Sync Optimization**: Allocation-free Vector Clock comparison.
- [x] **Builder Verification**: Confirm text updates, styling, and Undo/Redo.

## Phase 33: Authentication & Cloud Foundation (Completed)

**Goal:** Implement the custom authentication system and "Parent/Child" profile model to enable cloud persistence.

- [x] **Database Schema**: Finalize User, Session, Profile, and DeviceAuth tables.
- [x] **Auth Implementation**: GitHub/Google OAuth, Parent Gate, and QR Handshake.
- [x] **UI Implementation**: Login Page, Profile Picker, and Parent Dashboard.

## Phase 34: Cloud Sync & Progress Tracking (Completed)

**Goal:** Enable seamless synchronization of game progress and user settings across devices using the authenticated profile system.

- [x] **Database Schema**: Create `user_progress` table.
- [x] **API Endpoints**: Create `/api/sync` for batch updates.
- [x] **Client Sync Service**: Update `SyncService` to support cloud sync.
- [x] **Conflict Resolution**: Implement "High Water Mark" logic.
- [x] **UI Integration**: Add sync status indicators.

## Phase 35: Fresh Eyes & Roadmap Review (Completed)

**Goal:** Review the project's trajectory, clean up deferred work, and conduct a "Fresh Eyes" audit of the recent features to ensure quality and coherence.

- [x] **Docs Cleanup**: Review and prune `ideas.md` and `deferred_work.md`.
- [x] **Fresh Eyes Audit**: Conduct a design and UX review of the Auth and Sync flows.
- [x] **Roadmap Update**: Refine the plan for the next 5 phases.

## Phase 36: The Field Guide (Completed)

**Goal:** Create an interactive, diegetic "Book" that serves as the game's manual, featuring multiple persona voices and interactive examples.

- [x] **Data Structure**: Define the schema for Book Chapters, Pages, and Interactive Widgets.
- [x] **UI Framework**: Build the "Book" component with page-turning animations and a responsive layout.
- [x] **Content Authoring**: Write the initial chapters (Survival Basics, Automation) with the three-voice system (Guide, Zoey, Jonas).
- [x] **Interactive Widgets**: Implement embedded "Playgrounds" and dynamic state reflection within the book pages.

## Epoch 4: Advanced Mechanics & Community

## Phase 37: Advanced Mechanics - The Boat

**Goal:** Implement the "Boat" mechanic suggested by Zoey, allowing the character to traverse water tiles when holding the boat item.

- [ ] **Schema Update**: Add 'boat' to ItemTypeSchema.
- [ ] **Builder Support**: Add "Boat" item to the Builder Tray.
- [ ] **Game Logic**: Update movement logic to allow entering water if holding a boat.
- [ ] **Visuals**: Render character in boat when on water.
- [ ] **Content**: Create "Row Your Boat" level.

## Phase 38: The Terrain Architect (Completed)

**Goal:** Empower the Architect to create complex custom terrain with configurable properties directly in the Builder, enabling "Hybrid" tiles and new mechanics.

- [x] **Tile Editor Upgrade**: Add UI to configure `passableBy` (Item) and `onEnter` (Effect) properties for custom tiles.
- [x] **Direct Value Manipulation**: Implement "Dial" interaction for numeric properties (drag up/down to change values) (Axiom 13).
- [x] **Visual Feedback**: Show icons/indicators on tiles in the Builder to represent their properties (e.g., a small boat icon for water, a skull for void).
- [x] **Void Visuals**: Implement the "shrink away" animation for the Void/Hazard death effect.
- [x] **Hybrid Terrain**: Verify and demo a "Magic Door" (Wall + PassableBy Key) tile.
- [x] **Stage Props**: Add decorative "Prop" tiles (trees, rocks) that have no logic but enhance the "Story" (Axiom 1).

## Phase 39: Community & Sharing

**Goal:** Empower Architects to share their creations with the world.

- [ ] **Export to GitHub**: Allow users to export their packs to a GitHub repository (via OAuth).
- [ ] **Public Library**: A simple read-only view of shared packs (curated or community).
- [ ] **Import from URL**: Ability to load a pack from a raw JSON URL.
- [ ] **Remixing**: Allow users to "Fork" a shared level to modify it (Axiom 3).

## Phase 40: Advanced Mechanics - Survival Mode

**Goal:** Deepen the gameplay with survival challenges.

- [ ] **Lives System**: A survival mechanic where hazards reduce a life counter.
- [ ] **New Hazards**: Fire, Moving Platforms, etc.

## Phase 41: Accessibility

**Goal:** Make the learning experience accessible to pre-literate and visually impaired users.

- [ ] **Text-to-Speech**: Use Web Speech API to read dialogue and instructions.
- [ ] **High Contrast Mode**: A specific theme for low-vision users.
- [ ] **Screen Reader Optimization**: Audit ARIA labels and focus management.

## Phase 42: The Kinetic Bridge

**Goal:** Implement the "Kinetic Language" interaction patterns to make the interface feel physical and responsive, bridging the gap between intent and action.

- [ ] **Snap-to-Intent**: Implement "Magnetic" drop targets that snap the preview ghost to the slot before release (Axiom 14).
- [ ] **Kinetic Deletion**: Allow "flinging" blocks away to delete them with a satisfying animation (Axiom 14).
- [ ] **The Lens**: Implement a long-press "Debug Lens" to inspect runtime state of blocks (Axiom 6).
- [ ] **Ghost Replay**: Visualize the "Staff Ghost" solution for verification (Axiom 4).

## Phase 43: Feedback System

**Goal:** Create a robust feedback loop that empowers users to report issues with full context.

- [ ] **Screenshot Capture**: Ability to attach a screenshot of the current state.
- [ ] **State Dump**: Automatically attach the current level JSON and interpreter state.
- [ ] **Offline Queue**: Ensure feedback is queued and sent when online (already partially implemented).
- [ ] **Admin Dashboard**: Simple view to triage feedback (optional/later).

## Phase 44: The Master Teacher

**Goal:** Empower the Architect with advanced tools to control the learning experience and provide context-aware guidance.

- [ ] **Story/Tutorial Control**:
  - [ ] **Unmask Blocks**: Allow the Architect to specify a point in the dialogue where the block tray becomes interactive.
  - [ ] **Interactive Tutorials**: Validate that the user performed a specific action before advancing the story.
- [ ] **Field Guide Improvements**:
  - [ ] **Context-Aware Manual**: Customize the Field Guide for the current level.
  - [ ] **Architect Control**: Give the Architect control over the Field Guide content for their levels.

## Phase 45: Engine Upgrade

**Goal:** Modernize the underlying execution engine to support advanced features and better performance.

- [ ] **PXT / MakeCode Integration**: Investigate using Microsoft's PXT as the underlying engine.
- [ ] **Zod Schema Diff**: Implement "Spec-ulation" rules for Zod schemas to prevent breaking changes.
- [ ] **Variables & Scoping**: Refine the variable system with lexical scoping and "box" metaphor.

## Phase 46: The Syntax Bridge

**Goal:** Bridge the gap between block-based coding and real-world text-based syntax.

- [ ] **Code View**: A read-only panel showing the generated JavaScript/TypeScript code for the current program.
- [ ] **Syntax Highlighting**: Use Shiki or similar to highlight the code.
- [ ] **Live Updates**: Code updates in real-time as blocks are dragged.

## Phase 47: Advanced Builder Interactions

**Goal:** Implement advanced "Power User" features for the Builder to support complex projects.

- [ ] **Semantic Zoom**: Pinch-to-zoom on the program list to collapse details (Axiom 11).
- [ ] **The Drafting Table**: A "Scratchpad" area for assembling inert code chunks (Axiom 13).
