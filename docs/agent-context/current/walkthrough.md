# Phase 15 Walkthrough

## 1. Functions in Builder (Magic Blocks)

We implemented the ability for Architects to define custom functions (Magic Blocks) within the Level Builder.

### Key Changes

- **Data Model**: Leveraged the existing `functions` field in `LevelSchema`.
- **Builder Model**: Added `createFunction`, `deleteFunction`, and `editFunction` methods to `BuilderModel`.
  - `editFunction(name)` sets `game.editingContext` to the function name.
  - `closeFunctionEditor()` syncs the function blocks back to the level definition.
- **UI Components**:
  - Created `FunctionManager.svelte`: A new component to list, create, and delete functions.
  - Updated `BuilderTray.svelte`: Added a "Functions" tab to the sidebar.
  - Updated `Tray.svelte`:
    - Added logic to display function blocks in the palette if the `call` block is available.
    - Added a tab bar above the program list to switch between "Main" and specific functions when editing.
- **Interpreter**:
  - Verified `StackInterpreter` supports function calls.
  - Added stack depth protection (max 50 frames) to prevent infinite recursion crashes.

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

- **Schema**: Added `spikes` to the `BuiltInCellTypeSchema`.
- **Rendering**: Updated `Cell.svelte` to render a red triangle for spike tiles.
- **Logic**: Updated `StackInterpreter` (`mimic.ts`) to treat `spikes` as a hazard (similar to `hazard` custom tiles), causing the robot to fail if it steps on them.
- **Builder**: Added "Spikes" to the Terrain palette in both `BuilderTray` and `BuilderToolbar`.

### User Experience

1.  In the Builder, select the "Spikes" tool (Red Triangle).
2.  Paint spikes on the grid.
3.  Test the level.
4.  If the robot steps on a spike, it fails immediately.

## 3. Jonas's Wishlist (Polish)

We implemented several UI/UX improvements requested by the user.

### Key Changes

- **Difficulty Indicators**:
  - Added `difficulty` field to `LevelDefinitionSchema` (beginner, intermediate, advanced).
  - Updated `LevelMap.svelte` to display a colored dot (Green/Yellow/Red) on level nodes indicating difficulty.
  - Updated `BuilderGoalModal.svelte` to allow Architects to set the difficulty level.
- **Selectable Icons**:
  - Created `IconPicker.svelte`: A reusable component for selecting icons from the Lucide library.
  - Added `icon` field to `LevelDefinitionSchema`.
  - Integrated `IconPicker` into `BuilderGoalModal.svelte` to allow setting a custom icon for the level.
- **Speaker Avatars**:
  - Added `avatar` field to `StorySegmentSchema` to allow overriding the character's default avatar for specific dialogue lines.
  - Updated `InstructionBar.svelte` to respect the segment-level avatar if present.
  - Verified that `StoryConfigModal.svelte` already supports selecting avatars for characters.

## 4. Local File System Integration

We enabled users to load and save Level Packs directly from their local file system, bypassing the browser's IndexedDB storage for easier sharing and backup.

### Key Changes

- **Service**: Created `FileSystemService` (`src/lib/services/file-system.ts`) to wrap the modern File System Access API (`showDirectoryPicker`, `showSaveFilePicker`).
- **State**: Created `localPacksStore` (`src/lib/game/local-packs.svelte.ts`) to manage the state of packs loaded from disk.
- **Library UI**: Added an "Open Local Folder" button to the Library page.
  - Users can select a folder containing `pack.json` files.
  - Loaded packs appear in a new "Local Packs" section.
- **Builder UI**: Added a "Save to Disk" button (and Ctrl+S shortcut) to the Builder.
  - Allows saving the current pack as a JSON file to the user's machine.
- **Link to Disk**: Implemented a persistent link feature.
  - Users can "Link" a pack to a local folder.
  - Changes are synced automatically to both OPFS and the local disk.
  - The link persists across reloads (stored in IndexedDB), with permission handling.
  - **UX Refinement**: Replaced intrusive alerts and global toasts with inline status messages (e.g., "Saved!", "Linked!") that appear next to the action buttons for immediate, non-blocking feedback.
- **Verification**: Added unit tests (`src/lib/services/file-system.test.ts`) to verify the linking, syncing, and permission handling logic of the `FileSystemService`.

## 5. Builder UI Polish

Refined the Builder Goal Modal based on user feedback.

### Key Changes

- **Constraints Toggles**: Added checkboxes to enable/disable "Par" and "Max Blocks" constraints explicitly.
- **Difficulty Badge**: Converted the difficulty dropdown into a clickable badge that cycles through difficulty levels.
- **Visuals**: Improved layout and spacing in the modal.

## How to Try It Out

### 1. Functions (Magic Blocks)
1.  Navigate to the **Builder** (Create > New Pack > New Level).
2.  Open the **Functions** tab in the left sidebar.
3.  Click **New Function**, name it "Jump".
4.  Click the **Edit** (pencil) icon next to "Jump".
5.  Notice the tray changes to "Editing: Jump". Drag some blocks (e.g., Move Forward, Turn Left) into the workspace.
6.  Click **Back to Main** in the tray header.
7.  Go to the **Logic** tab in the sidebar and ensure the **Call** block is enabled (checked).
8.  In the **Available Blocks** palette, you should now see a "Jump" block.
9.  Drag "Jump" into your main program and run the level. The robot should execute the function's steps.

### 2. Hazards (Spikes)
1.  In the Builder, select the **Terrain** tool (Box icon).
2.  Choose the **Spikes** tool (Red Triangle) from the dropdown.
3.  Paint some spikes on the grid.
4.  Switch to **Test Mode** (Play button).
5.  Program the robot to walk onto the spikes.
6.  Verify that the robot "dies" (fails) upon stepping on the spikes.

### 3. Local File System (Link to Disk)
1.  Go to the **Library**.
2.  Click **Open Local Folder** and select a folder on your computer (create an empty one for testing).
3.  Create a new Pack in the Builder.
4.  In the Pack Editor (folder icon in toolbar), click the **Link to Disk** button (Link icon).
5.  Select the same folder you opened in the Library.
6.  You should see a "Linked!" status message appear next to the button.
7.  Make a change to the pack (e.g., rename it, add a level).
8.  Check the folder on your computer; you should see a `pack.json` file updated with your changes.
9.  Reload the page. The pack should still be linked (you may need to re-grant permission by clicking the "Reconnect" button if prompted).
