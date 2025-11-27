# Core Mechanics & MVP Scope

## Core Philosophy: The "Stop & Go" Engine

The application is built around two distinct modes of interaction, mirroring the _Wonderblocks_ pedagogy. This separation is the primary mechanic that distinguishes it from other coding games.

**Interaction Note**: The entire experience is designed **Touch-First**. Every action must be performable with a single finger on a tablet. Keyboard and mouse are supported as enhancements (e.g., hotkeys, precision clicking) but are never required.

### 1. STOP Mode (The Lab)

- **State**: The world is frozen. Time does not pass.
- **Action**: Planning and Construction.
- **UI Focus**: The "Block Tray" and the "Sequence Bar" (The Queue).
- **Player Role**: The Architect.
- **Mechanic**:
  - **Drag & Drop**: Users drag blocks from a palette to a linear timeline.
  - **Linear Sequence**: Blocks snap together horizontally (Left -> Right).
  - **Editing**: Blocks can be reordered, removed, or inserted.
  - **No Execution**: Clicking a block in this mode only plays its sound/name, it does _not_ execute the action in the world.

### 2. GO Mode (The Stage)

- **State**: The sequence executes. The world reacts.
- **Action**: Observation and Verification.
- **UI Focus**: The Main Stage (The World). The Sequence Bar highlights the active block.
- **Player Role**: The Audience / Director.
- **Mechanic**:
  - **Read-Only**: The sequence cannot be edited while running.
  - **Step-by-Step**: The character performs actions one by one.
  - **Highlighting**: The current block in the sequence lights up as the action happens.
  - **Physics/Logic**: If the character hits a wall or falls, the sequence pauses or fails.

---

## MVP Scope (Phase 2 Target)

The Goal of the MVP is to prove the "Stop & Go" interaction loop with the simplest possible content.

### The World (The Stage)

- **Grid System**: A simple 2D tile-based grid (e.g., 5x5).
- **Character**: A placeholder "Go" character (Green Circle).
- **Goal**: A "Star" or "Flag" tile to reach.
- **Obstacles**: Walls (cannot walk through) and Pits (fall in).

### The Blocks (The Language)

- **Move Right**: Moves one tile East.
- **Move Up**: Moves one tile North.
- _(MVP Constraint: No turning logic yet. Absolute movement is easier for 3-year-olds to map initially than relative "Forward/Turn Left" logic)._

### The Interface

- **Play Button**: The trigger to switch from STOP to GO.
- **Stop/Reset Button**: The trigger to switch from GO back to STOP (resets character to start).
- **Trash Can**: To remove blocks.

### Success Criteria

1.  User drags "Move Right" -> "Move Right" -> "Move Up".
2.  User hits "Play".
3.  Character moves Right, Right, Up.
4.  Character lands on Goal.
5.  "Win" animation plays.

---

## Future Mechanics (Post-MVP)

- **Relative Movement**: "Forward", "Turn Left", "Turn Right" (Introduces orientation state).
- **The "Again" Block**: A container block that repeats its contents (Loops).
- **The "Magic" Block**: A function call that triggers a separate sequence.
- **PXT Toggle**: A button to flip the card and see the TypeScript code (for Jonas/Yehuda).
