# Interaction Model & Philosophy

## Core Philosophy: "Touch-First Precision"

The interaction model is designed to bridge the gap between **intuitive exploration** (Drag & Drop) and **precise construction** (Click-to-Insert). While Drag & Drop is physically satisfying and easy to understand, it lacks precision on touch screens and can be slow for repetitive tasks. Our model supports both, treating them as complementary modes rather than competing alternatives.

## The "Stop & Go" Engine

As defined in `mechanics.md`, the application operates in two distinct modes:

1.  **STOP Mode (The Lab)**: The world is frozen. The user is an Architect, building and refining the program.
2.  **GO Mode (The Stage)**: The program executes. The user is an Observer, verifying the logic.

_This document focuses on the interactions within STOP Mode._

## The Tray: Stability & Context

The interface uses a **Two-Column "IDE" Layout** to ensure stability.

- **Left Column (Stage)**: The visual output. It never moves or resizes during interaction.
- **Right Column (Tray)**: The workspace.
  - **Palette (Top)**: The source of truth. Always visible, never changes.
  - **Program (Bottom)**: The user's creation. Grows vertically.

### Design Principle: "No Layout Shifts"

Selecting a block or opening a menu should never cause the rest of the interface to jump.

- **Floating Toolbar**: Contextual actions (Trash, Loop Settings, Multi-Select) appear in a _floating layer_ to the left of the tray. This keeps the program list stable even when inspection tools appear.

## Insertion Mechanics

We support three distinct methods for adding blocks, catering to different user needs and motor skills.

### 1. Drag & Drop (The Physical Model)

_Best for: Beginners, rearranging blocks, intuitive understanding._

- **Behavior**: Users drag a block from the Palette or Program.
- **Feedback**: A "Blue Line" indicator shows exactly where the block will land.
- **Recursive Logic**:
  - Dropping _on_ a container (like "Again") inserts it inside.
  - Dropping _between_ blocks inserts it there.
  - **Constraint**: To prevent ambiguity, drop targets are strictly defined by the mouse/finger position relative to the block's vertical center.

### 2. Click-to-Insert (The Speed Model)

_Best for: Rapid construction, accessibility, avoiding drag fatigue._

- **Behavior**: Tapping a block in the Palette immediately adds it to the program.
- **Logic**:
  - **No Selection**: Appends to the end of the main program.
  - **Selection Active**: Inserts _immediately after_ the selected block.
  - **Selection is Container**: If a container (Loop) is selected, where does it go? (See "Ghost Affordances").

### 3. Ghost Affordances (The Preview Model)

_Best for: Complex insertions, resolving ambiguity._

- **Problem**: When a Loop is selected, clicking "Step" is ambiguous. Does the user want the step _inside_ the loop or _after_ it?
- **Solution**: We do not guess. We show **Ghosts**.
  - **Visuals**: Semi-transparent, desaturated versions of the block appear in all valid locations (e.g., one inside the loop, one after).
  - **Interaction**: The user taps the specific Ghost they intended.
  - **Outcome**: The Ghost becomes real; the others vanish.

## Selection & Power Tools

As users progress, they need tools to refactor code, not just append to it.

### Single Selection

- **Behavior**: Tapping a block selects it.
- **Visuals**: A solid blue border indicates selection.
- **Context**: The Floating Toolbar appears, offering:
  - **Trash**: Delete the block.
  - **Settings**: (For Loops) Change iteration count.

### Multi-Select (Planned)

_Best for: Refactoring, moving chunks of code._

- **Activation**: Toggle via the Floating Toolbar.
- **Behavior**: Tapping blocks adds them to the selection.
- **Constraints**:
  - **Parent-Child Locking**: Selecting a parent (Loop) _automatically_ selects all its children. You cannot move a Loop without its contents.
  - **Contiguity**: While non-adjacent selection is possible for deletion, moving non-adjacent blocks will "collapse" them into a single sequence upon drop.

### Duplication (Planned)

_Best for: Repeating patterns._

- **Clipboard**: A temporary storage for copied blocks.
- **Paste Mode**: Reuses the **Ghost Affordance** system.
  - Clicking "Duplicate" puts the blocks in the clipboard.
  - Valid insertion points light up with Ghosts of the copied sequence.
  - Tapping a Ghost pastes the sequence.

## Recursive Logic & Nesting

The "Again" (Loop) block introduces hierarchy.

- **Rendering**: Loops render their children recursively.
- **Dropping**:
  - We use a recursive search (`findAndInsert`) to locate the correct parent list.
  - Dropping into a Loop targets its internal `children` array.
- **Visuals**: Empty loops show a centered "Drop here" text to invite interaction.
