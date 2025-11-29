# Implementation Plan: Phase 11 - The Campaign Builder

## Goal
Empower the Architect (user) to create, organize, and manage their own Level Packs (Campaigns) using a high-quality, diagetic interface that mirrors the game's Library.

## User Experience
1.  **Entry Point**: From the main Library or a dedicated "Architect Mode" toggle, the user accesses "My Campaigns".
2.  **Management**: The user sees a shelf of their custom packs. They can create a new one or edit an existing one.
3.  **Editing**:
    *   **Metadata**: Clicking a pack opens the Editor. The user can set the Title, Description, and choose a Cover Icon (using the same visual style as the `PackCard`).
    *   **Content**: The user sees a list of levels in the pack. They can:
        *   Create a new level (launches Level Builder).
        *   Import an existing level (from their local storage).
        *   Reorder levels (Drag & Drop).
        *   Remove levels.
    *   **Cloning**: The user can clone any built-in campaign to use as a starting point for their own pack.
4.  **Play**: The user can play their own campaign just like a built-in one.

## Technical Architecture

### Data Model
*   **`UserPack`**: Extends `LevelPack` but stored in `localStorage`.
*   **`CampaignService`**: A new service (or extension of `ProgressService`) to handle:
    *   `createPack()`
    *   `clonePack(sourcePackId)`
    *   `updatePack(id, data)`
    *   `deletePack(id)`
    *   `addLevelToPack(packId, levelId)`
    *   `reorderLevels(packId, newOrder)`

### UI Components
*   **`PackEditorLayout`**: A split view or focused view for editing pack details.
*   **`LevelList`**: A sortable list component for the levels within a pack.
*   **`CoverSelector`**: A component to choose the visual theme/icon for the pack.

### Routing
*   `/builder/campaigns`: List of user campaigns.
*   `/builder/campaigns/[packId]`: Editor for a specific campaign.
*   `/builder/campaigns/[packId]/[levelId]`: Deep link to edit a specific level within a campaign context.

## Step-by-Step Implementation

1.  **Service Layer**: Implement `CampaignService` and update schemas.
2.  **Library View**: Build the "My Campaigns" page.
3.  **Editor View**: Build the Pack Editor (Metadata + Level List).
4.  **Integration**: Connect the Level Builder to the Campaign flow.
