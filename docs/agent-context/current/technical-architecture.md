# Technical Architecture: Phase 11

## Data Storage
We will continue to use `localStorage` for this phase, but structure the data to allow for easy migration to IndexedDB or OPFS later.

### Schema Extensions
```typescript
// src/lib/game/schema.ts

// Existing
export interface LevelPack {
  id: string;
  name: string;
  description: string;
  coverImage?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  levels: LevelDefinition[]; // Or LevelReference?
}

// New: UserCampaign
// We might need to separate "Level Definition" from "Level Reference" to avoid duplicating huge level blobs in the pack definition if we want to re-use levels.
// For now, to keep it simple, we might just store the full level definitions inside the pack, OR store a list of IDs and look them up.
// Given the current "Level Builder" saves levels individually, a "Pack" should probably just be a list of Level IDs + Metadata.
```

## Component Architecture

### `PackEditor`
*   **State**: Local state for the form (title, description).
*   **Sync**: Saves to `CampaignService` on blur or explicit save.

### `LevelOrganizer`
*   **Interaction**: Uses `svelte-dnd-action` (or similar, or custom) for reordering.
*   **Visuals**: Uses `LevelMap` nodes but in a linear or grid list with "Edit" controls.

## Routing Strategy
*   **Standard Play**: `/library/[packId]` -> `/play/[packId]/[levelId]`
*   **Builder**: `/builder/campaigns/[packId]` -> (Edit Level) -> `/builder?levelId=...&returnTo=/builder/campaigns/[packId]`
    *   We need to ensure the Builder knows where to return to.
