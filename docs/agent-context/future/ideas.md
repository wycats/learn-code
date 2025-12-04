# Ideas for Future Work

- [ ] **Variables & Scoping**: Introduce variables using a "box" metaphor.
  - **Lexical Scoping**: Avoid global variables. Variables should be scoped to the block/container they are defined in (the "box").
  - **Visual Representation**: The UI should visually reinforce scoping (e.g., variables defined inside a loop or function are only visible/accessible within that visual container).
  - **Philosophy**: Even young children can understand that if you put something in a box, it's in _that_ box. We should lean into this physical intuition rather than the "magic global state" often found in block-based languages.

## Technical Architecture

- **PXT / MakeCode Integration**: Use Microsoft's PXT (Programming Experience Toolkit) as the underlying engine. This would allow us to support the "Kinetic Architect" persona by providing a robust Blocks-to-TypeScript bridge out of the box. It handles the AST, block rendering, and compilation.
- **Abstractions for Debugging & State**: Create reusable abstractions for common patterns like:
  - **Safe Cloning**: A utility to safely `structuredClone` Svelte 5 state proxies (using `$state.snapshot`).
  - **Debug Logging**: A consistent way to log state changes and errors, possibly with a visual overlay for the "Architect" mode.
  - **Error Boundaries**: Better handling of runtime errors in user-generated content (e.g., malformed levels).
  - **Shared Component Logic**: Unify logic that has many implementations into shared components (perhaps with parameters) to reduce duplication and improve maintainability.

## Improvements Suggested by the Kids

- [ ] **Boat**: A boat that allows the character to cross water tiles. (Suggested by Zoey)
- [ ] **Custom Core Blocks**: Allow advanced users (like Jonas leveling up) to define their own core blocks. This would be a "ZPD" (Zone of Proximal Development) feature, bridging the gap between using blocks and understanding their implementation.
- [ ] **Text-to-Speech (TTS)**: Use the Web Speech API to read dialogue and instructions aloud. This supports pre-literate users and adds immersion.

## Jonas's Wishlist (Nov 2025)

- [ ] **Publishing**: A way to share levels (maybe a simple file-based repo or lightweight backend).
- [ ] **Feedback Button**: A way for players to send feedback to level creators (e.g., "Too hard", "Fun!", "Broken"). (Partially addressed in Phase 16 via mailto)
- [ ] **Local Network Sharing**: If on the same Wi-Fi, perhaps a direct IP connection (harder with HTTPS requirements).
- [ ] **Story/Tutorial Control**:
  - **Unmask Blocks**: Allow the Architect to specify a point in the dialogue where the block tray becomes interactive (unmasked). Currently, it's either all hidden or all shown.
  - **Interactive Tutorials**: (Future) Validate that the user performed a specific action (e.g., "Move the block") before advancing the story.

## Mechanics & Blocks

- [ ] **Hazard Block**: A block that kills the player on contact (like a spike or fire).
- [ ] **Lives System**: A mechanic where the player has a limited number of lives. Walking into a hazard loses a life. This adds a "survival" challenge to levels.
- [ ] **Pack-wide tiles**: Allow defining custom tiles (like water, spikes) that can be used across multiple levels in a pack.

## Storage & Persistence

- [ ] **Offline Sync & Conflict Resolution**: A robust system for syncing data between devices using QR codes, designed for the "Architect" persona.
  - **Git-like Structure**: Store changes as deltas with provenance and cached snapshots.
  - **Conflict Resolution**:
    - **Granularity**: Define merge granularity to avoid "frankenstein levels".
    - **UI**: Present conflicts clearly ("You made changes to Level X in both Device A and Device B. Which would you like to pick?").
    - **Grouping**: Allow resolving groups of changes from the same provenance branch together, with the option to "break it apart".
  - **Goal**: Enable offline "sync" without overwhelming users, while teaching basic version control concepts.

- [ ] **OPFS for Level Storage**: Use the Origin Private File System (OPFS) to store user-created levels locally in the browser. This provides a more robust and performant storage solution than localStorage, especially for larger levels or assets.

- [ ] **Community Contributions**: Allow Architects to submit Pull Requests to the main repository to add their levels to the built-in packs.
  - **Educational Value**: This provides an entry point for kids to learn about Git, GitHub, and the open-source contribution workflow (PRs, code review).
  - **Workflow**: Since levels are just JSON files, the barrier to entry is low. We can provide a guide or a simplified UI to help generate the PR.
  - **Considerations**: Not all parents will want their kids to have GitHub accounts. We should support submitting proposals via other means (e.g., feedback form) but encourage the "real" workflow for those who are ready.

## Tooling & Infrastructure

- [ ] **Zod Schema Diff / Compatibility Checker**: A library or tool that implements "Spec-ulation" rules (Rich Hickey) for Zod schemas.
  - **Goal**: Statically detect breaking changes in Zod schemas without needing a full fixture suite.
  - **Heuristic**: Inputs can be widened (contravariant), outputs can be narrowed (covariant).
  - **Implementation**: Likely involves converting Zod to JSON Schema and performing a semantic diff, or building a custom Zod walker.
  - **Value**: Useful for framework authors and library maintainers to prevent accidental breaking changes in their public API contracts.
