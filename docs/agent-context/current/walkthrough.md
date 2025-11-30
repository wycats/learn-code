# Phase 11 Walkthrough: The Campaign Builder

## Overview
In this phase, we implemented the "Campaign Builder," a feature that empowers users (Architects) to create, organize, and manage their own Level Packs. This moves the application from a static set of levels to a dynamic platform where users can curate their own content.

## Key Features
1.  **Architect's Library**: A new dashboard (`/builder/campaigns`) where users can view their custom packs and clone built-in templates.
2.  **Campaign Persistence**: We introduced a robust persistence layer using the Origin Private File System (OPFS) to store user campaigns locally.
3.  **Pack Editor**: A dedicated interface (`/builder/campaigns/[packId]`) for editing pack metadata (title, description, difficulty) and managing the list of levels.
4.  **Level Management**: Users can add new levels, reorder them, and delete them from their packs.
5.  **Cloning**: Users can clone existing "Standard Packs" (like "The Basics") to use as a starting point for their own creations.

## Technical Implementation
-   **`CampaignService`**: A static service class that handles all CRUD operations for campaigns, interfacing with the persistence layer.
-   **`persistence.ts`**: Updated to support `UserPack` storage using `navigator.storage.getDirectory()`.
-   **Svelte 5 Runes**: Utilized `$state` and `$derived` for reactive UI updates in the builder components.
-   **Nested Routing**: Established a clear route structure for the builder context (`/builder/campaigns/...`).

## How to Try It Out

You can verify the new functionality by following these steps in the browser:

1.  **Access the Architect's Library**
    *   Navigate to `/builder/campaigns`.
    *   **Verify**: You should see the "Architect's Library" header.
    *   **Verify**: You see two sections: "Your Packs" (initially empty or with local data) and "Standard Packs" (containing the built-in "The Basics" pack).

2.  **Create a New Pack**
    *   Click the **"Create New Pack"** button.
    *   **Verify**: A new card appears in "My Packs" with a default name (e.g., "Untitled Pack").
    *   **Verify**: You are automatically redirected to the Pack Editor for this new pack.

3.  **Edit Pack Metadata**
    *   In the Pack Editor, change the **Title** (e.g., "My First Campaign").
    *   Change the **Description**.
    *   Select a different **Difficulty** from the dropdown.
    *   **Verify**: The changes are reflected immediately in the UI.
    *   *Refresh the page*: **Verify** that your changes persist (thanks to the OPFS persistence layer).

4.  **Manage Levels**
    *   Click **"Add Level"** multiple times to create a few levels.
    *   **Verify**: New levels appear in the list.
    *   **Reorder**: Drag and drop a level to a new position. **Verify** the order updates.
    *   **Delete**: Click the trash icon on a level. **Verify** it is removed from the list.

5.  **Clone a Standard Pack**
    *   Navigate back to `/builder/campaigns`.
    *   Find "The Basics" in the "Standard Packs" section.
    *   Click the **"Clone"** button.
    *   **Verify**: A new pack appears in "Your Packs" named "Copy of The Basics".
    *   **Verify**: It contains all the levels from the original pack.

6.  **Enter Level Builder**
    *   From the Pack Editor, click the **Edit (Pencil)** icon on any level.
    *   **Verify**: You are taken to the Level Builder (`/builder/campaigns/[packId]/[levelId]`).
    *   **Verify**: The "Back to Pack" link is present in the header (if we added it to the layout, otherwise use browser back).

7.  **Grid Editing (New)**
    *   In the Level Builder, select the **Grid Tool** (Grid icon) from the toolbar.
    *   **Verify**: The grid enters "Structure Mode".
    *   **Mouse**: Hover over any cell. **Verify** that the corresponding row and column are highlighted, and "Trash" buttons appear at the Top (for columns) and Left (for rows).
    *   **Touch**: Tap any cell. **Verify** that the row/column is selected and "Trash" buttons appear.
    *   **Add**: Click the `+` buttons on the sides of the grid. **Verify** a new row/column is added.
    *   **Remove**: Click a "Trash" button. **Verify** the row/column is removed.
