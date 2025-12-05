# Level Builder Design: "The Architect"

## Philosophy: Super Mario Maker for Code

The Level Builder is not a separate administrative tool; it is a core part of the _Kibi_ experience. It should feel like an extension of the game itself—tactile, playful, and immediate.

**Core Tenets:**

1.  **WYSIWYG**: The editor view _is_ the game view, just with different tools.
2.  **Seamless Switching**: Toggling between "Edit" and "Play" should be instant and fluid. No page reloads, no context loss.
3.  **Tactile Construction**: Placing a wall or a goal should feel as satisfying as snapping a code block. Use sound effects, "pop" animations, and haptic feedback.
4.  **Editing Affordances**: We don't build new "forms" for editing; we add editing capabilities directly to the game elements. If you want to edit a dialogue, you click the dialogue bubble.

## Interaction Model

### The Modes

Instead of a separate route, the Builder is a **Mode** of the Game View.

1.  **Edit Mode (The Architect)**
    - **Stage**: The Grid is interactive. Tapping a cell paints it with the selected tool.
    - **Tray**: The "Code Tray" is replaced by a "Builder Tray".
    - **Story**: The "Instruction Bar" becomes a "Story Editor".

2.  **Test Mode (The Player)**
    - **Stage**: The Grid becomes the standard game stage.
    - **Tray**: The "Builder Tray" slides away, replaced by the "Code Tray".
    - **Behavior**: Identical to the standard game loop, but with "Cheat" enhancements.

### Painting Interactions

We support multiple ways to paint the grid, catering to different needs:

1.  **Tap**: Paints a single cell.
2.  **Drag**: Paints a continuous path (like a brush). Good for drawing rivers or walls.
3.  **Click-Click (Range)**:
    - Click once to set the "Start" anchor.
    - Click another cell to set the "End" anchor.
    - The area between (line or rectangle, depending on tool) is filled.
    - _Why?_ Precise construction without drag fatigue.

### Test Mode Enhancements ("Cheats")

When testing a level, the Architect needs superpowers to verify logic quickly:

- **Teleport**: Drag the character to any cell to set a temporary start position.
- **Orientation**: Tap the character to rotate them instantly.
- **Onion Skinning**: Show "Ghost" trails of the character's last 3 positions to visualize the path history.
- **Jump to Step**: Ability to fast-forward the execution to a specific step (or set loop iterations to 1 for testing).

## UI / UX Details

### The Builder Tray

Located at the bottom (replacing the coding tray).

- **Tabs/Categories**:
  - **Map**: Terrain tiles (Grass, Water, Wall).
  - **Actors**: Character (Start), Star (Goal).
  - **Rules**: Block limits, available blocks.
- **Selection**: The active tool is highlighted.

### The Story Editor (Script)

Instead of a separate form, the Story Editor is a "Chat UI" that lives where the Instruction Bar usually is (or expands from it).

- **Visuals**: Looks like a script or chat log.
- **Rows**: Each row represents a `StorySegment`.
- **Editing**:
  - **Speaker**: Click the avatar to cycle through speakers (Zoey, Jonas, Guide, System).
  - **Emotion**: Click the emotion icon to pick from a popover.
  - **Text**: Click the text to edit inline.
- **Reordering**: Drag and drop rows to reorder the script.
- **Triggers**: A small "Trigger" icon on the row allows setting the `advanceCondition` (e.g., "Wait for Block Placed").

### The "Backpack" (Block Configuration)

How do we define _available_ blocks?

- **Concept**: The "Backpack" represents the inventory the player will have.
- **Interaction**: The user drags blocks _from_ a master list _into_ the Backpack.
- **Limits**: User can set a "Max Blocks" count on the Backpack itself.

## Technical Implications

- **State**: We need a `BuilderModel` that wraps the `LevelDefinition`.
- **Reactivity**: Changes in the Builder immediately update the `LevelDefinition`, which reactively updates the `Grid` component.
- **Serialization**: The "Save" button simply dumps the current `LevelDefinition` to JSON (or local storage).

## Future Scope (Not Phase 8)

- **Custom Terrain**: A "Tile Designer" to let users create their own terrain visuals (not pixel art, maybe pattern/color composition).
- **Sharing**: Generating shareable links or QR codes.
- **Campaigns**: Linking multiple custom levels together.
