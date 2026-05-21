# Deferred Work

## Phase 1 (Foundation)

- **PXT Integration**: We decided to build a custom "Mimic" interpreter for the MVP instead of integrating the full Microsoft PXT runtime immediately. This allows for faster iteration on the core mechanics. PXT integration is deferred to a later phase (likely Phase 4 or 5) when we need "real code" generation or advanced block features.
- **Formal State Machine (XState)**: We opted for a simpler Svelte 5 Runes + Snapshot History approach. If the game logic becomes significantly more complex (e.g., multiplayer, complex async flows), we may revisit XState.

## Phase 33 (Authentication)

- **Neon Auth**: We decided to use a custom auth implementation instead of Neon Auth (Decision 41).

## Phase 42 (Jonas' Feedback)

- **Run Button Logic**: Completed in Phase 43 PER 1. Run now supports Play, Stop, Try Again, and Replay behavior across planning/running/terminal states.
- **Visual Clarity**: Completed in Phase 43 PER 2. Player and builder modes now have persistent chips/ribbons/affordances.

## Phase 45 (Context-Aware Field Guide)

- **Story/Tutorial Control**: Deferred from the original “Master Teacher” outline. Unmasking blocks from dialogue and validating specific tutorial actions should be handled in a later tutorial-control phase.
- **Rich Field Guide Authoring**: Deferred beyond the first Jonas-centered “How this pack works” notes. Images, mini-playgrounds, component blocks, unlock semantics, and interactive tutorials remain future work.
- **Level-Specific Guide Attachments**: Deferred. Phase 45 supports pack-level guide notes and first-pass relevance; explicit level/concept guide metadata should come later.
- **Mobile Field Guide Polish**: Deferred. Phone table-of-contents behavior and collapsed guide editor preview should be revisited after the first authoring loop settles.
- **Guide Authoring Save Coalescing**: Deferred. Current behavior follows existing pack update patterns; future work should reduce per-keystroke history/sync noise.
