# Implementation Plan - Phase 14: Navigation & Layout Polish

**Goal:** Address high-priority friction points identified in Phase 13, focusing on navigation structure and mobile responsiveness.

## 1. Home Screen Redesign

**Objective:** Make the "Architect" mode (Campaign Builder) more accessible to users like Jonas.

- [ ] **Add "Create" Entry Point**: Add a prominent "Create" or "Build" button to the main Home Screen (`src/routes/+page.svelte`) that links directly to the Architect's Library (`/builder/campaigns`).
- [ ] **Visual Consistency**: Ensure the new button matches the "Modern Matte" aesthetic of the existing "Play" button (large touch target, consistent typography).

## 2. Responsive Layout

**Objective:** Ensure the application is usable on smaller screens (phones/small tablets) by implementing a vertical stack layout.

- [ ] **Refactor `GameLayout`**: Update the main game layout to switch from a horizontal split (Stage | Tray) to a vertical stack (Stage / Tray) on narrow viewports (e.g., `< 768px`).
- [ ] **Refactor `BuilderLayout`**: Apply similar responsive logic to the Builder interface.
- [ ] **Tray Responsiveness**: Ensure the Tray component handles reduced width gracefully (e.g., wrapping blocks or scrolling).
- [ ] **Instruction Bar**: Verify that the `InstructionBar` and `StatusPanel` adapt correctly to the vertical layout.

## 3. Builder UI Cleanup

**Objective:** Organize the crowded Builder palette to improve usability and reduce visual clutter.

- [ ] **Categorize Tools**: Group Builder tools into logical categories (e.g., "Terrain", "Actors", "Logic", "Story").
- [ ] **Implement Tabs/Accordion**: Use a tabbed interface or accordion within the `BuilderTray` to show only one category at a time.
- [ ] **Mobile Optimization**: Ensure the categorized palette works well on touch devices and doesn't require excessive scrolling.

## 4. Navigation Consistency

**Objective:** Standardize the "Back" button behavior across the application to prevent user confusion.

- [ ] **Audit Back Buttons**: Review all "Back" or "Exit" buttons in the app (Game, Builder, Library).
- [ ] **Standardize Behavior**: Ensure all back buttons navigate to the expected parent context (e.g., Level -> Pack -> Library).
- [ ] **Visual Consistency**: Use a consistent icon and placement for the back button (top-left).

## 5. Bug Fix: Story Mode Highlight

**Objective:** Fix the interaction bug where selecting a highlight target in Story Mode is difficult or impossible.

- [ ] **Fix Target Selection**: Ensure that clicking the "Target" button in the Story Editor correctly enters a "selection mode" where the next click on the grid/tray sets the target.
- [ ] **Add Visual Feedback**: Add a visual indicator (e.g., cursor change, highlight effect) when in "target selection mode".
