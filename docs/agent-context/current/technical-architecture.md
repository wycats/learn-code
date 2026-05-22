# Technical Architecture: Phase 46 — Variables & Scoping / Engine Readiness

## Architecture Summary

Phase 46 begins by exposing an existing runtime capability: held item state can affect movement through custom tiles. The first slice does not add new variable semantics. It makes the existing key/passable-door mechanic visible and creator-accessible in Builder.

## Current Variable Architecture

- `GameModel` stores one `heldItem`.
- `pick-up` assigns a world item into `heldItem`.
- `VariableRefSchema` currently only supports `heldItem` and only loop count uses it.
- `resolveValue()` reads value-style held items for loops.
- Movement checks `tile.passableBy` against the currently held item type.
- Ghost Path duplicates pickup, held item, and passability behavior.

## PER 1 Architecture

1. Builder exposes Key as a standard item tool.
2. Builder exposes Door as a standard terrain preset.
3. Door is stored as a custom tile with:
   - `type: 'wall'`;
   - `passableBy: 'key'`;
   - locked-door visual metadata.
4. BuilderModel ensures the Door custom tile definition exists before writing `locked-door` into level layout.
5. Runtime and Ghost Path consume the resulting level data through existing passability rules.

## Why Not PXT Yet

PXT may eventually help with blocks-to-code and TypeScript bridging, but this slice is about discovering and sharpening Kibi’s own concrete creator semantics. The key-door loop gives Jonas immediate power while keeping the engine model physical and visible.

## Testing Strategy

- BuilderModel verifies Key painting.
- BuilderModel verifies Door painting and custom tile persistence.
- Interpreter verifies pick-up key then pass through door reaches goal.
- Ghost Path verifies the same solve and the blocked-without-key case.
- Browser review verifies the creator loop feels discoverable and physical.
