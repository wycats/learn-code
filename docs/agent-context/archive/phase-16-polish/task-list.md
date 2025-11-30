# Phase Task List

- [x] **UI Unification**: Merge Story and Edit modes (Diagetic Axiom).
  - [x] Remove `BuilderStoryTrigger`.
  - [x] Embed `BuilderStoryBar` directly in the layout.
  - [x] Update `BuilderModel` to remove explicit `story` mode.
- [x] **Bug Fixes**:
  - [x] Fix "Select a segment" empty state appearing when segments exist.
  - [x] Fix missing IDs in legacy levels (e.g., "The Bug") causing UI issues.
  - [x] Fix Level 5 ("Stairway to the Stars") impossible geometry.
  - [x] Fix Level 7 ("Functions") "Call ???" bug (missing function name).
  - [x] Fix Level 7 UI flickering when switching between Main and Function tabs.
  - [x] Fix Level 7 incorrect hint ("You defined the function...") showing when function is already called.
  - [x] Fix execution visualization not clearing when re-entering a function (green checks persisting).
  - [x] Mark "Call" block as success immediately upon entering function.
