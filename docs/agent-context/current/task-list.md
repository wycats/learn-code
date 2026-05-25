# Task List: Phase 46 — Variables & Scoping / Engine Readiness

## Recon and Planning

- [x] Investigate current held-item, variable reference, and Thought Bubble runtime.
- [x] Identify Builder gaps for a Jonas key-door creator loop.
- [x] Decide to defer PXT, named variables, counters, and lexical scope from the first slice.

## PER 1 — Jonas Key/Door Creator Loop

- [x] Add Key to Builder item tools.
- [x] Add Door to Builder terrain tools.
- [x] Persist Door as a custom wall tile with `passableBy: 'key'`.
- [x] Keep Move/Pick Up enabling in existing Logic tab.
- [x] Add BuilderModel test coverage for painting Key.
- [x] Add BuilderModel test coverage for painting Door and persisting its custom tile definition.
- [x] Add interpreter key-door puzzle test.
- [x] Add Ghost Path key-door success and blocked-path tests.
- [x] Integrated browser review: create a key-door puzzle as Jonas.
- [x] Separate item pickup tokens from terrain icons so the key no longer obscures the tile marker.
- [x] Improve key color/weight in tray, grid, and Thought Bubble rendering.
- [x] Restore drag-to-trash deletion by making `any` drop targets behave as wildcards.
- [x] Add an Erase tool to the Terrain tray so removing Key/Door placements is discoverable.
- [x] Polish tablet-width Builder tray spacing, icon sizing, and Door preview alignment.
- [x] Keep the tablet Builder top bar contained without horizontal scrolling.
- [x] Establish a tablet Builder typography floor instead of shrinking labels per component.
- [x] Fix key erase crash caused by item outro transition reading a cleared item prop.

## PER 2 — Number Pickup as Visible Repeat Value

- [x] Start PER 2 from the prepared hypothesis that runtime Number pickup and held-item Repeat already exist.
- [x] Add Number to the Builder item tools with a visible hash/value preview.
- [x] Persist Builder-created Number items as numeric `value: 3` items instead of `value: true`.
- [x] Add a touch-friendly Builder value editor for selected Number items.
- [x] Clamp Builder Number values to positive single digits (`1..9`) for this slice.
- [x] Defer zero-valued Number items because current loop semantics make `0` repeat once.
- [x] Keep Key, Door, and Boat item behavior intact while adding Number.
- [x] Add BuilderModel coverage for Number painting, editing, clamping, history, and game sync.
- [x] Add BuilderTray coverage for visible Number tooling and updated tool counts.
- [x] Add interpreter parity coverage for Pick Up Number 3 → Repeat Move with held item.
- [x] Add Ghost Path parity coverage for Pick Up Number 3 → Repeat Move with held item.

## PER 3 — Runtime Parity + Visible Held-Value Polish

- [x] Preserve existing zero-repeat behavior; `0` still mirrors the current “runs once” parity and remains deferred.
- [x] Add/confirm interpreter parity coverage for locked Door with Key, locked Door without Key, Number 3 Repeat, and Boat over Water.
- [x] Add/confirm Ghost Path parity coverage for locked Door with Key, locked Door without Key, Number 3 Repeat, zero repeat, and Boat over Water.
- [x] Extract shared runtime helpers for held-value resolution, terrain/custom tile resolution, and passability checks.
- [x] Update Interpreter and Ghost Path to use the shared runtime helpers while keeping mutation, sounds, status, and path-entry creation local.
- [x] Preserve the runtime split between `heldItem` and `vehicle`.
- [x] Add a shared `HeldItemToken` visual component for Thought Bubble, pickup tokens, Held Item tray token, Repeat variable badge, and Builder logic token.
- [x] Add visual-only passable/unlocked feedback on locked doors while the matching held item is present.
- [x] Keep Builder route structure unchanged.

## Validation Checklist

- [x] Focused key-door tests pass.
- [x] PER 3 focused runtime and touched component tests pass.
- [x] `PROTO_NODE_VERSION=24 pnpm check`.
- [x] `PROTO_NODE_VERSION=24 pnpm lint`.
- [x] `git diff --check`.

## Follow-Up Topics

- [ ] Decide whether pickup tokens should use the bottom badge treatment for all item types long term.
- [ ] Broader regression pass for builder/player basics after each new creator mechanic.
- [ ] Continue tablet/desktop visual review for toolbar, story bar, and grid spacing.
- [ ] Extract Builder UI scale tokens into a shared design-system location if other Builder surfaces need them.
- [ ] Decide future zero semantics before exposing `0` as a Builder Number value.
- [ ] Decide whether Number values should expand beyond `1..9` in a later creator slice.
- [x] Bubble-as-parameter polish for loops in the bounded Key/Number slice.
- [ ] Thought Bubble pickup/open-door transition animation.
- [x] Runtime parity helper to reduce interpreter/Ghost Path duplication.
- [ ] Lexical scoping / box metaphor.
- [ ] PXT / MakeCode investigation.
