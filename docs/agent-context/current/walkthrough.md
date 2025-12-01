# Phase 23: Dark Mode Deep Dive Walkthrough

## Overview

In this phase, we are focusing on the visual refinement of the application's Dark Mode. We have implemented a robust theme switching mechanism using Svelte 5 Runes and CSS `light-dark()` function, and audited key components to ensure they render correctly in both modes.

## Key Changes

### 1. Infrastructure

- **Theme Store**: Created `src/lib/stores/theme.svelte.ts` to manage theme state ('light' | 'dark' | 'system') with persistence to `localStorage`.
- **Theme Toggle**: Created `ThemeToggle.svelte` component for easy switching.
- **CSS Variables**: Updated `src/app.css` to use `light-dark()` for all semantic tokens, ensuring automatic color switching based on the `color-scheme` property.

### 2. Component Integration

- **Landing Page**: Added `ThemeToggle` to the top-right corner.
- **Game Interface**: Added `ThemeToggle` to the header controls.
- **Builder Interface**: Added `ThemeToggle` to the toolbar.

### 3. Visual Polish

- **Tray & Palette**: Updated glassmorphism effects and button styles to use `light-dark()` for proper contrast on dark backgrounds.
- **Instruction Bar**: Fixed hardcoded white backgrounds and borders to adapt to the theme.
- **Status Panel**: Adjusted status colors (green, yellow, blue) to be less harsh in dark mode using `light-dark()`.
- **Modals**: Updated `WinModal` and `GoalModal` overlays and content to support dark mode, replacing hardcoded colors with semantic variables.
- **Library**: Refactored `PackCard` to use `light-dark()` for all 11 color themes, ensuring readability in both modes. Added `ThemeToggle` to the library header.
- **Builder Components**: Audited and fixed `TileEditorModal`, `HintEditor`, `Block`, and others. Fixed hardcoded colors and invalid RGB variable usage.
- **Assets**: Updated `Cell` glassmorphism and `Check` icons to be adaptive.

## Technical Decisions

- **`light-dark()`**: We chose to use the native CSS `light-dark()` function for color definitions. This simplifies the CSS by removing the need for complex `.dark` class selectors for every variable. The theme store simply toggles the `color-scheme` property on the root element.
- **Smart Toggle Cycle**: Implemented a "Smart Cycle" for the theme toggle (System -> Dark -> Light) to prioritize immediate visual feedback for the user.
- **Svelte 5 Runes**: Used `$state` and `$effect` in the `ThemeStore` for a modern, reactive state management approach.
