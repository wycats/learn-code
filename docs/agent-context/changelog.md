# Changelog

## Phase 1: Foundation & Research (Completed)

**Date:** [Current Date]

**Summary:**
Established the pedagogical and technical foundation for "Wonderblocks". Defined the core "Stop & Go" mechanics, researched prior art (Cubetto, ScratchJr), and established the "Modern Matte" visual style. Set up the SvelteKit project structure with Open Props for styling and a custom "Mimic" interpreter architecture.

**Key Deliverables:**

- `docs/design/mechanics.md`: Core game mechanics definition.
- `docs/design/visual-style.md`: Visual design system (Modern Matte).
- `docs/design/personas.md`: User personas (Zoey, Jonas).
- `docs/agent-context/current/technical-architecture.md`: Technical stack and architecture.
- Project Skeleton: SvelteKit app with Open Props and "Every Layout" primitives.

## Phase 2: Modern CSS Foundation (Completed)

**Date:** November 27, 2025

**Summary:**
Established a robust, future-proof styling architecture using Baseline 2025 features. Implemented the "Modern Matte" aesthetic using Open Props and semantic tokens with `light-dark()` for native dark mode support. Refined layout primitives and created a "Kitchen Sink" page to validate the design system.

**Key Deliverables:**

- `src/app.css`: Global styles with `@layer`, semantic tokens, and `light-dark()`.
- `src/lib/components/layout/Switch.svelte`: New layout primitive using Container Queries.
- `src/routes/design/+page.svelte`: Kitchen Sink / Style Guide page.
- Refined `Stack`, `Grid`, `Cluster`, `Center`, `Box` components.

## Phase 3: Prototype / MVP (Completed)

**Date:** November 27, 2025

**Summary:**
Built the functional "unplugged-digital" prototype implementing the core "Stop & Go" mechanics. Developed the `GameModel` using Svelte 5 Runes, the `Mimic` interpreter using generator functions for step-by-step execution, and a touch-friendly drag-and-drop interface using `svelte-dnd-action`. Created the first level "Cross the River" to validate the end-to-end loop.

**Key Deliverables:**

- `src/lib/game/model.svelte.ts`: Reactive game state with Undo/Redo.
- `src/lib/game/mimic.ts`: Generator-based execution engine.
- `src/lib/components/game/Tray.svelte`: Drag-and-drop block coding interface.
- `src/lib/components/game/Grid.svelte`: 5x5 Game Stage.
- `src/routes/game/+page.svelte`: Integrated game prototype.
- `src/lib/game/levels.ts`: Level 1 definition.
