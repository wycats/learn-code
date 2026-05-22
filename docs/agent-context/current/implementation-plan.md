# Implementation Plan: Phase 46 — Variables & Scoping / Engine Readiness

## Status

Recon and first implementation slice are underway. Phase 46 should prioritize Jonas-facing creator power through concrete visible memory before attempting named variables, lexical scoping, or PXT integration.

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

## Out of Scope for PER 1

- Named variables.
- Multiple inventory slots.
- Key colors.
- Number items and value editing.
- Counters and arithmetic.
- Function parameters and returns.
- Lexical scoping boxes.
- PXT / MakeCode integration.

## Validation Plan

- Builder model tests for painting Key and Door.
- Builder tray component test for visible Key and Door tools.
- Interpreter key-door puzzle test.
- Ghost Path key-door prediction tests.
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
- When do we introduce number/value items as the next step after key possession?
