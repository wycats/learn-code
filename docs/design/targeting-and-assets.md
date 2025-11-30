# Design Refinement: Targeting & Assets

## 1. Targeting System

### Problem
Users need to refer to specific elements in the game (blocks, cells, UI) within Hints and Story Segments (e.g., "See that step block?"). The current system only supports generic highlighting or single targets.

### Requirements
- **Specificity**: Target specific instances of blocks (not just "all move blocks").
- **Multiplicity**: Target multiple elements at once (e.g., "These three cells").
- **Simplicity**: The UI should not become "form slop".

### Solution: "Pick Mode"
Instead of typing IDs or selecting from a complex dropdown, we introduce a **Pick Mode**.

1.  **Trigger**: In the Hint/Story Editor, the user clicks a "Target" button (icon: Crosshair/Target).
2.  **State**: The Editor minimizes/docks. The game view enters "Selection Mode".
3.  **Interaction**:
    -   **Hover**: Hovering over valid targets (Blocks, Cells, UI Elements) highlights them.
    -   **Click**: Toggles selection. Selected items get a distinct outline/badge.
    -   **Confirm**: A floating "Done" button confirms the selection.
4.  **Result**: The selected IDs are stored in the `targets` array of the Hint/Segment.
5.  **Visuals**: In the Editor, selected targets are shown as small "chips" or a summary ("3 blocks selected"). Hovering the chip highlights the target in the preview.

### Schema Updates
-   Update `HintSchema` and `StorySegmentSchema`:
    -   Deprecate `highlight` (string/object).
    -   Add `targets`: `z.array(z.string())`.
-   Target ID Format:
    -   Blocks: `block:<uuid>`
    -   Cells: `cell:<x>,<y>`
    -   UI: `ui:<element-id>` (e.g., `ui:play-button`, `ui:speed-slider`)

## 2. Pack-Wide Assets

### Problem
Characters, Emotions, and Tiles should be consistent across a Campaign (Pack) to avoid redefining them for every level ("form slop").

### Solution: Inheritance Model
1.  **Definition**: Assets are defined at the **Pack Level**.
2.  **Overrides**: Levels can *append* to this list or *override* specific IDs (though appending is safer).
3.  **UI**:
    -   **Pack Settings**: A dedicated view to manage the "Cast" (Characters) and "Vibes" (Emotions).
    -   **Level Editor**: When selecting a character/emotion, the list combines Pack + Level assets.

### Schema Status
-   `LevelPackSchema` already contains `characters` and `emotions`.
-   No schema change needed, just UI implementation.

## 3. The "None" Mood

### Requirement
A built-in "Neutral" or "None" mood with no emoji.

### Implementation
-   **ID**: `none`
-   **Display**: Rendered as a simple placeholder or hidden icon in the editor. In the game, no emoji is shown next to the dialogue.
-   **Default**: This should be the default state for new story segments.
