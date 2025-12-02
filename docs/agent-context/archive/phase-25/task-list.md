# Task List - Phase 25: Variables & Memory ("The Thought Bubble")

## 1. Schema & State

- [x] Update `CharacterState` in `src/lib/game/types.ts` to include `heldItem`.
- [x] Define `ItemType` and `HeldItem` interfaces.
- [x] Update `Block` types to support `VariableRef` parameters.

## 2. Core Engine & Logic

- [x] Implement `PickUp` block logic in the interpreter.
- [x] Implement `Collectible` entity interaction (picking up items from tiles).
- [x] Implement `VariableRef` resolution in the interpreter (reading from `heldItem`).

## 3. UI & Visualization

- [x] Create `ThoughtBubble` component for the Actor.
- [x] Integrate `ThoughtBubble` into the `Actor` component.
- [x] Ensure the bubble updates visually when `heldItem` changes.

## 4. Editor & Interaction

- [x] Add "Bubble Token" to the Builder Tray / Palette.
- [x] Allow dragging "Bubble Token" into compatible block slots (e.g., `Jump (Bubble) times`).
- [x] Update `Block` component to render `VariableRef` parameters correctly.

## 5. Content & Curriculum

- [x] Create "The Keeper of Keys" level pack (Level 1: Finders Keepers).
- [ ] Create Level 2: "The Gap".
- [ ] (Stretch) Create Level 3: "The Swap".

## 6. Verification

- [x] Verify `PickUp` block works correctly (state update).
- [x] Verify `VariableRef` works correctly (using held value).
- [x] Verify visual feedback (bubble appearance).
- [ ] Playtest the new levels.
