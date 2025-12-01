# Implementation Plan - Phase 23: Dark Mode Deep Dive

## 1. Color System Audit

- **Objective**: Ensure all semantic tokens have appropriate values for dark mode.
- **Files**: `src/app.css`
- **Tasks**:
  - Review `--surface-*` and `--text-*` tokens.
  - Check `--brand-*` colors for vibration/contrast on dark backgrounds.
  - Verify `--shadow-*` visibility or implement alternative depth cues (borders).

## 2. Component Audit & Polish

- **Objective**: Verify every major component looks good in dark mode.
- **Components**:
  - **Game**: `Grid.svelte` (cell colors), `Tray.svelte` (palette backgrounds), `InstructionBar.svelte`.
  - **Builder**: `BuilderToolbar.svelte`, `BuilderTray.svelte`, `TileEditorModal.svelte`.
  - **Common**: `Modal.svelte`, `Toast.svelte`, `Card.svelte`.
- **Tasks**:
  - Manually toggle dark mode and inspect each screen.
  - Fix any hardcoded colors that don't adapt.
  - Adjust opacity/transparency for glassmorphism effects in dark mode.

## 3. Theme Toggle Logic

- **Objective**: Ensure robust theme switching.
- **Files**: `src/lib/stores/theme.ts` (or similar), `src/routes/+layout.svelte`.
- **Tasks**:
  - Verify persistence in `localStorage`.
  - Ensure no flash of wrong theme (FOUC) on load.
  - Add a smooth transition effect for the toggle.

## 4. Visual Regression Testing

- **Objective**: Lock in the dark mode look.
- **Tasks**:
  - Add specific dark mode test cases to `e2e/visual.spec.ts`.
  - Run `test:visual` to generate baselines.
