# Targeting Workflow Design

## Problem Statement
The current "Pick Mode" for selecting targets is confusing because it lacks context and affordances. Users are dropped into a mode where they click things, but it's unclear *what* they are populating or how to manage the selection (e.g., clearing it).

## Proposed Solution: "Contextual Target Mode"

Instead of a separate tab or a disconnected modal, we will implement a **Contextual Target Mode** that overlays the existing interface. This preserves the "diegetic" nature of selecting elements (clicking the actual grid cells or code blocks) while providing clear UI affordances.

### Core Concepts

1.  **Universal Targets**: Targets are used by **Story Segments** (to highlight areas during narrative) and **Hints** (to check conditions in specific areas).
2.  **Diegetic Selection**: Users select targets by clicking the actual elements in the workspace (Grid Cells, and eventually Code Blocks).
3.  **Contextual Controls**: When targeting is active, a dedicated control panel (floating or integrated) provides feedback and actions (Clear, Done).

### Workflow

1.  **Entry**:
    *   The user is editing a Story Segment or a Hint.
    *   They click a **Bullseye Icon** (Target Toggle) associated with that specific item.
2.  **Target Mode Active**:
    *   The UI enters a "Picking State".
    *   **Visual Feedback**: The specific item being edited (e.g., the Story Card) remains highlighted/active, while unrelated UI might dim slightly to focus attention on the workspace (Grid/Code).
    *   **Floating Controls**: A "Targeting Bar" appears (or the Story Card transforms) to show:
        *   "Selecting targets for [Segment Name]..."
        *   Current count: "3 selected"
        *   Actions: **[Clear Selection]** **[Done]**
3.  **Interaction**:
    *   **Hover**: Selectable elements (cells) highlight on hover.
    *   **Click**: Toggles selection.
    *   **Visuals**: Selected elements have a distinct, high-contrast outline or overlay color.
4.  **Exit**:
    *   Clicking **[Done]** or the Bullseye icon again saves the selection and returns to normal editing.

### UI Placement Ideas

Since targets can be anywhere (Grid or Code), the "Target Mode" cannot be a sidebar tab.

*   **The "Active Item" Anchor**: The Story Segment or Hint card itself becomes the anchor. When you click the Bullseye, that card could "stick" or "float" while you interact with the rest of the screen.
*   **The "Targeting Bar"**: A consistent bar at the top/bottom of the viewport (like a "Toast" or "Banner") that appears whenever Target Mode is active. This provides a consistent place for "Clear" and "Done" regardless of what you are editing.

### Data Model

*   **LevelDefinition**:
    *   `targets`: A dictionary of `TargetID -> { type: 'cell' | 'block', id: string, name?: string }`.
    *   This allows us to decouple the *concept* of a target from the *implementation* (UUID).
    *   Story Segments and Hints reference `TargetID`s.

### Transition Plan

1.  **Phase 1 (The "Banner")**:
    *   Keep the "Bullseye" button in the Story Segment card.
    *   When clicked, show a **Top Banner**: "Targeting Mode: Select cells on the grid." with a **[Clear]** button and **[Done]** button.
    *   While active, clicking grid cells toggles their UUID in the segment's target list.
    *   Draw a distinct border around selected cells.
2.  **Phase 2 (Hints)**:
    *   Apply the same workflow to the Hint Editor.
3.  **Phase 3 (Named Targets - Optional)**:
    *   Allow assigning a name to a selection in the Banner (e.g., "Lava Pit"), so it can be reused.

## Advantages
*   **Direct Manipulation**: Users interact directly with the game world.
*   **Clarity**: The Banner/Bar explicitly states *what* is happening ("Targeting Mode").
*   **Safety**: The [Clear] button provides a way to undo/reset without frustration.
