# Phase 22: Mobile & Phone Polish

## Goal

Optimize the experience for small screens and touch interactions, ensuring the app feels native on mobile devices. **Priority is on the Game Mode experience**, with Builder Mode improvements as a secondary bonus goal.

## High-Level Outline

### 1. Game Mode Polish (Priority)

- **Objective**: Ensure the core gameplay loop is flawless on mobile.
- **Tasks**:
  - **Touch Targets**: Audit Game UI (Play/Stop, Speed, Blocks) for 44px minimum.
  - **Vertical Layout**: Verify the Instruction Bar + Grid + Tray stack fits without scrolling on small devices (e.g., iPhone SE/12).
  - **Gestures**: Implement swipe navigation for the Level Library.
  - **Modals**: Ensure Win/Loss and Settings modals are responsive.

### 2. Builder Mode Polish (Bonus)

- **Objective**: Make the Builder usable on phones for quick edits.
- **Tasks**:
  - **Layout**: Optimize the vertical stack. Consider a collapsible Tray or "Drawer" to maximize Grid space.
  - **Touch Targets**: Audit Toolbar and Tool buttons.
  - **Gestures**: Pinch-to-zoom for the Grid.

### 3. General Mobile UX

- **Objective**: System-wide mobile improvements.
- **Tasks**:
  - **Keyboard Handling**: Ensure inputs (Level Name, Story Editor) scroll into view.
  - **PWA Manifest**: Verify `display: standalone` and orientation settings.

## Success Criteria

- **Game Mode**: Fully playable on a mobile device with no layout issues or difficult touch targets.
- **Builder Mode**: Basic editing is possible on mobile (even if cramped).
- **Visual Tests**: Mobile viewport snapshots pass.
