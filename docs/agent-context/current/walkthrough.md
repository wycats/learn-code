# Walkthrough: Function UX & Builder Polish (Phase 20)

## Overview

This phase focuses on refining the Builder experience and improving the UX for creating and using functions.

## Progress

- [x] **Function UX**: Improved the "Call" block to clearly show when a function is missing, empty, or valid. Added visual states for these conditions.
- [x] **Builder Polish**:
  - **Glassomorphism**: Enhanced the "Cover" tile with a glass-like effect and icon.
  - **UI Cleanup**: Removed the redundant tile dropdown from the toolbar.
  - **Loop Config**: Added a custom input field for loop counts and fixed targeting for the Infinity option.
  - **Text Updates**: Clarified button text ("Play Level").
  - **Undo/Redo**: Implemented a robust Undo/Redo system for the Level Builder, tracking state changes across terrain editing, actor movement, and configuration changes.

## Key Decisions

- **Undo/Redo Strategy**: Used a snapshot-based approach (`$state.snapshot`) to push the entire level definition onto a history stack. This ensures all state (layout, actors, settings) is captured reliably without complex delta tracking.
- **Function Block States**: Instead of just disabling the block, we added distinct visual states ("Select...", "Deleted", "No Functions") to guide the user on _why_ the block might not be working.
