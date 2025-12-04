# Walkthrough - Phase 37: The Boat

## Overview

In this phase, we implemented the "Boat" mechanic, allowing the character to traverse water tiles. This involved updates to the game schema, execution logic, and visual representation.

## Changes

### Game Logic

- **Boarding**: Added the `board` block logic in `src/lib/game/mimic.ts`. When executed, if the character is on a tile with a boat, they "board" it, setting `game.vehicle`.
- **Movement**: Updated `isValidMove` in `src/lib/game/mimic.ts` to allow movement onto `water` tiles if the character has a vehicle of type `boat`.
- **Land Boat**: The logic naturally allows the character to move from water back to land while keeping the boat (as `game.vehicle` is not cleared), effectively carrying it.

### Visuals

- **Character**: Updated `src/lib/components/game/Character.svelte` to render a boat icon around the character when `game.vehicle` is a boat.

### Builder

- **Tools**: Verified that the "Boat" item and "Board" block are available in the `BuilderTray`.

### Testing

- **Unit Tests**: Added comprehensive tests in `src/lib/game/interpreter.test.ts` to verify:
  - Boarding mechanics.
  - Water traversal.
  - "Land Boat" behavior.
  - Failure states (moving to water without boat).

## Verification

- Ran `pnpm test:unit` and confirmed all game logic tests passed.
