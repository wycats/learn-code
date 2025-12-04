# Fresh Eyes Review II (Post-Phase 30)

> **Date**: December 3, 2025
> **Goal**: To review the application after the major "Builder Polish" and "Mobile" phases, identifying new friction points and validating the recent improvements.

## 1. The Mobile Architect (Jonas on a Tablet)

**Context**: Jonas is using the Builder on an iPad or a large phone.
**Key Question**: Does the new "Vertical Stack" layout actually work for complex building?

### Findings

- **Builder Toolbar**:
  - _Observation_: The toolbar uses `overflow-x: auto` and flex layout.
  - _Friction_: On small screens, the "Undo/Redo" buttons (which are critical) might be scrolled out of view if the toolbar is crowded.
  - _Friction_: The "Level Selector" (`min-width: 150px`) takes up significant space, pushing tools off-screen.
  - _Recommendation_: Move "Undo/Redo" to a fixed position (e.g., floating or always visible) or collapse the Level Selector into a smaller icon on mobile.

- **Drag and Drop**:
  - _Observation_: The side-by-side layout (Palette | Program) on mobile landscape is good.
  - _Potential Friction_: On portrait phones, the vertical space for the "Program" list might be limited if the Palette is stacked above/below.
  - _Check_: The current CSS media query stacks them vertically on mobile (`max-width: 768px`). This is correct for portrait.

## 2. The Social Sharer (Jonas & Friends)

**Context**: Jonas wants to share a level with a friend nearby.
**Key Question**: Is the P2P flow intuitive?

### Findings

- **The "Handshake"**:
  - _Observation_: The UI relies entirely on the camera (`QRScanner`).
  - _Critical Friction_: If the camera is blocked, broken, or lighting is bad, the user is stuck. There is **no manual fallback**.
  - _Recommendation_: Implement a "Manual Code" tab where the user can type the base64 string (or a shorter generated code if we implement a relay server later, but for now, maybe just copy-paste the text).

- **Offline Sharing**:
  - _Observation_: The P2P feature works offline using WebRTC data channels.
  - _Success_: This is a major win for the "playground" use case.

## 3. The Power User (The Facilitator/Teacher)

**Context**: A teacher is setting up a lesson.
**Key Question**: Can I manage multiple levels/packs efficiently?

### Findings

- **Pack Management**:
  - _Observation_: The "Link to Disk" button is always visible.
  - _Friction_: On unsupported browsers (Firefox, Safari, iOS), clicking it just shows a "Failed to link" error toast.
  - _Recommendation_: Hide the button or show a "Not Supported" tooltip on browsers without `window.showDirectoryPicker`.

## 4. Codebase & Architecture (The AI Developer)

**Context**: Reviewing the code structure after rapid feature addition.
**Key Question**: Is the code maintainable?

### Findings

- **State Management**:
  - _Observation_: `BuilderModel` is becoming a "God Class" (Grid resizing, Actor logic, History, Persistence).
  - _Risk_: Hard to test and maintain.
  - _Recommendation_: Extract `HistoryManager<T>` to handle the `pushState/undo/redo` logic generically.

- **Component Complexity**:
  - _Observation_: `Tray.svelte` handles both Game and Builder contexts well, but the `floating-toolbar` logic is getting complex with media queries.
  - _Recommendation_: Consider extracting `FloatingToolbar` into its own component.

## 5. Summary of Priorities

1.  **P2P Fallback**: Add a "Copy/Paste Code" option for sharing when cameras fail.
2.  **Mobile Toolbar**: Optimize space (collapse Level Selector).
3.  **Browser Support**: Gracefully handle File System API absence.
4.  **Refactoring**: Extract `HistoryManager` from `BuilderModel`.
