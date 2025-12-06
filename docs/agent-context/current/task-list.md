# Phase 41: Release & Deployment Task List

- [ ] **Pre-flight Checks**
  - [ ] Run `pnpm test` to ensure all tests pass.
  - [ ] Run `pnpm check` for type safety.
  - [ ] Verify `pnpm build` (already done, but good to double check if changes occur).
- [ ] **In-App Changelog**
  - [ ] Create `src/lib/data/changelog.ts`.
  - [ ] Create `src/routes/changelog/+page.svelte`.
  - [ ] Add entry point in Settings.
- [ ] **Git Operations**
  - [ ] Push the current branch to origin.
  - [ ] Create a Pull Request (PR) to `main`.
- [ ] **Deployment**
  - [ ] Merge the PR.
  - [ ] Monitor Vercel deployment.
  - [ ] Verify the live site (Lives system, new tiles).
