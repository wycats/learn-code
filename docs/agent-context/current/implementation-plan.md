# Phase 18: Visual Regression Testing - Implementation Plan

## Goal
Ensure the visual integrity of the application across updates by implementing automated visual regression testing using Playwright.

## Strategy
We will leverage Playwright's built-in visual comparison capabilities (`expect(page).toHaveScreenshot()`) to catch unintended visual changes. We will focus on high-value, stable UI states to minimize flakiness.

## Scope
1.  **Home Screen**: Verify the main menu layout, including the new "Create" entry point.
2.  **Game Interface**: Capture the standard gameplay view (Level 1), ensuring the code tray, grid, and instruction bar are rendered correctly.
3.  **Builder Interface**: Capture the initial state of the Builder, verifying the palette and grid tools.
4.  **Library/Campaigns**: Verify the display of level packs and the campaign overview.

## Technical Approach

### 1. Playwright Configuration
- Update `playwright.config.ts` to define consistent viewports for visual tests.
- Set reasonable thresholds for pixel comparison to avoid false positives from minor rendering differences.

### 2. Test Suite Structure
- Create `e2e/visual.spec.ts`.
- Use a `beforeEach` hook to ensure a clean state (clear localStorage if needed).
- Define tests for each scoped area.

### 3. Handling Dynamic Content
- **Animations**: Disable CSS animations or wait for them to finish before taking screenshots.
- **Dynamic Data**: Mock or seed data where necessary to ensure consistent screenshots (e.g., for the Library screen).

## Execution Steps
1.  **Setup**: Configure Playwright for visual testing.
2.  **Author Tests**: Write `e2e/visual.spec.ts`.
3.  **Baseline**: Run tests with `--update-snapshots` to generate initial baselines.
4.  **Verify**: Run tests again to ensure they pass against the new baselines.
5.  **CI**: Confirm CI pipeline includes these tests.
