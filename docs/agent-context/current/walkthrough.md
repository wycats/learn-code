# Phase 1 Walkthrough: Foundation & Research

## Overview

This phase focused on grounding the project in solid pedagogical theory and establishing a robust technical and visual foundation. We moved from a vague idea to a concrete plan for a "Digital Montessori" coding tool.

## Key Decisions

### 1. Pedagogy: "Stop & Go"

We adopted the "Stop & Go" model (Planning vs. Execution) to encourage reflective thinking. This distinguishes Wonderblocks from "tinkering" tools like ScratchJr, where planning and execution often blur.

### 2. Visual Style: "Modern Matte"

We rejected the "Toy Box" aesthetic (skeuomorphic, glossy) in favor of "Modern Matte" (flat, tactile, calming). This aligns with the "Digital Montessori" philosophy—respecting the child's intelligence and reducing cognitive load.

- **Tooling**: We chose **Open Props** over Tailwind to enforce a consistent design system (spacing, colors, shadows) without the visual noise of utility classes in markup.

### 3. Architecture: Custom "Mimic" Interpreter

We decided to build a custom interpreter ("Mimic") rather than integrating PXT immediately.

- **Reasoning**: PXT is powerful but complex. For the MVP, we need full control over the execution flow to support the "Stop & Go" mechanics and step-by-step visualization.
- **Future-Proofing**: The data structure will be kept compatible with PXT for potential future migration.

### 4. State Management: Runes

We chose Svelte 5 Runes (`$state`) for state management. This provides a simple, reactive data model that is easy to reason about and debug.

## Implementation Details

### Project Structure

- Standard SvelteKit layout.
- `src/lib/game/`: Core game logic (types, model).
- `src/levels/`: Level definitions (TypeScript-as-Data).
- `src/lib/components/layout/`: "Every Layout" primitives (`Stack`, `Cluster`, `Grid`, `Center`, `Box`).

### CSS Architecture

- **Open Props**: Imported in `src/app.css`.
- **Scoped Styles**: Component-specific styles using Svelte's built-in scoping.
- **Layout Primitives**: Compositional components to handle layout, keeping business logic components free of layout concerns.
