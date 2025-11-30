# Phase 18: Visual Regression Testing - Walkthrough

## Overview
This phase focuses on adding a safety net for UI changes by implementing automated visual regression tests. We are treating this as a "Design Review" tool, allowing us to catch unintended changes and explicitly approve intended ones.

## Workflow: Design Review

We have established a workflow for reviewing visual changes:

1.  **Run Tests**: `pnpm test:visual`
    - This runs the visual regression tests.
    - If there are no changes, it passes.
    - If there are changes (regressions or intended updates), it fails.
    - It does **not** automatically open the report (preventing the "stuck server" issue).

2.  **Review Changes**: `pnpm test:visual:review`
    - This opens the Playwright HTML report.
    - You can inspect the diffs, seeing "Actual", "Expected", and "Diff" views.
    - Use this to verify if the changes are bugs (fix the code) or intended design updates (approve them).

3.  **Approve Changes**: `pnpm test:visual:approve`
    - If the changes are intended, run this command.
    - It re-runs the tests with `--update-snapshots`, updating the baseline images.

## Progress Log

### Initial Setup
- Created implementation plan and task list.
- Configured Playwright in `playwright.config.ts`.
    - Set `reporter: [['html', { open: 'never' }]]` to prevent blocking.
    - Added mobile viewports.
- Added NPM scripts for the workflow:
    - `test:visual`
    - `test:visual:review`
    - `test:visual:approve`

### Test Implementation
- Created `e2e/visual.spec.ts`.
- Scoped tests for:
    - Home Screen
    - Library Screen
    - Game Interface (Level 1)
    - Builder Interface
- Fixed issues with selectors and URLs (e.g., using `/play/basics/level-1` instead of `campaign-1`).

### Next Steps
- Run the approval command to generate the initial baselines.
- Verify the baselines look correct.
