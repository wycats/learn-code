# Implementation Plan - Phase 37: The Boat

## Goal

Implement the "Boat" item and "Water" tile mechanics to allow the character to traverse water tiles.

## Proposed Changes

### 1. Schema & Types

- Ensure `ItemType` includes `'boat'`.
- Ensure `ItemBehavior` includes `'vehicle'`.
- Ensure `BlockType` includes `'board'`.

### 2. Game Logic (`src/lib/game/mimic.ts`)

- Implement `board` block execution:
  - Check if character is on a tile with a boat item.
  - Set `game.vehicle` to the boat item.
- Update `isValidMove`:
  - Allow movement onto `water` tiles if `game.vehicle` is a boat.
  - Allow movement onto `water` tiles if `game.heldItem` is a boat (legacy/magic support).

### 3. Visuals (`src/lib/components/game/Character.svelte`)

- Render the boat icon around the character when `game.vehicle` is set.

### 4. Builder (`src/lib/components/builder/BuilderTray.svelte`)

- Add "Boat" to the item tools.
- Add "Board" to the block palette.

### 5. Testing

- Add unit tests to `src/lib/game/interpreter.test.ts` covering:
  - Boarding a boat.
  - Moving on water with a boat.
  - Moving from water to land (keeping the boat).
  - Failing to move on water without a boat.
