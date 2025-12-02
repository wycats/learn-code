# Phase 24 Task List

## Visual Regression Suite

- [x] **Scaffold Test Suite**: Create `e2e/visual-comprehensive.spec.ts`.
- [x] **Home & Library**: Implement tests for Home and Library screens (Desktop/Mobile, Light/Dark).
- [x] **Game Interface**: Implement tests for the Game UI in various states (Start, Win, Dialogue).
- [x] **Builder Interface**: Implement tests for the Builder UI (Tray, Grid, Bottom Sheets).
- [ ] **CI Integration**: Verify Argos upload in GitHub Actions.

## Mobile Polish

- [x] **Packs Screen Audit**: Review and fix layout issues on mobile (375px).
- [x] **Builder Layout Audit**: Review and fix stacking/spacing issues in the Builder on mobile.
- [x] **General Spacing**: Audit global margins/padding for mobile.

## Schema Stability (Ad-hoc)

- [x] **Fixture Generation**: Create `src/fixtures/levels/v1` and generate initial snapshots.
- [x] **Compatibility Test**: Implement `schema-compat.test.ts` to validate fixtures.
- [x] **Comprehensive Fixture**: Create a synthetic fixture covering all schema features.
