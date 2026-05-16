# Interaction Patterns: The Kinetic Language

This document defines the specific _interaction patterns_ that implement our high-level axioms (specifically "The Kinetic Bridge" and "Touch First"). These patterns go beyond simple "Drag & Drop" to define the _feel_ of the application.

## 1. Snap-to-Intent (The Magnet)

**Axiom Alignment:** [The Kinetic Bridge](../core/axioms/kinetic-bridge.md), [Unified Physics](../core/axioms/unified-physics.md)

### The Problem

On touch screens, fingers obscure the target. Standard "drop lines" are often covered by the user's hand, leading to "drop anxiety" (not knowing exactly where the item will land).

### The Pattern

Instead of a passive indicator (a line), we use an **active magnet**.

1.  **Proximity Field**: Every valid drop target has a "gravity well" larger than its visual bounds.
2.  **Visual Snap**: When a dragged block enters the well, the _preview ghost_ snaps into the final position immediately.
3.  **Haptic Confirmation**: A subtle haptic tick confirms the snap (on supported devices).

### Implementation Note

This relies on the `InteractionManager`'s `LogicalIndex`. The "gravity well" calculation must happen on the "Headless" side, updating the `InteractionSession` state to `snapped(targetId)`.

---

## 2. Direct Value Manipulation (The Dial)

**Axiom Alignment:** [Touch First](../core/axioms/touch-first.md), [Low Floor](../core/axioms/low-floor-high-ceiling.md)

### The Problem

Opening a modal or keyboard to change a small number (e.g., changing "Repeat 3" to "Repeat 4") breaks flow. It forces a context switch from "Spatial/Kinetic" to "Symbolic/Typing".

### The Pattern

Treat numeric values as **physical dials**.

1.  **Tap**: Opens the standard numeric keypad (for large changes).
2.  **Drag Up/Down**: Increment/Decrement the value directly.
3.  **Velocity Scaling**: Dragging faster changes the value in larger increments (1 -> 5 -> 10).

### Visual Feedback

The number field should visually "slide" or "roll" like a combination lock tumbler to reinforce the physical metaphor.

---

## 3. The "Drafting Table" (The Scratchpad)

**Axiom Alignment:** [Stop & Go](../core/axioms/stop-and-go.md), [Tools for Thought](../core/axioms/tools-for-thought.md)

### The Problem

The main program list enforces strict syntax (valid execution order). This makes it hard to "think with blocks" – to assemble a subroutine or experiment with a pattern without breaking the main program.

### The Pattern

A dedicated **Scratchpad Area** (or "Drafting Table") in the UI.

1.  **Inert Physics**: Blocks placed here do _not_ execute.
2.  **Freeform Layout**: Blocks can be placed loosely (2D canvas) or in disconnected stacks.
3.  **Promotion**: Dragging a stack from the Scratchpad to the Main Program "compiles" it (snaps it into the linear flow).

---

## 4. Semantic Zoom (The Map)

**Axiom Alignment:** [Native Modality](../core/axioms/native-modality.md), [Low Floor, High Ceiling](../core/axioms/low-floor-high-ceiling.md)

### The Problem

As programs grow, scrolling becomes tedious. Users lose the "forest for the trees."

### The Pattern

Pinch-to-zoom on the program list triggers **Semantic Zoom**, not optical zoom.

1.  **100% (Detail View)**: Full blocks, properties, icons.
2.  **50% (Structure View)**: Properties hidden. Blocks become smaller bars. Loops show their structure but hide inner block details.
3.  **25% (Map View)**: Blocks are colored lines. The shape of the program (loops, branches) is visible, but text is gone.

---

## 5. The "Lens" (The Debugger)

**Axiom Alignment:** [Tools for Thought](../core/axioms/tools-for-thought.md), [Failure is Information](../core/axioms/failure-is-information.md)

### The Problem

Runtime state is invisible. When a loop fails, you can't see _why_ (e.g., "What is the value of `i` right now?").

### The Pattern

A **Long-Press** (or secondary click) on any block activates the **Lens**.

1.  **Contextual Popover**: Appears immediately above the finger.
2.  **Runtime Data**: If the program is running (or paused), it shows the _current_ values of variables relevant to that block.
3.  **History**: If the program is stopped, it shows the _last known_ value or a "frequency map" (how many times this block ran).

---

## 6. Kinetic Deletion (The Throw)

**Axiom Alignment:** [Kinetic Bridge](../core/axioms/kinetic-bridge.md)

### The Problem

Clicking a trash icon is bureaucratic. Dragging to a specific trash can is slow.

### The Pattern

**Velocity-based Dismissal**.

1.  **The Fling**: If a user drags a block _away_ from the program list with high velocity and releases it over "empty space" (not a valid drop target), it is treated as a deletion.
2.  **The Poof**: The block dissolves visually (e.g., a "poof" animation) to confirm deletion.
3.  **Undo**: A toast appears immediately: "Block deleted. Undo?"
