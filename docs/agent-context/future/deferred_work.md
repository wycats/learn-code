# Deferred Work

## Phase 1 (Foundation)

- **PXT Integration**: We decided to build a custom "Mimic" interpreter for the MVP instead of integrating the full Microsoft PXT runtime immediately. This allows for faster iteration on the core mechanics. PXT integration is deferred to a later phase (likely Phase 4 or 5) when we need "real code" generation or advanced block features.
- **Formal State Machine (XState)**: We opted for a simpler Svelte 5 Runes + Snapshot History approach. If the game logic becomes significantly more complex (e.g., multiplayer, complex async flows), we may revisit XState.

## Phase 19 (The Architect's Polish)

(All items moved to Phase 30)
