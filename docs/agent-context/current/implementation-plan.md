# Phase 30.5: Fresh Eyes Polish

**Goal:** Address the friction points identified in the "Fresh Eyes Review II" and user feedback, focusing on mobile ergonomics, P2P sharing fallback, and code maintainability.

## High-Level Outline

1.  **Refactoring: HistoryManager**
    - Extract the Undo/Redo logic from `BuilderModel` into a generic `HistoryManager<T>` class.
    - Add comprehensive unit tests for the new class.
    - Integrate it back into `BuilderModel`.

2.  **Mobile Polish: Toolbar**
    - **Level Selector**: Hide the level selector on mobile devices to save space. Users can switch levels via the Pack Manager or by going back.
    - **Save/Link Buttons**: Hide the "Link to Disk" button on browsers that don't support the File System Access API.

3.  **P2P Polish: Manual Fallback**
    - Add a "Show Code" option to the P2P modal.
    - This should be a subtle/premium UI (not a big tab) that reveals the connection string for manual copying/pasting if the camera fails.

4.  **Code Cleanup**
    - Look for other opportunities to reduce complexity in `BuilderModel` or `Tray`.
