# Task List: Phase 10 - The Librarian

- [x] **Data Architecture**
  - [x] Define `LevelPackSchema` in `src/lib/game/schema.ts`.
  - [x] Create `src/lib/game/packs/index.ts` registry.
  - [x] Migrate Levels 1-8 into "The Basics" pack.
  - [x] Create "The Gauntlet" pack with Level 9.

- [x] **Persistence**
  - [x] Create `src/lib/game/progress.ts`.
  - [x] Implement `saveLevelProgress` and `getPackProgress`.
  - [x] Update `GameModel` to load/save from the new service.

- [x] **UI Components**
  - [x] Create `PackCard.svelte` (Cover, Title, Progress bar).
  - [x] Create `LevelMap.svelte` (Visual path or grid of levels).
  - [x] Create `CampaignShelf.svelte` (Container for packs).

- [x] **Home Screen Overhaul**
  - [x] Refactor `src/routes/+page.svelte`.
  - [x] Implement "Continue Playing" hero section.
  - [x] Implement Campaign browsing.

- [x] **Polish**
  - [x] Add difficulty indicators to Level Cards.
  - [ ] Add "New" badges for unlocked content.

