# Phase 15 Walkthrough

## 1. Functions in Builder (Magic Blocks)

We implemented the ability for Architects to define custom functions (Magic Blocks) within the Level Builder.

### Key Changes

-   **Data Model**: Leveraged the existing `functions` field in `LevelSchema`.
-   **Builder Model**: Added `createFunction`, `deleteFunction`, and `editFunction` methods to `BuilderModel`.
    -   `editFunction(name)` sets `game.editingContext` to the function name.
    -   `closeFunctionEditor()` syncs the function blocks back to the level definition.
-   **UI Components**:
    -   Created `FunctionManager.svelte`: A new component to list, create, and delete functions.
    -   Updated `BuilderTray.svelte`: Added a "Functions" tab to the sidebar.
    -   Updated `Tray.svelte`:
        -   Added logic to display function blocks in the palette if the `call` block is available.
        -   Added a tab bar above the program list to switch between "Main" and specific functions when editing.
-   **Interpreter**:
    -   Verified `StackInterpreter` supports function calls.
    -   Added stack depth protection (max 50 frames) to prevent infinite recursion crashes.

### User Experience

1.  In the Builder, go to the "Functions" tab.
2.  Click "New Function" and give it a name (e.g., "Jump").
3.  Click the "Edit" (pencil) icon.
4.  The Program Tray switches to "Jump" context.
5.  Drag blocks into the tray to define the function.
6.  Switch back to "Main" context.
7.  Enable the "Call" block in the "Logic" tab.
8.  The "Jump" block now appears in the palette (if "Call" is enabled).

## 2. Hazards (Spikes)

We introduced a new gameplay mechanic: Spikes.

### Key Changes

-   **Schema**: Added `spikes` to the `BuiltInCellTypeSchema`.
-   **Rendering**: Updated `Cell.svelte` to render a red triangle for spike tiles.
-   **Logic**: Updated `StackInterpreter` (`mimic.ts`) to treat `spikes` as a hazard (similar to `hazard` custom tiles), causing the robot to fail if it steps on them.
-   **Builder**: Added "Spikes" to the Terrain palette in both `BuilderTray` and `BuilderToolbar`.

### User Experience

1.  In the Builder, select the "Spikes" tool (Red Triangle).
2.  Paint spikes on the grid.
3.  Test the level.
4.  If the robot steps on a spike, it fails immediately.

## 3. Jonas's Wishlist (Polish)

We implemented several UI/UX improvements requested by the user.

### Key Changes

-   **Difficulty Indicators**:
    -   Added `difficulty` field to `LevelDefinitionSchema` (beginner, intermediate, advanced).
    -   Updated `LevelMap.svelte` to display a colored dot (Green/Yellow/Red) on level nodes indicating difficulty.
    -   Updated `BuilderGoalModal.svelte` to allow Architects to set the difficulty level.
-   **Selectable Icons**:
    -   Created `IconPicker.svelte`: A reusable component for selecting icons from the Lucide library.
    -   Added `icon` field to `LevelDefinitionSchema`.
    -   Integrated `IconPicker` into `BuilderGoalModal.svelte` to allow setting a custom icon for the level.
-   **Speaker Avatars**:
    -   Added `avatar` field to `StorySegmentSchema` to allow overriding the character's default avatar for specific dialogue lines.
    -   Updated `InstructionBar.svelte` to respect the segment-level avatar if present.
    -   Verified that `StoryConfigModal.svelte` already supports selecting avatars for characters.


