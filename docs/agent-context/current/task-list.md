# Task List: Phase 48 PER 1 — The Drafting Table

## Planning

- [x] Confirm Phase 47 is merged and current primary context files are empty.
- [x] Choose Drafting Table over Semantic Zoom for the first Phase 48 slice.
- [x] Lock product defaults:
  - [x] Builder/Test tray only.
  - [x] Session-only storage.
  - [x] Visible lane layout.
  - [x] Copy-by-default across Program/Draft boundaries.
- [x] Inspect existing BuilderModel, Game, Tray, Block, and editor interaction seams.

## Implementation

- [x] Add pure block-list helper module and tests.
- [x] Add session-only drafting-table state to `BuilderModel`.
- [x] Pass active drafting-table state from Builder routes to `Game` and `Tray`.
- [x] Render a visible Drafting Table lane in `Tray.svelte` when drafting is enabled.
- [x] Make block drag data and drop-target data surface-aware.
- [x] Implement Palette/Program/Draft/Trash transfer semantics.
- [x] Make selection and loop/call configuration work for draft blocks.
- [x] Keep draft blocks out of runtime, block counts, Code View, Ghost Path, and persistence.
- [x] Add focused component/model coverage.
- [x] Update walkthrough after implementation.

## Validation Checklist

- [x] Focused helper tests pass.
- [x] Focused BuilderModel tests pass.
- [x] Focused Tray component tests pass.
- [x] `PROTO_NODE_VERSION=24 pnpm check`.
- [x] `PROTO_NODE_VERSION=24 pnpm lint`.
- [x] `git diff --check`.
- [x] Manual browser review at `https://kibi.localhost/` in Builder Test mode.

## Deferred

- [ ] Save drafts to level JSON.
- [ ] Global reusable snippet library.
- [ ] Player-facing scratchpad.
- [ ] Semantic Zoom.
- [ ] Code View draft previews.
