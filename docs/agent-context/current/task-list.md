# Phase 18: Task List

- [ ] **Configure Playwright** <!-- id: 0 -->
    - [ ] Update `playwright.config.ts` with visual testing settings (viewports, thresholds). <!-- id: 1 -->
    - [ ] Ensure `test-results` and snapshot directories are properly configured. <!-- id: 2 -->

- [ ] **Implement Visual Tests** <!-- id: 3 -->
    - [ ] Create `e2e/visual.spec.ts`. <!-- id: 4 -->
    - [ ] Implement `test('Home Screen')`. <!-- id: 5 -->
    - [ ] Implement `test('Game Interface - Level 1')`. <!-- id: 6 -->
    - [ ] Implement `test('Builder Interface')`. <!-- id: 7 -->
    - [ ] Implement `test('Library Screen')`. <!-- id: 8 -->

- [ ] **Generate Baselines** <!-- id: 9 -->
    - [ ] Run `pnpm exec playwright test --update-snapshots`. <!-- id: 10 -->
    - [ ] Verify generated screenshots look correct. <!-- id: 11 -->

- [ ] **CI Integration** <!-- id: 12 -->
    - [ ] Verify local run passes: `pnpm exec playwright test`. <!-- id: 13 -->
