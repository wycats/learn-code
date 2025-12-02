# Phase 24: Visual Polish & Coverage Implementation Plan

## Goals

The primary goal of this phase is to ensure the visual integrity of the application across all devices and themes, with a specific focus on mobile polish and comprehensive automated visual regression testing.

## Scope

### 1. Expanded Visual Coverage

We need to move beyond basic "smoke tests" for visual regression and implement a comprehensive suite that captures the application in various states.

- **Routes to Cover**:
  - Home Screen (Empty, Populated)
  - Library (Built-in Packs, Local Packs)
  - Pack Details (Level List, Difficulty Indicators)
  - Game (Start, Running, Win, Loss, Dialogue)
  - Builder (Tray, Grid, Story Editor, Function Editor)
- **Variations**:
  - Desktop (1280px) vs Mobile (375px)
  - Light Mode vs Dark Mode

### 2. Mobile Polish

Based on recent usage and visual feedback, we need to refine the mobile experience.

- **Packs Screen**: Ensure cards stack correctly and touch targets are generous.
- **Builder**: Verify the "Stacked" layout works well on small screens, especially the bottom sheet interactions.
- **Spacing**: Audit margins and padding on mobile to prevent cramping.

### 3. Argos Integration

We are using Argos CI for visual diffs. We need to ensure our Playwright setup is correctly configured to upload screenshots to Argos.

- **Configuration**: Verify `playwright.config.ts` settings.
- **CI Pipeline**: Ensure the GitHub Actions workflow includes the Argos upload step.

## Technical Approach

### Visual Testing Strategy

We will create a new test file `e2e/visual-comprehensive.spec.ts` that iterates through a defined list of scenarios.

- Use `test.step` to organize the flow.
- Use `page.evaluate` to force specific application states (e.g., unlocking all levels) to avoid needing complex UI interaction sequences for every screenshot.
- Use `argos-ci/playwright` integration if applicable, or standard Playwright snapshots.

### Mobile Polish

- Use the "Device Emulation" feature in Chrome DevTools (via Playwright or manually) to identify layout issues.
- Apply CSS fixes using standard media queries or container queries.

## Risks

- **Flakiness**: Visual tests are prone to flakiness due to animations or rendering differences. We must disable animations/transitions during tests.
- **Maintenance**: A large suite of screenshots can be a burden to maintain. We should focus on _key_ states rather than every possible permutation.
