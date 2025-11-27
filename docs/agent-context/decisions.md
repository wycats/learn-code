# Architectural Decisions Log

## Phase 1: Foundation & Research

### 1. Pedagogy: "Stop & Go" Model
**Decision:** Adopt a strict separation between "Planning" (Stop) and "Execution" (Go) modes.
**Context:** Many coding toys (ScratchJr) allow real-time tinkering. While fun, this can lead to trial-and-error without understanding.
**Consequence:** The UI must clearly distinguish these modes. The execution engine must support a "step-by-step" visualization of the plan running.

### 2. Visual Style: "Modern Matte" & Open Props
**Decision:** Use a flat, tactile, "Modern Matte" aesthetic implemented via **Open Props**.
**Context:** We rejected the "Toy Box" (glossy, skeuomorphic) style to reduce cognitive load. We rejected Tailwind to keep markup clean and enforce a strict design system.
**Consequence:** We rely on CSS variables for all design tokens. We target **Baseline 2025** (using `light-dark()`, `@layer`, etc.) to avoid legacy hacks.

### 3. Execution Engine: Custom "Mimic" Interpreter
**Decision:** Build a custom TypeScript interpreter ("Mimic") instead of integrating Microsoft PXT immediately.
**Context:** PXT is powerful but complex to integrate and style. We need absolute control over the execution flow for the "Stop & Go" mechanics.
**Consequence:** We must maintain our own runtime. However, we will design the data structure to be compatible with PXT for potential future migration.

### 4. State Management: Svelte 5 Runes
**Decision:** Use Svelte 5 Runes (`$state`) for all game state.
**Context:** We considered XState but found it overkill for the MVP. Runes provide sufficient reactivity.
**Consequence:** We will implement "Undo" using a simple Snapshot History pattern (serializing the non-reactive state) rather than the Command Pattern.

### 5. CSS Architecture: "Every Layout" Primitives
**Decision:** Use compositional layout components (`Stack`, `Cluster`, `Grid`) instead of global layout classes.
**Context:** This keeps business logic components (like `Block` or `Character`) free of layout concerns, making them more reusable.
**Consequence:** We need to maintain a library of these primitives in `src/lib/components/layout`.

### 6. Interaction Model: Touch-First
**Decision:** Touch is the primary and required interaction model. Keyboard/Mouse are strictly enhancements.
**Context:** The target audience (3-8yo) primarily uses tablets. The interface must be fully functional and intuitive with touch alone.
**Consequence:**
- All interactive elements must have large touch targets (min 44px/48px).
- Drag-and-drop must be optimized for touch (no hover dependencies).
- "Keyboard Mode" is just the Touch UI with added shortcuts, not a separate interface.
