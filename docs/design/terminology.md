# Terminology & Naming Conventions

To ensure consistency across the UI, code, and documentation, we adhere to the following naming conventions.

## Core Concepts

### Pack vs. Campaign
*   **Term**: **Pack** (or **Level Pack**)
*   **Definition**: A collection of levels created by a user or provided by the system.
*   **Usage**:
    *   **UI**: Always use "Pack" (e.g., "Create New Pack", "My Packs", "Standard Packs").
    *   **Code**: `LevelPack` is the schema name. `CampaignService` is acceptable for the service layer (historical context), but variable names should prefer `pack` or `levelPack`.
    *   **Avoid**: "Campaign" in user-facing text. "Campaign" implies a narrative progression which might not always be present. "Pack" is more neutral and flexible.

### Level vs. Puzzle
*   **Term**: **Level**
*   **Definition**: A single playable challenge.
*   **Usage**: "Level 1", "Next Level".

### Builder vs. Architect
*   **Term**: **Architect** (Persona), **Builder** (Tool)
*   **Definition**: The user creating the content is the "Architect". The tool they use is the "Level Builder" or "Pack Editor".
*   **Usage**: "Architect's Library" (The place where they manage their work). "Open in Builder".

## UI Text Standards

*   **Buttons**: Title Case (e.g., "Create New Pack", "Add Level").
*   **Headers**: Title Case (e.g., "My Packs", "Pack Settings").
*   **Labels**: Sentence Case (e.g., "Pack title", "Description").
