# Walkthrough: Phase 48 PER 1 — The Drafting Table

Phase 48 PER 1 adds a Builder/Test-only Drafting Table: a session scratchpad for staging inert block chunks while testing a level.

## Builder State

`BuilderModel` now owns `draftingTables`, keyed by active level id. The state is session-only and is initialized during model sync, level creation, level switching, and pack loading. The public `activeDraftingTable` getter is pure so routes can read it during render without mutating Svelte state.

Drafts survive edit/test mode switches because they live beside `currentProgram`, but `snapshotTray()` still writes only the runnable program/functions into the level JSON.

## Routing

Builder test routes pass `builder.activeDraftingTable` into `Game`, and `Game` forwards it into `Tray`.

Player routes do not pass the prop. In those routes the tray renders exactly one Program lane and no Drafting Table.

## Tray UI

When drafting is enabled, `Tray.svelte` renders a compact **Drafting Table** lane above Program.

- Empty state: `Stage blocks here.`
- The lane reuses existing block visuals.
- Loop count and call function controls work for selected draft blocks.
- The Move toolbar action remains Program-only in PER 1.
- Delete and Copy toolbar actions work with draft selections.

The draft lane has its own root and sibling drop targets, and loop child slots inherit the owning surface.

## Transfer Semantics

Drag data now identifies the source surface: `palette`, `program`, or `draft`. Drop-target data identifies the target surface: `program` or `draft`.

Transfers are safe by default:

- Palette → Drafting Table creates a new block.
- Drafting Table → Program copies the block with fresh IDs and leaves the draft intact.
- Program → Drafting Table copies the block with fresh IDs and leaves the program intact.
- Drafting Table → Drafting Table moves/reorders.
- Program → Program preserves the existing move behavior.
- Drafting Table → Trash removes only the draft block.

Recursive block operations now go through `src/lib/game/block-list.ts`, which covers cloning with fresh IDs, finding/updating nested blocks, inserting before/after/inside, and removing by ID.

## Inertness

Draft blocks are not part of `GameModel` runtime state. They are not counted in `game.blockCount`, do not feed the interpreter, do not affect Ghost Path, and do not appear in Code View because Code View receives only the game program/functions.

Draft changes do not call story `block-placed` triggers because draft transfers avoid `GameModel.addBlock()`.

## Validation

Focused tests cover:

- recursive block-list helper behavior;
- BuilderModel draft storage, level scoping, mode switching, and non-persistence;
- Drafting Table render/absence behavior;
- draft block count isolation;
- draft loop/call configuration controls;
- helper-level transfer semantics for copy/delete behavior.

Manual browser review confirmed the normal player route does not render the Drafting Table, and Builder Test mode renders the lane with the empty state.
