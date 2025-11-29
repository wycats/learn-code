# Implementation Plan - Phase 10: The Librarian

**Goal:** Organize content into cohesive collections and improve the discovery experience.
**Success Criteria:** A redesigned Home Screen displaying distinct "Campaigns" (e.g., "The Basics", "The Gauntlet") and a robust system for saving/loading user progress across these packs.

## 1. Data Architecture (Level Packs)

We need to move from a flat list of levels to a hierarchical structure.

- [ ] **Schema Update**:
  - [ ] Define `LevelPackSchema`:
    - `id`: string
    - `title`: string
    - `description`: string
    - `coverImage`: string (icon/color)
    - `levels`: LevelDefinition[] (or IDs)
    - `difficulty`: 'beginner' | 'intermediate' | 'advanced'
    - `tags`: string[]
  - [ ] Update `UserProgressSchema` to track progress *per pack*.

- [ ] **Content Organization**:
  - [ ] Create `src/lib/game/packs/basics.ts` (Levels 1-8).
  - [ ] Create `src/lib/game/packs/gauntlet.ts` (Level 9 + new variations).
  - [ ] Create a `PackRegistry` to manage available content.

## 2. Persistence Layer (The Bookshelf)

Upgrade our storage to handle more complex data.

- [ ] **Storage Service**:
  - [ ] Abstract `localStorage` calls into a `PersistenceService`.
  - [ ] Implement `saveProgress(packId, levelId, result)`.
  - [ ] Implement `getProgress(packId)`.
  - [ ] (Optional) Prepare for IndexedDB if data size warrants it, but `localStorage` is likely fine for metadata.

## 3. UI Redesign (The Library)

Replace the simple list on the Home Page with a rich, card-based interface.

- [ ] **Home Page (`src/routes/+page.svelte`)**:
  - [ ] **Hero Section**: "Continue Playing" (most recent level).
  - [ ] **Campaign Shelf**: Horizontal scroll or grid of "Official Campaigns".
  - [ ] **Community Shelf**: (Placeholder) for user-generated content.
  - [ ] **Builder Entry**: Distinct card/button to enter the Level Builder.

- [ ] **Pack Detail View**:
  - [ ] When clicking a pack, show a "Map" or list of levels within it.
  - [ ] Visual progress indicators (stars/checks) for each level.

## 4. Metadata & Polish

- [ ] **Level Metadata**:
  - [ ] Add `difficulty` rating to `LevelDefinition`.
  - [ ] Add `estimatedTime` to `LevelDefinition`.
- [ ] **Visuals**:
  - [ ] Create distinct icons/colors for the "Basics" vs "Gauntlet" packs.

## Execution Order

1.  **Data**: Define the `LevelPack` schema and migrate existing levels into the "Basics" pack.
2.  **Persistence**: Refactor the storage layer to support packs.
3.  **UI**: Build the new Home Screen components (`PackCard`, `LevelGrid`).
4.  **Integration**: Wire it all together.
