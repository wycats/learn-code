# Implementation Plan: The Thought Bubble (Variables)

## Phase Goal

Implement the "Thought Bubble" variable system, allowing the character to pick up items, hold them (visible state), and use them in block parameters.

## 1. Schema Changes

### Character State (`src/lib/game/types.ts`)

We need to track what the character is holding.

```typescript
export type ItemType = 'key' | 'number' | 'color';

export interface HeldItem {
	type: ItemType;
	value: any; // e.g., true (for key), 3 (for number), '#FF0000' (for color)
	icon: string; // Asset reference
}

export interface CharacterState {
	// ... existing state ...
	heldItem: HeldItem | null;
}
```

### Block Definitions (`src/lib/blocks/types.ts`)

We need a new block type and a new parameter type.

1.  **New Block: `PickUp`**
    - **Type:** `Action`
    - **Logic:** Checks current tile for `Collectible`. If found, moves it to `CharacterState.heldItem`.
    - **Visual:** Shows character grabbing downwards.

2.  **New Parameter Type: `VariableRef`**
    - **Usage:** Allows a block parameter (like `steps` in `Jump`) to accept a dynamic reference instead of a static literal.
    - **UI:** Accepts the "Bubble Token".

## 2. "Stop & Go" Interaction Design

### Planning Mode (Stop)

- **The Bubble Token:** A draggable icon available in the toolbar (or context menu).
- **Appearance:** A translucent, empty bubble.
- **Tooltip:** "What I am holding".
- **Validation:** Can be dropped into any slot that accepts the _type_ of item expected (initially, we might be loose with typing, or strictly enforce Number vs. Boolean).

### Execution Mode (Go)

- **Visualization:**
  - **On Character:** A sprite/overlay appears above the character's head showing the `heldItem.icon`.
  - **In Code:** As the playhead moves, if a block uses the Bubble Token, the token in the code bar momentarily flashes or shows the value being used (e.g., the empty bubble icon briefly turns into a "3").

## 3. Level Pack 1: "The Keeper of Keys" (Possession)

**Theme:** The character must collect keys to open gates. No math yet.

- **Level 1: "Finders Keepers"**
  - **Setup:** Character | (Empty) | Key | (Empty) | Gate | Goal.
  - **Solution:** `Move` -> `Move` -> `Pick Up` -> `Move` -> `Move` -> `Unlock` (implicit? or explicit block?).
  - _Refinement:_ Let's make `Unlock` automatic if you bump into a gate while holding a key.
  - **New Block:** `Pick Up`.

- **Level 2: "The Gap"**
  - **Setup:** Key is on a platform above.
  - **Solution:** `Jump` -> `Pick Up` -> `Move` -> `Gate`.
  - **Lesson:** Combining movement with state change.

- **Level 3: "The Swap" (Stretch Goal)**
  - **Setup:** Holding a Blue Key. Need a Red Key.
  - **Mechanic:** Picking up the Red Key drops the Blue Key.
  - **Lesson:** "I can only hold one thing."

## 4. Technical Tasks

1.  [ ] **Core Engine**: Update `CharacterState` to support `heldItem`.
2.  [ ] **World Entities**: Create a `Collectible` entity type (Key, Coin).
3.  [ ] **Block Logic**: Implement `PickUp` block execution logic.
4.  [ ] **UI/Renderer**:
    - Render the "Bubble" above the character sprite.
    - Update the Bubble visual when `heldItem` changes.
5.  [ ] **Editor UI**:
    - Create the draggable "Bubble Token".
    - Allow dropping Bubble Token into `number` or `boolean` slots.

---

We will need to think about how these ideas fit into our actual implementation.
