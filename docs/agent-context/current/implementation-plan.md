# Phase 2 Implementation Plan: Modern CSS Foundation

## Objective

Establish a robust, future-proof styling architecture using Baseline 2025 features. This ensures that when we build the UI in Phase 3, we have a solid, semantic design system in place.

## Technical Approach

### 1. CSS Layers & Open Props

We will use CSS `@layer` to manage specificity and organize our styles.

- `reset`: Open Props normalize.
- `theme`: Our semantic tokens (Brand, Surface, Text).
- `layout`: Global layout utilities.
- `components`: Component-specific styles (though Svelte handles scoping, this is for global component patterns).

### 2. Semantic Tokens & Dark Mode

We will define a set of semantic variables that map to Open Props values. We will use the `light-dark()` function to handle dark mode switching inline.

**Token Categories:**

- **Surface**: `surface-1` (page), `surface-2` (card/panel), `surface-3` (input/button).
- **Text**: `text-1` (headings), `text-2` (body), `text-3` (muted).
- **Brand**: `brand` (primary action), `accent` (secondary).
- **Status**: `success`, `warning`, `error`, `info`.

### 3. Layout Primitives

We will review our existing "Every Layout" components (`Stack`, `Cluster`, `Grid`, `Center`, `Box`) and ensure they are robust.

- **New Component**: `Switch.svelte`. A container that switches its children from a `Stack` (vertical) to a `Cluster` (horizontal) based on available width, using Container Queries.

## Step-by-Step Plan

1.  **Configure Global Styles**: Update `src/app.css` to use `@layer` and define the semantic tokens with `light-dark()`.
2.  **Refine Layouts**: Audit existing layout components. Implement `Switch.svelte`.
3.  **Create Kitchen Sink**: Build `src/routes/design/+page.svelte` to display all tokens and primitives.
4.  **Verify Dark Mode**: Ensure the "Modern Matte" aesthetic holds up in dark mode (adjusting shadows and surface colors as needed).
