# Implementation Plan: Phase 48 PER 1 — The Drafting Table

## Status

Phase 48 starts with the Drafting Table rather than Semantic Zoom. This PER adds a Builder-only scratchpad for staging inert block chunks while testing a level.

## Goals

1. Add a visible Drafting Table lane above the Program in Builder Test mode.
2. Keep draft blocks session-only and level-scoped within the current Builder session.
3. Let creators safely copy blocks between Palette, Program, and Drafting Table.
4. Keep drafts inert: not executable, not counted toward limits, not shown in Code View, and not persisted into level JSON.
5. Reuse existing block visuals and loop/call configuration affordances where possible.

## Non-Goals

- Do not expose the Drafting Table in normal player routes.
- Do not persist drafts to level JSON, local storage, or a snippet library.
- Do not add Semantic Zoom in this PER.
- Do not include draft blocks in Code View or during-drag code previews.
- Do not change interpreter, schema, or level import/export semantics.

## Implementation Shape

### State

Add session-only draft block storage to `BuilderModel`, keyed by active level id. Drafts should survive edit/test mode switches and level switching within the same BuilderModel instance, but should not be written by `snapshotTray()`.

### Tray Surface

Pass the active level's drafting table from Builder routes into `Game`, and from `Game` into `Tray`. If no drafting table is passed, `Tray` renders exactly as it does today.

When drafting is enabled, `Tray` renders:

1. Palette.
2. Drafting Table lane.
3. Program lane.

The Drafting Table empty state is “Stage blocks here.”

### Transfer Semantics

- Palette → Drafting Table: create a new block.
- Palette → Program: keep existing behavior.
- Drafting Table → Program: copy with fresh IDs.
- Program → Drafting Table: copy with fresh IDs.
- Drafting Table → Drafting Table: move/reorder.
- Program → Program: keep existing move behavior.
- Drafting Table → Trash: delete from draft only.

### Helper Extraction

Add pure block-list helpers for recursive block operations: clone with fresh IDs, find, update, remove, and insert. Use these helpers in `Tray.svelte` so draft/program transfer logic remains explicit and testable.

## Validation Plan

- Unit tests for block-list helpers.
- BuilderModel tests for session-level draft storage and non-persistence.
- Tray component tests for rendering, player-route absence, draft count isolation, and draft loop/call configuration.
- Focused transfer-semantics tests where feasible through helpers and component-level behavior.
- `PROTO_NODE_VERSION=24 pnpm check`.
- `PROTO_NODE_VERSION=24 pnpm lint`.
- Manual browser review at `https://kibi.localhost/` in Builder Test mode.
