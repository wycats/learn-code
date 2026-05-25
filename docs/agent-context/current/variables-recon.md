# Variables & Scoping Recon: Phase 46

## Question

What should Phase 46 do next if the goal is Jonas-style creator power through variables/scoping, without jumping prematurely into PXT or abstract named variables?

## Summary

The current system already has a concrete “variable” foundation: the character can hold one visible item in a thought bubble, and runtime rules can read that held item. The highest-value first slice is not lexical scoping or PXT. It is a creator loop that exposes the existing Key → Door mechanic in Builder so Jonas can make a locked-door puzzle.

## Key Observations

- Current variable support is a single global `heldItem`, not named variables or lexical scopes.
- `VariableRefSchema` only supports `variableId: 'heldItem'`, and only loop counts can currently use that reference.
- Runtime support is real but narrow: `pick-up` stores an item in `game.heldItem`; loop counts can read value-style held items; walls/water can use held item or vehicle passability.
- Key/door semantics already exist in the engine: custom wall tiles can set `passableBy: 'key'`, and built-in `key` is a collectible item.
- Ghost Path duplicates the interpreter’s variable/item/terrain behavior, so every new variable behavior needs parity coverage.
- Builder exposes `Pick Up` and can define passable custom tiles, but Key is not visible in the standard item tools and Door is not a first-class creator preset.
- Before PER 2, Builder item painting used `value: true` for all items; Key/Boat still use boolean values, while Number now needs numeric value persistence.
- The design docs position variables as visible memory in a Thought Bubble, starting with concrete possession before numeric values or operations.

## Current Runtime Flow

1. Level data can place items by coordinate.
2. `pick-up` checks the current coordinate for an item.
3. Non-vehicle items are stored in `game.heldItem` and shown in the Thought Bubble.
4. Custom wall tiles can declare `passableBy: 'key'`.
5. Movement into a wall checks whether the held item type matches `passableBy`.
6. Ghost Path simulates similar `heldItem`, pickup, and passability behavior separately.

## Current Builder Flow

- Terrain tools expose built-in terrain and custom tiles.
- Item tools currently expose Boat, plus custom pack/level items.
- Logic tools expose movement, `pick-up`, board, loop, and call.
- Tile editor can configure passability, including key passability.
- There is no simple “Door” preset that packages wall + passableBy key + clear visual language.

## Product Interpretation

This is not “variables” as an abstract CS concept yet. It is **visible carried state**.

Developmentally, the right sequence is:

1. **Possession:** “I have the key.”
2. **Value:** “I have 3.”
3. **Operation:** “I add 1.”
4. **Scope:** “This box remembers its own thing.”

The key-door loop is the right first slice because it makes the memory concept physical, visual, and creator-owned.

## Recommended Phase 46 First Slice

### Jonas Key/Door Creator Loop

Acceptance shape:

1. Jonas can place a Key item in Builder.
2. Jonas can place a Door tile preset.
3. The Door is implemented as a wall-like custom tile that opens when the character holds Key.
4. Jonas can enable movement and `Pick Up` blocks.
5. Playtest proves: move to key → pick up → Thought Bubble shows key → door becomes passable → reach goal.
6. Interpreter and Ghost Path both pass the same key-door scenario.

## Keep Out of First Slice

- Named variables.
- Multiple inventory slots.
- Key colors.
- Counters and arithmetic.
- Function parameters/returns.
- Lexical scoping boxes.
- PXT / MakeCode integration.

## Risks and Decisions

- Door preset must persist a custom tile definition; otherwise an unknown `locked-door` tile id becomes passable floor.
- Door visuals need to clearly read as locked/key-required, not just another wall.
- Interpreter and Ghost Path must stay in sync.
- PER 2 should keep Number values positive until zero-repeat semantics are redesigned.
- PXT should remain a later engine/syntax bridge investigation until Kibi’s own creator semantics are clearer.

## Follow-Up Slices

### Low Effort

- Key item tool and Door preset.
- Key-door interpreter and ghost path tests.
- Field Guide page or related note for “Holding a key.”

### Medium Effort

- Zero semantics and larger Number ranges after the initial `1..9` creator slice.
- Bubble-as-parameter polish for loops.
- Better Thought Bubble transition animations.
- Runtime parity helpers to reduce interpreter/ghost duplication.

### High Effort

- Counters and merge operations.
- Lexical scoping / box metaphor.
- Function parameters and returns.
- PXT / MakeCode integration.
