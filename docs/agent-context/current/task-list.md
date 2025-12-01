# Phase 23: Dark Mode Deep Dive

**Goal:** Conduct a comprehensive audit and polish of the dark mode experience to ensure visual consistency and comfort.

- [x] **Color Audit**
  - [x] Review all semantic tokens in `app.css`.
  - [x] Ensure sufficient contrast ratios for text and UI elements in dark mode.
  - [x] Check brand colors for vibrancy and readability on dark backgrounds.
- [x] **Shadows & Depth**
  - [x] Adjust shadow values (`--shadow-*`) for dark backgrounds.
  - [x] Consider using lighter borders or overlays to define depth where shadows are less visible.
- [x] **Image Assets & Icons**
  - [x] Ensure all SVG icons and illustrations work well on dark backgrounds.
  - [x] Invert or adjust colors for specific assets if necessary.
- [x] **Theme Toggle**
  - [x] Verify the theme toggle persists across sessions.
  - [x] Ensure it respects system preferences by default.
  - [x] Add a visual transition when switching themes.
- [x] **Component Audit**
  - [x] Check `Game.svelte` (Grid, Tray, InstructionBar).
  - [x] Check `Builder.svelte` (Toolbar, Palette).
  - [x] Check Modals and Overlays.
  - [x] Check Library and Home screens.
