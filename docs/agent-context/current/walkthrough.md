# Phase 2 Walkthrough: Modern CSS Foundation

## Overview

In this phase, we established the styling architecture for the application, focusing on modern CSS features (Baseline 2025) to create a robust, maintainable, and accessible design system. We implemented the "Modern Matte" aesthetic using Open Props and semantic tokens.

## Key Implementations

### 1. CSS Architecture (`src/app.css`)

We organized the global styles using CSS `@layer` to manage specificity cleanly:

- **`reset`**: Imports `open-props/style` and `open-props/normalize`.
- **`theme`**: Defines our semantic tokens.
- **`base`**: Global element styles (body, etc.).
- **`layout`** & **`components`**: Reserved for future use.

### 2. Semantic Tokens & Dark Mode

We defined a set of semantic variables in the `:root` scope using the `light-dark()` function. This allows us to handle light and dark modes in a single declaration without duplicating selectors.

- **Surfaces**: `--surface-1` to `--surface-4`.
- **Text**: `--text-1` to `--text-3`.
- **Functional Colors**: `--color-action`, `--color-movement`, `--color-logic`, `--color-loop` (mapped to Open Props).
- **Touch**: `--touch-target-min: 44px`.

We also enabled `color-scheme: light dark;` to ensure the browser renders native UI elements correctly in both modes.

### 3. Layout Primitives

We refined the existing "Every Layout" components and added a new one:

- **`Stack.svelte`**: Updated to use `gap` instead of margin hacks for better nesting support.
- **`Switch.svelte`**: A new component that switches from a vertical stack to a horizontal cluster based on available width. We used **Container Queries** (`@container`) to implement this, with preset thresholds (`xs`, `sm`, `md`, `lg`).
- **`Grid`, `Cluster`, `Center`, `Box`**: Verified and updated to use consistent props.

### 4. Design System Validation (`/design`)

We created a "Kitchen Sink" page at `src/routes/design/+page.svelte` that displays:

- Typography hierarchy.
- Color palette (Surfaces, Functional, Status).
- Layout primitives in action.
- Touch target validation.

## Decisions & Trade-offs

- **Container Queries for Switch**: We chose Container Queries over the traditional `flex-basis` hack for `Switch.svelte` because it provides more explicit control and is fully supported in our target baseline.
- **Open Props**: We stuck to Open Props for values to ensure consistency, mapping them to our semantic names.
- **Touch Targets**: We enforced a global variable `--touch-target-min` to ensure we never accidentally create inaccessible targets.

## Next Steps

With the foundation in place, we are ready to move to **Phase 3: Prototype / MVP**, where we will build the actual "Stop & Go" interface using these primitives.
