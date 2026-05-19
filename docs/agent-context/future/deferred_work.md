# Deferred Work

## Phase 1 (Foundation)

- **PXT Integration**: We decided to build a custom "Mimic" interpreter for the MVP instead of integrating the full Microsoft PXT runtime immediately. This allows for faster iteration on the core mechanics. PXT integration is deferred to a later phase (likely Phase 4 or 5) when we need "real code" generation or advanced block features.
- **Formal State Machine (XState)**: We opted for a simpler Svelte 5 Runes + Snapshot History approach. If the game logic becomes significantly more complex (e.g., multiplayer, complex async flows), we may revisit XState.

## Phase 33 (Authentication)

- **Neon Auth**: We decided to use a custom auth implementation instead of Neon Auth (Decision 41).

## Phase 42 (Jonas' Feedback)

- **Run Button Logic**: Completed in Phase 43 PER 1. Run now supports Play, Stop, Try Again, and Replay behavior across planning/running/terminal states.
- **Visual Clarity**: Completed in Phase 43 PER 2. Player and builder modes now have persistent chips/ribbons/affordances.
