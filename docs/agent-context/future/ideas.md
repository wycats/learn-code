# Ideas for Future Work

- [x] **Variables & Scoping**: Introduce variables using a "box" metaphor. (Candidate baseline; lexical scoping refinement remains future)
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

- [x] **Boat**: A boat that allows the character to cross water tiles. (Suggested by Zoey)
- [ ] **Custom Core Blocks**: Allow advanced users (like Jonas leveling up) to define their own core blocks. This would be a "ZPD" (Zone of Proximal Development) feature, bridging the gap between using blocks and understanding their implementation.
- [ ] **Text-to-Speech (TTS)**: Use the Web Speech API to read dialogue and instructions aloud. This supports pre-literate users and adds immersion. (Future; phase number TBD)

## Jonas's Wishlist (Nov 2025)

- [x] **Publishing**: A way to share levels through GitHub-backed pack publishing. (Candidate baseline; product/security review remains required)
- [ ] **Feedback Button to Level Creators**: A way for players to send creator-facing feedback (e.g., "Too hard", "Fun!", "Broken"). Phase 44 PER 1 added maintainer-facing issue reports with state dumps; creator-facing lightweight reactions remain future work.
- [ ] **Local Network Sharing**: If on the same Wi-Fi, perhaps a direct IP connection (harder with HTTPS requirements).
- [ ] **Story/Tutorial Control**: (Future; phase number TBD)
  - **Unmask Blocks**: Allow the Architect to specify a point in the dialogue where the block tray becomes interactive (unmasked). Currently, it's either all hidden or all shown.
  - **Interactive Tutorials**: (Future) Validate that the user performed a specific action (e.g., "Move the block") before advancing the story.

## Mechanics & Blocks

- [x] **Hazard Block**: A block that kills or damages the player on contact. (Candidate baseline)
- [x] **Lives System**: A mechanic where the player has a limited number of lives. Walking into a hazard loses a life. This adds a "survival" challenge to levels. (Candidate baseline)
- [x] **Pack-wide tiles**: Allow defining custom tiles (like water, spikes) that can be used across multiple levels in a pack. (Candidate baseline)

## Storage & Persistence

- [x] **Offline Sync & Conflict Resolution**: A robust system for syncing data between devices using QR codes, designed for the "Architect" persona. (Candidate baseline; conflict UX refinement remains future)
  - **Git-like Structure**: Store changes as deltas with provenance and cached snapshots.
  - **Conflict Resolution**:
    - **Granularity**: Define merge granularity to avoid "frankenstein levels".
    - **UI**: Present conflicts clearly ("You made changes to Level X in both Device A and Device B. Which would you like to pick?").
    - **Grouping**: Allow resolving groups of changes from the same provenance branch together, with the option to "break it apart".
  - **Goal**: Enable offline "sync" without overwhelming users, while teaching basic version control concepts.

- [ ] **OPFS for Level Storage**: Use the Origin Private File System (OPFS) to store user-created levels locally in the browser. This provides a more robust and performant storage solution than localStorage, especially for larger levels or assets.

- [x] **Community Contributions**: Allow Architects to publish/share packs through GitHub workflows. (Candidate baseline; direct built-in-pack PR flow remains future)
  - **Educational Value**: This provides an entry point for kids to learn about Git, GitHub, and the open-source contribution workflow (PRs, code review).
  - **Workflow**: Since levels are just JSON files, the barrier to entry is low. We can provide a guide or a simplified UI to help generate the PR.
  - **Considerations**: Not all parents will want their kids to have GitHub accounts. We should support submitting proposals via other means (e.g., feedback form) but encourage the "real" workflow for those who are ready.

- [ ] **Self-Hosted Auth Sidecar**: A simplified, open-source server that handles the "Backend for Frontend" (BFF) OAuth piece.
  - **Problem**: GitHub OAuth requires a Client Secret, which cannot be stored in a client-side app (even a PWA). This creates a dependency on the hosted Kibi server for the "Connect to GitHub" feature.
  - **Solution**: A small Docker container that runs just the auth endpoints (`/login/github`, `/callback`, `/refresh`) and exposes them to the local Kibi instance.
  - **Goal**: Enable full self-hosting of the "Engineer Mode" features without relying on our infrastructure.

## Tooling & Infrastructure

- [ ] **Zod Schema Diff / Compatibility Checker**: A library or tool that implements "Spec-ulation" rules (Rich Hickey) for Zod schemas. (Future; phase number TBD)
  - **Goal**: Statically detect breaking changes in Zod schemas without needing a full fixture suite.
  - **Heuristic**: Inputs can be widened (contravariant), outputs can be narrowed (covariant).
  - **Implementation**: Likely involves converting Zod to JSON Schema and performing a semantic diff, or building a custom Zod walker.
  - **Value**: Useful for framework authors and library maintainers to prevent accidental breaking changes in their public API contracts.

## Error Reporting & Observability

- [ ] **Error Reporting Integration**: Implement a robust error reporting solution to capture runtime exceptions and performance issues. (Future; phase number TBD)
  - **Decision**: **Highlight.io**.
    - **Why**: It combines error monitoring with **Session Replay** and logging in a single, open-source friendly platform.
    - **Value**: For a highly interactive app like Kibi, seeing _what_ the user did (Session Replay) is often more valuable than just the stack trace.
    - **Privacy**: Offers good privacy controls (masking) which is crucial for a kids' app.
  - **Implementation**:
    - Add the SDK to `hooks.client.ts` and `hooks.server.ts`.
    - Configure source map uploading in the build pipeline.
    - Ensure PII (Personally Identifiable Information) is scrubbed, especially given the target audience.

## Field Guide Improvements

- [ ] **The Origin of Kibi**: Add a "Secret Chapter" or easter egg in the Field Guide that explains the "Kibibyte" origin story. This should be a jumping-off point for explaining binary numbers and powers of two to curious kids.
- [x] **Context-Aware Manual**: The Field Guide should be customized for the level the user is on, showing relevant chapters or highlighting concepts used in the current level. (Phase 45 first slice complete; richer metadata remains future)
- [x] **Architect Control**: Give the Architect control over the Field Guide content for their levels. (Phase 45 pack-level “How this pack works” notes complete; level-specific attachments remain future)
- [x] **"Just-in-Time" vs. "Library"**: Avoid the "unread dot" fatigue. Instead of a manual that accumulates unread content, integrate the information directly into the user flow (e.g., context-sensitive help) or structure it as a reference library that doesn't demand to be "read" linearly. (Phase 45 uses passive relevant opening, no unread dots)
- [x] **Custom Field Guide Entries**: Allow Architects to write their own Field Guide entries for their custom packs. (Phase 45 minimal pack guide notes complete; rich authoring remains future)
  - **Rationale**: Just as we provide documentation for built-in blocks, users creating complex levels or mechanics should be able to explain them to players.
  - **Implementation**: Add a `guide` section to the Pack JSON schema.
  - **Pedagogy**: Teaches the importance of documentation alongside code.

### Deferred Field Guide Polish

- [ ] **Related-guide affordance**: Give the Field Guide button a gentle “relevant help available” affordance without unread-dot pressure.
- [ ] **Jonas voice styling**: Add distinct visual treatment for Jonas-authored voice blocks.
- [ ] **Mobile Field Guide TOC**: Improve table-of-contents behavior on phone-sized screens.
- [ ] **Guide authoring save coalescing**: Debounce or coalesce guide note saves so undo/history is not per keystroke.
- [ ] **Guide metadata**: Let creators attach guide entries to specific levels/concepts without exposing raw ids/tags.
- [ ] **Rich guide authoring**: Add images, mini-playgrounds, component blocks, unlock semantics, and interactive tutorial validation later.
