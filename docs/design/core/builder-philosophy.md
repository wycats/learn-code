# Builder Design Philosophy: The Architect

The Level Builder is not just a utility; it is a gameplay mode where the player takes on the role of "The Architect". The interface should feel like an extension of the game world, not a separate administrative tool.

## Core Principles

### 1. Diegetic Editing (The "In-World" Principle)

**Principle:** If a player sees an element in the game, they should edit it in the same visual context in the builder.
**Why:** This maintains immersion and provides immediate visual feedback (WYSIWYG). It reduces the cognitive load of mapping a form field (e.g., "Level Name") to its in-game representation.
**Application:**

- **Story:** Edit dialogue in the `InstructionBar` overlay, not a sidebar list.
- **Level Config:** Edit the Level Name, Description, and Par in the `GoalModal` (Start Screen), not a "Settings" panel.
- **Constraints:** Edit "Max Blocks" in the `Tray` or `GoalModal` where it is displayed to the player.

### 2. Direct Manipulation

**Principle:** Interact directly with the object you want to change.
**Why:** It is faster and more intuitive than navigating menus.
**Application:**

- Click a grid cell to change its terrain.
- Click a character's face to change the speaker.
- Click the text to edit the dialogue.

### 3. Contextual Configuration

**Principle:** Configuration options should appear where they are relevant to the player's experience.
**Why:** It helps the builder understand the _impact_ of the configuration.
**Application:**

- **Grid Size:** This is a structural property of the world, so it makes sense in a "World" or "Map" tool palette.
- **Available Blocks:** This defines the player's toolkit. It should be edited in the context of the `Tray` (the player's toolkit), not a generic "Config" list.

### 4. Seamless Mode Switching

**Principle:** The transition between "Building" and "Testing" should be instant and fluid.
**Why:** Iteration speed is key to creativity. The "Architect" constantly tests their creation.
**Application:**

- A single toggle switches modes.
- The game state is preserved or reset intelligently (e.g., reset execution but keep camera position).

## Design Implications for "Max Blocks"

Currently, `maxBlocks` is edited in the `BuilderTray` under a "Backpack" section.
**Critique:** This treats `maxBlocks` as a hidden variable.
**Better Approach:**

- In the game, the player sees "Max Blocks" either in the `Tray` (e.g., "0/5 Blocks Used") or in the `GoalModal` (e.g., "Par: 3").
- Therefore, `maxBlocks` should be editable in the `BuilderGoalModal` (if it's a level constraint) or directly on the `BuilderTray` header (if it's a backpack limit).
- Moving it to the `BuilderGoalModal` reinforces that it is a _rule_ of the level, just like the Par score.

## Design Implications for "Backpack" (Available Blocks)

Currently, `availableBlocks` is edited via a list of checkboxes in the `BuilderTray`.
**Critique:** This is an administrative form, not a diegetic interaction.
**Better Approach:**

- The `BuilderTray` should look like the `GameTray`.
- It should display the actual block buttons (Move, Turn, Loop, etc.).
- **Interaction:** Clicking a block in the Builder Tray toggles its availability.
  - **Available:** Fully opaque, looks like a usable button.
  - **Unavailable:** Dimmed/Ghosted, looks disabled.
- This allows the builder to "stock the shelves" of the player's toolkit directly.

## Design Implications for "Grid Size"

Currently, `gridSize` is edited via numeric inputs in the `BuilderTray`.
**Critique:** The grid size is a fundamental property of the level's "Map".
**Better Approach:**

- Move these settings to the `BuilderGoalModal` (Level Settings) alongside Name and Par.
- This groups all "Level Rules" together.
- _Future Iteration:_ Drag handles on the grid edges to resize the world directly.

## Design Implications for Iconography

Currently, the "Start" and "Goal" tools use generic icons (`MapPin`).
**Critique:** This disconnects the tool from the object it places.
**Better Approach:**

- The "Start" tool button should display the actual Character avatar (or a simplified version).
- The "Goal" tool button should display the actual Star/Flag icon.
- This reinforces the "Direct Manipulation" principle—you are picking up the character and placing them.

## Implementation Plan

1.  **Move `maxBlocks` to `BuilderGoalModal`**: Add an input for "Max Blocks" alongside "Par".
2.  **Move `gridSize` to `BuilderGoalModal`**: Remove from Tray, add to Modal.
3.  **Refine `BuilderTray`**:
    - Remove the "Backpack" configuration section.
    - Render the `blockTypes` as actual `BlockComponent` instances (or similar visual proxies).
    - Implement toggle logic (click to enable/disable).
    - Update Tool Icons to match game assets.
