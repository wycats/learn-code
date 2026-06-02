# Technical Architecture: Phase 48 PER 1 — The Drafting Table

## Architecture Summary

The Drafting Table is a Builder-only, session-only scratchpad for staging inert block chunks. It lives beside the existing Program tray while Builder Test mode is active, but it does not become part of runtime state, level schema, Code View, or saved starter code.

## State Boundaries

- `BuilderModel` owns drafting-table state because drafts are a creator workflow, not a `GameModel` runtime concept.
- Drafts are keyed by active level id and last only for the current `BuilderModel` session.
- `GameModel.program` and `GameModel.functions` remain the only executable block sources.
- `snapshotTray()` continues to persist only the current program and functions.

## UI/Data Flow

1. Builder routes pass `builder.activeDraftingTable` to `Game` only while rendering Builder Test mode.
2. `Game.svelte` forwards the optional drafting table to `Tray.svelte`.
3. `Tray.svelte` renders a Drafting Table lane only when the optional drafting table is present.
4. Normal player routes do not pass drafting data, so player trays are unchanged.

## Transfer Rules

- Palette drops create new blocks.
- Program ↔ Draft boundaries copy blocks with fresh IDs.
- Draft → Draft moves/reorders.
- Program → Program keeps existing move/reorder behavior.
- Draft → Trash removes only draft blocks.

## Helper Rules

Pure block-list helpers should own recursive clone/find/update/remove/insert logic. This keeps Tray drag/drop code focused on surface semantics instead of nested tree manipulation.

## Testing Strategy

- Unit test helper behavior for nested blocks and fresh IDs.
- Test BuilderModel draft state across level switches and edit/test mode switches.
- Test that snapshotting the tray does not persist drafts.
- Component test that Drafting Table appears only when enabled and does not affect block counts.
- Component test draft selection/configuration for loops and calls.
