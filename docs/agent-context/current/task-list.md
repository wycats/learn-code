# Task List: Phase 11 - The Campaign Builder

- [ ] **Data Layer**
  - [ ] Extend `LevelPackSchema` to support user-created packs (IDs, mutable properties).
  - [ ] Create `CampaignService` (or extend `ProgressService`) to manage CRUD operations for custom packs.
  - [ ] Implement `clonePack` functionality to fork built-in campaigns.
  - [ ] Ensure custom packs are persisted to `localStorage`.

- [ ] **Architect's Library**
  - [ ] Create `src/routes/builder/campaigns/+page.svelte`.
  - [ ] Implement "My Campaigns" shelf (similar to `CampaignShelf` but with edit controls).
  - [ ] Add "Create New Campaign" button.
  - [ ] Add "Clone Existing Campaign" option.

- [ ] **Pack Editor UI**
  - [ ] Create `src/routes/builder/campaigns/[packId]/+page.svelte`.
  - [ ] Implement `PackMetadataEditor` (Title, Description, Cover Art selector).
  - [ ] Implement `LevelOrganizer` (List of levels, Drag-and-Drop reordering, Add/Remove levels).

- [ ] **Integration**
  - [ ] Add "Campaign Builder" link to the main Library or Builder landing page.
  - [ ] Allow launching the Level Builder from the Pack Editor (to edit a specific level within a pack).
  - [ ] Allow "Playtesting" a whole campaign.
