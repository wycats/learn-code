```mdc
# Phase 41: Release & Deployment Task List

- [x] **Pre-flight Checks**
  - [x] Run `pnpm test` to ensure all tests pass.
  - [x] Run `pnpm check` for type safety.
  - [x] Verify `pnpm build` (already done, but good to double check if changes occur).
- [x] **In-App Changelog**
  - [x] Create `src/lib/data/changelog.ts`.
  - [x] Create `src/routes/changelog/+page.svelte`.
  - [x] Add entry point in Settings.
- [x] **Git Operations**
  - [x] Push the current branch to origin.
  - [x] Create a Pull Request (PR) to `main`.
- [ ] **Deployment**
  - [ ] Merge the PR.
  - [ ] Monitor Vercel deployment.
  - [ ] Verify the live site (Lives system, new tiles).

```
