# Implementation Plan: Phase 46 — Variables & Scoping / Engine Readiness

## Status

Recon, PER 1, and PER 2 are complete. PER 3 is the bounded polish/parity slice after PR #31: it keeps visible carried values focused on Key and Number, extracts duplicated runtime rules, and improves the visual continuity of Thought Bubble / Held Item tokens without expanding the feature set.

## Phase Goal

Turn the existing Thought Bubble / held-item runtime into a creator-accessible mechanic, starting with a Key → Door puzzle loop that Jonas can build, playtest, and explain.

## Design Direction

Variables should enter the product as visible carried state, not hidden symbolic storage. The first lesson is possession:

- “I have the key.”
- “The door opens because I have the key.”
- “The value I carry can change what happens later.”

This keeps the concept physical and developmentally appropriate before introducing counters, operations, named variables, or scoped boxes.

## Persona Goals

### Zoey

- Understands the mechanic through visible possession and world rules.
- Sees the key in the Thought Bubble instead of tracking invisible state.
- Does not need abstract variable terminology.

### Jonas

- Gets a satisfying creator mechanic: locked-door puzzles.
- Can place a key, place a door, and test whether his puzzle works.
- Feels like he is creating game rules, not filling out a schema.

## Recon Findings

See `variables-recon.md` for details. The short version:

- Runtime already supports `heldItem`, `pick-up`, `passableBy`, and Thought Bubble display.
- Built-in `key` exists as a collectible item.
- Custom wall tiles can already be passable by key.
- Builder does not expose Key in standard item tools.
- Builder does not provide a simple Door preset that packages wall + key passability.
- Interpreter and Ghost Path duplicate variable/item passability behavior and need parity tests.

## PER 1 — Jonas Key/Door Creator Loop

- Add a visible Key item tool in Builder.
- Add a visible Door terrain preset in Builder.
- Persist Door as a custom wall tile with `passableBy: 'key'`.
- Keep Move/Pick Up enabling in the existing Logic tab.
- Verify runtime behavior with interpreter tests.
- Verify Ghost Path parity with matching tests.
- Review the creator loop in the integrated browser.
- Keep item rendering visually distinct from terrain rendering, so a key reads as a pickup token and does not obscure the tile identity marker.
- Preserve baseline editing affordances while adding creator tools: drag-to-trash deletion must keep working, and removing placed Key/Door objects must be visible from the same tray where they are added.
- Keep tablet layout polished enough for Jonas: tray tabs should align evenly, terrain/item previews should share a visual grid, and the Door should read as a door rather than a tiny badge on an empty tile.
- The tablet top bar should never require horizontal scrolling; secondary status chips can collapse before primary actions are pushed offscreen.
- Builder tablet typography should have a floor: shrink layout density, icon spacing, or columns before shrinking primary labels below comfortable reading size.

## PER 2 — Number Pickup as Visible Repeat Value

- Expose Number as a standard Builder item tool next to Key and Boat.
- Use a clear hash/value tray preview so the tool reads as “a number I can pick up,” not another terrain tile.
- Persist Builder-created Number items with numeric positive integer values, defaulting to `3`.
- Add a small touch-friendly editor for placed Number items so Jonas can adjust the visible value without editing JSON.
- Keep edits connected to Builder history, modified state, and `GameModel` sync.
- Preserve Key, Door, and Boat behavior from PER 1.
- Verify that Interpreter and Ghost Path both treat Pick Up Number 3 followed by Repeat Move using `heldItem` as three moves.

### PER 2 Deferral

Do not expose `0` as a Builder value in this slice. Current Interpreter and Ghost Path loop semantics intentionally mirror each other by executing a `0` repeat body once, which would be confusing for Jonas. Builder Number values are clamped to `1..9` until zero semantics are redesigned.

## PER 3 — Runtime Parity + Visible Held-Value Polish

- Extract the duplicated Interpreter/Ghost Path runtime rules into a small pure helper module:
  - held-value resolution for `heldItem` variable references;
  - terrain/custom tile resolution;
  - passability checks from `{ heldItem, vehicle }`.
- Keep execution-local effects where they belong: sounds, mutation, status changes, failure recording, and Ghost Path entries stay in the Interpreter/Ghost Path modules.
- Preserve all current semantics, including the intentionally deferred zero-repeat behavior where `0` currently runs the loop body once.
- Preserve the `vehicle` vs. `heldItem` split. Boats still board into `vehicle`; Key/Number remain visible held items.
- Add/confirm parity coverage for Key → Door success, locked Door blocked without Key, Number 3 → Repeat, Boat → Water, and zero-repeat behavior.
- Introduce a shared held-item token visual for the Thought Bubble, cell pickup badge, player tray Held Item token, loop variable badge, and Builder logic Held Item token.
- Add visual-only passable/unlocked feedback for locked doors when the matching held item is present. Do not consume keys or add door state.

### PER 3 Deferrals

- Do not redesign zero-repeat semantics.
- Do not add key consumption, door-unlocked state, multiple inventory slots, or named variables.
- Do not rewrite the Builder route; only touch the existing Builder logic token where the shared token is a bounded fit.
- Keep broader E2E and visual regression coverage as follow-up unless a tiny focused component test naturally covers the touched UI.

## Out of Scope for PER 1

- Named variables.
- Multiple inventory slots.
- Key colors.
- Number items and value editing.
- Counters and arithmetic.
- Function parameters and returns.
- Lexical scoping boxes.
- PXT / MakeCode integration.

## Out of Scope for PER 2

- Zero-valued Number tools.
- Number ranges beyond `1..9`.
- Arithmetic, counters, or merge operations.
- Named variables, multiple inventory slots, or scoped storage.
- Runtime loop semantic changes for `0`.

## Out of Scope for PER 3

- Any runtime semantic change to repeat counts, key usage, doors, or vehicles.
- Key consumption or persistent door state.
- Builder route rewrite or pack/manual route parity refactor.
- Broad E2E expansion.

## Validation Plan

- Builder model tests for painting Key and Door.
- Builder model tests for painting and editing Number values.
- Builder tray component test for visible Key and Door tools.
- Builder tray component test for visible Number tooling and updated tool counts.
- Interpreter key-door puzzle test.
- Interpreter Pick Up Number 3 → Repeat Move parity test.
- Ghost Path key-door prediction tests.
- Ghost Path Pick Up Number 3 → Repeat Move parity test.
- PER 3 focused Interpreter/Ghost Path parity tests for Key, Door, Number, Boat, and zero-repeat behavior.
- Touched component tests for shared held-item token rendering and door passable affordance.
- Integrated browser review of Jonas creating a key-door puzzle.
- `PROTO_NODE_VERSION=24 pnpm check`.
- `PROTO_NODE_VERSION=24 pnpm lint`.
- `git diff --check`.

## Open Product Questions

- Should pickup items always dock as bottom badges, or should some item types get custom placement rules?
- What small regression checklist should run after each builder feature so basic edit/delete/play loops do not drift?
- Which remaining tablet surfaces need the next polish pass: top toolbar density, story bar height, grid scale, or test-mode tray?
- Should the Builder UI typography tokens become global design tokens once more Builder screens adopt them?
- Should Builder offer a one-click “locked door puzzle” starter later?
- Should Field Guide relevance learn a key-door concept page in this phase or a follow-up?
- What should zero-repeat mean before Builder exposes `0` as a Number value? PER 3 intentionally preserved current behavior.
- When should Number values expand beyond the single-digit `1..9` creator range?
