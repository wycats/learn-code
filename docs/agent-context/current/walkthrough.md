# Walkthrough: Phase 11 - The Campaign Builder

## Overview
In this phase, we empowered the Architect (user) to create, organize, and manage their own Level Packs (Campaigns). This transforms the tool from a level editor into a full campaign authoring suite.

## Key Features

### 1. Campaign Service & Data Layer
We implemented a robust `CampaignService` backed by the Origin Private File System (OPFS) via `persistence.ts`.
- **User Packs**: Custom packs are stored locally and persist across sessions.
- **Cloning**: Users can clone built-in campaigns (like "Basics" or "The Gauntlet") to use as a starting point.
- **CRUD Operations**: Full support for Creating, Reading, Updating, and Deleting campaigns.

### 2. Architect's Library
We created a dedicated "Architect's Library" (`/builder/campaigns`) where users can manage their creations.
- **My Campaigns**: A shelf displaying all user-created packs.
- **Templates**: A section allowing users to clone built-in packs.
- **Entry Point**: Accessible via a new "Campaign Builder" button in the main Library.

### 3. Campaign Editor
We built a comprehensive editor for managing a campaign (`/builder/campaigns/[packId]`).
- **Metadata Editor**: Users can edit the Title, Description, Cover Icon, and Difficulty.
- **Level Organizer**: A list view to manage levels within the pack. Users can:
    - Add new levels.
    - Reorder levels (Up/Down).
    - Delete levels.
    - Edit specific levels (deep linking to Level Builder).
    - Playtest specific levels.

### 4. Integrated Level Builder
We integrated the existing Level Builder into the campaign workflow.
- **Contextual Editing**: The Level Builder now supports editing a specific level within a specific pack (`/builder/campaigns/[packId]/[levelId]`).
- **Seamless Navigation**: Users can easily switch between the Campaign Editor and the Level Builder.
- **Test Mode**: Users can playtest their levels directly from the editor and return to editing.

## Technical Decisions

### Async Persistence
We moved to a fully async persistence model using OPFS. This ensures that large campaigns (with many levels) don't block the main thread and allows for future expansion (e.g., exporting/importing large files).

### Deep Linking
We used a nested route structure (`/builder/campaigns/[packId]/[levelId]`) to ensure that the URL always reflects the current editing context. This allows for bookmarking and better browser history management.

### Reusable Components
We reused existing components like `PackCard` and `Grid` to maintain visual consistency and reduce code duplication. We also created new reusable components like `PackMetadataEditor` and `LevelOrganizer`.

## Future Improvements
- **Drag-and-Drop Reordering**: Currently, we use Up/Down buttons for level reordering. Implementing drag-and-drop would improve the UX for large packs.
- **Export/Import**: While we have the underlying logic, we haven't exposed a UI for exporting/importing entire campaigns as files yet.
- **Custom Cover Art**: Currently limited to a set of icons. Allowing custom image uploads would be a nice touch.

