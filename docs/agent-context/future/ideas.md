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

## Jonas's Wishlist (Nov 2025)

- [ ] **Publishing**: A way to share levels (maybe a simple file-based repo or lightweight backend).
- [ ] **Feedback Button**: A way for players to send feedback to level creators (e.g., "Too hard", "Fun!", "Broken"). (Partially addressed in Phase 16 via mailto)
- [ ] **P2P Sharing**: A "serverless" way for Architects to share levels with Explorers directly.
  - **Magic QR Codes**: Encode small levels (compressed JSON) directly into a QR code. The Explorer scans it, and the level loads instantly. No internet required (if the app is cached).
  - **WebRTC Link**: For larger packs, use a simple signaling handshake (via a tiny public server or manual code entry) to establish a direct P2P data channel between devices.
  - **Local Network**: If on the same Wi-Fi, perhaps a direct IP connection (harder with HTTPS requirements).


## Mechanics & Blocks

- [ ] **Hazard Block**: A block that kills the player on contact (like a spike or fire).
- [ ] **Lives System**: A mechanic where the player has a limited number of lives. Walking into a hazard loses a life. This adds a "survival" challenge to levels.
- [ ] **Pack-wide tiles**: Allow defining custom tiles (like water, spikes) that can be used across multiple levels in a pack.

## Storage & Persistence

- [ ] **OPFS for Level Storage**: Use the Origin Private File System (OPFS) to store user-created levels locally in the browser. This provides a more robust and performant storage solution than localStorage, especially for larger levels or assets.
