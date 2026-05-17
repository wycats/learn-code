# Variables & Memory: "The Thought Bubble"

## Core Concept

Variables are not abstract storage slots; they are **visible items** carried by the character in a "Thought Bubble." This eliminates hidden state and grounds the concept of "memory" in the physical metaphor of "holding onto something."

## The Metaphor

- **The Bubble:** A visual indicator above the character's head.
- **Contents:** Can hold ONE item at a time (initially).
- **Visibility:** The item is always visible. If the character holds a "3", the bubble shows a "3". If they hold a "Key", it shows a "Key".

## Mechanics

### 1. Pick Up (Assignment)

- **Action:** When the character encounters a "collectible" item in the world, they can use a `Pick Up` block.
- **Effect:** The item moves from the world into the Thought Bubble.
- **Constraint:** If the bubble is full, the old item is dropped (or overwritten, depending on level difficulty).

### 2. Use (Read)

- **Action:** The player can drag the _icon_ of the Thought Bubble from the character's display into a parameter slot of a block.
- **Example:** `Jump (Bubble) times`.
- **Visual:** The block slot shows a "ghost" of the bubble, indicating "whatever is in the bubble at this moment."

### 3. Merge (Operation)

- **Action:** If holding an item, picking up a _compatible_ item triggers a merge.
- **Example:** Holding `3` + Picking up `1` = Bubble becomes `4`.
- **Example:** Holding `Red Paint` + Picking up `Blue Paint` = Bubble becomes `Purple Paint`.

## Curriculum Strategy: "The Single Journey"

We will use a progressive curriculum rather than separate personas.

### Phase 1: Concrete Possession (The Key)

- **Object:** A physical Key.
- **Logic:** Boolean (Have Key / Don't Have Key).
- **Goal:** Open a Door.
- **Lesson:** "I need to hold this to make that happen."

### Phase 2: Quantity (The Counter)

- **Object:** Energy Orbs or Coins.
- **Logic:** Integer (Count).
- **Goal:** Pay a toll or Jump X times.
- **Lesson:** "The value I hold changes."

### Phase 3: Operations (The Calculator)

- **Object:** Number tiles.
- **Logic:** Addition/Subtraction.
- **Goal:** Create a specific number to solve a puzzle.
- **Lesson:** "I can change the value I hold by combining it with others."

---

## 2. Pedagogical Alignment

### Why not "Set Variable"?

Seymour Papert's "Syntonic Learning" suggests that children learn best when they can map concepts to their own bodies.

- _Abstract:_ "Set variable `score` to `score + 1`." (Alien, mathematical).
- _Syntonic:_ "I am holding a 3. I pick up a 1. Now I am holding a 4." (Physical, relatable).

### Developmental Stages

- **Pre-operational (3-4):** Understands possession ("I have the key").
- **Concrete Operational (5-7):** Understands conservation of number ("I have 3, I use it to jump 3 times").
- **Formal Operational (8+):** Understands abstract accumulation ("My score grows as I play").

---

## 3. Mechanics & Interaction

### A. The "Bubble" State

The character has a `memory` slot.

- **Empty:** Visually represented by a dashed outline or a faint "Empty" icon in the bubble.
- **Full:** Displays the icon/number clearly.

### B. Verbs (The Blocks)

#### 1. `Pick Up` (Assignment)

_Replaces `x = value`._

- **Action:** The character must be standing on a tile that contains a "Value Item" (e.g., a Number Tile, a Key).
- **Block:** `[Grab]` or `[Pick Up]`.
- **Effect:** The item moves from the world into the Character's Bubble.
- **Constraint:** If the bubble is full, the old item is dropped (or overwritten, depending on difficulty).

#### 2. `Use` (Read)

_Replaces parameter usage._

- **Action:** The user drags a **"Bubble Icon"** (representing "Whatever I am holding") into a block's input slot.
- **Example:**
  - Standard Block: `[Loop] (3) times`
  - Variable Block: `[Loop] (Bubble) times`
- **Runtime:** When the block executes, it looks at the _current_ value in the bubble.

#### 3. `Merge` (Modification)

_Replaces `x = x + y`._

- **Action:** The character holds a value (e.g., "3") and picks up another value (e.g., "1").
- **Block:** `[Collect]` or `[Merge]`.
- **Effect:** The values combine based on type.
  - _Numbers:_ Addition (3 + 1 = 4).
  - _Colors:_ Mixing (Red + Blue = Purple).
  - _Strings/Items:_ Concatenation or Inventory list (Advanced).

---

## 4. Progression & Curriculum (The Single Journey)

Instead of segregating mechanics by persona, we view these as stages in a single learning journey. Every child starts with concrete possession and graduates to dynamic accumulation when they are ready.

### Stage 1: Concrete Possession (Introduction)

**Concept:** Boolean State (Have / Don't Have).

- **Metaphor:** The Bubble is a "Pocket".
- **Scenario:** A locked gate.
- **Mechanic:** The bubble holds a specific item (e.g., a Key).
- **Task:** Walk to Key -> `[Pick Up]` -> Walk to Gate -> Gate opens automatically if Key is in Bubble.
- **Pedagogy:** Relies on object permanence. No math required.

### Stage 2: Data as Parameter (Intermediate)

**Concept:** Variable Substitution.

- **Metaphor:** The Bubble is a "Instruction Card".
- **Scenario:** A gap that varies in width.
- **Mechanic:** Number Tiles scattered on the ground.
- **Task:** "The gap is 3 wide!" -> Walk to '3' tile -> `[Pick Up]` -> Walk to gap -> `[Jump] (Bubble) spaces`.
- **Pedagogy:** Teaches that _data_ can control _action_.

### Stage 3: Dynamic Accumulation (Advanced / "Hard Pack")

**Concept:** Modification & Iteration (`x = x + 1`).

- **Metaphor:** The Bubble is a "Counter".
- **Scenario:** A "High Score" challenge or a dynamic loop.
- **Mechanic:** "Coin" tiles that count as '1'.
- **Task:** `[Loop]` 5 times: `[Move]`, `[Collect Coin]`.
- **Result:** Bubble counts 1, 2, 3, 4, 5. Then use that value to solve a final puzzle (e.g., "Pay 5 coins to exit").
- **Pedagogy:** Scaffolds the difficult concept of incrementing variables by treating it as "adding to a pile".

---

## 5. Visualizing "Stop" vs. "Go"

One of the hardest challenges is visualizing variables when time is frozen ("Stop" mode).

- **In GO Mode (Runtime):** The bubble updates in real-time. We see the number flip from 3 to 4.
- **In STOP Mode (Planning):**
  - The blocks using the variable (e.g., `[Jump] (Bubble)`) show a generic "Bubble" icon.
  - _Advanced (Jonas):_ If we implement "Time Scrubbing" (scrubbing the timeline), the bubble preview updates to show what the value _would_ be at that step.

---

## 6. Technical Implementation Plan (Draft)

1.  **Schema Update:** Add `memory` field to `CharacterState`.
2.  **Renderer:** Add `ThoughtBubble` component to the `Actor` visualization.
3.  **New Blocks:**
    - `PickUpBlock`: Interaction with `Tile.item`.
    - `MergeBlock`: Logic for combining values.
4.  **Input Slots:** Update `Block` definition to accept a `VariableReference` as an argument instead of just static primitives.
