# Phase 8 Walkthrough: Level Builder

## Overview
In this phase, we implemented the "Level Builder", a comprehensive editor that allows users to create, test, and share custom levels. The builder is designed with a "Super Mario Maker" philosophy, emphasizing tactile interaction and seamless switching between editing and playing.

## Key Components

### 1. Builder Model (`src/lib/game/builder-model.svelte.ts`)
The `BuilderModel` is the core state manager for the editor. It uses Svelte 5 Runes to track:
- The `LevelDefinition` being edited.
- The current `activeTool` (Terrain, Actor, Erase).
- The editor `mode` (Edit vs. Test vs. Story).
- A live `GameModel` instance that is synchronized with the level definition for preview and testing.

### 2. Grid Interaction (`src/lib/components/game/Grid.svelte`)
We enhanced the existing `Grid` component to support "Edit Mode".
- **Drag-to-Paint**: Users can click and drag to paint terrain or place objects rapidly.
- **Visual Feedback**: Cells highlight on hover to indicate interactivity.
- **Event Handling**: The grid emits `onCellClick` events that are handled by the `BuilderModel`.

### 3. Builder Tray (`src/lib/components/builder/BuilderTray.svelte`)
The primary UI for the editor, containing:
- **Tool Palette**: Buttons for selecting terrain (Wall, Water, Grass) and actors (Start, Goal).
- **Backpack**: A visual palette to toggle which code blocks are available to the player.
  - **Block Limits**: Users can now set specific usage limits (e.g., "Max 2 Loops") for each block type, or leave them as "Unlimited".
  - **Limit Retention**: Toggling a block off and on remembers its previous limit setting.

### 4. WYSIWYG Editors & Diegetic Design
We moved away from form-based editing to in-context "What You See Is What You Get" editors, following a "Diegetic Editing" philosophy where editor controls mimic in-game UI elements:
- **BuilderStoryBar**: An overlay that mimics the game's `InstructionBar`. It allows users to edit dialogue, change speakers, and cycle emotions directly in the UI where they will appear during gameplay.
  - **Empty State**: A friendly empty state guides users to create their first story segment.
  - **Story Trigger**: A placeholder in the dashboard area provides a clear entry point to the Story Editor.
- **BuilderGoalModal**: An editable version of the level start screen. Users can click to edit the Level Name, Description, Par value, Grid Size, and Max Blocks in a modal that looks exactly like the game's start screen. This centralizes all "Level Rules" in one place.

### 5. Test Mode & Cheats
We implemented a seamless "Test Mode" that swaps the editor UI for the standard game controls (`InstructionBar`, `Tray`).
- **Mode Toggle**: A prominent button in the toolbar to switch between Edit and Test.
- **Cheats**: In Test Mode, users have access to helper tools like "Rotate Character" and "Reset Position" to facilitate debugging.

### 6. Serialization
- **Export**: Users can download their level as a JSON file.
- **Import**: Users can upload a JSON file to load a level into the editor.

## 7. UX Refinements (Direct Manipulation)
We refined the interaction model to be more tactile and less tool-dependent:
- **Toolbar Refactor**: Moved tools from a sidebar to a top toolbar for better screen real estate usage.
- **Architect Mode**: Added a dedicated set of tools visible only in "Test Mode" for quick adjustments (Rotate, Reset).
- **Direct Manipulation**: Removed "Start" and "Goal" tools from the toolbar. Instead, users can now click directly on the Robot or Star to pick them up and move them.
  - **Click-to-Move**: Click an actor to select it, then click a destination cell to move it.
  - **Click-to-Rotate**: Clicking the Robot while it is already selected rotates it 90 degrees.
  - **Rotation Handle**: A dedicated "Rotate" button appears next to the selected Robot to make the rotation feature discoverable.
  - **Visual Feedback**: Selected actors are highlighted with a distinct outline.

## Technical Decisions
- **Live Game Model**: We decided to keep a live `GameModel` instance in the `BuilderModel`. This allows the `Grid` to reuse its rendering logic without modification and enables instant preview of changes.
- **Svelte 5 Runes**: We leveraged `$state` and `$derived` extensively to manage the complex state of the editor and ensure reactivity across components.
- **Component Reuse**: We reused `Grid`, `InstructionBar`, and `Tray` from the main game, ensuring consistency and reducing code duplication.
- **In-Place Editing**: We prioritized immersion by creating editor components (`BuilderStoryBar`, `BuilderGoalModal`) that visually match their gameplay counterparts (`InstructionBar`, `GoalModal`), allowing creators to see exactly how their content will look.
- **Event-Driven Grid**: The `Grid` component was updated to emit semantic events (`onActorSelect`) rather than handling logic internally, allowing the `BuilderModel` to control the interaction flow.

## Future Work
- **LocalStorage Persistence**: Auto-saving the current draft to prevent data loss.
- **Advanced Story Features**: Highlighting UI elements during story segments.
- **Onion Skinning**: Visualizing previous paths in Test Mode.
