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

## Phase 2: Modern CSS Foundation

### 7. CSS Layers for Specificity Management

**Decision:** Use CSS `@layer` (`reset`, `theme`, `base`, `layout`, `components`) to organize global styles.
**Context:** Managing CSS specificity can be difficult as the project grows. Layers provide a standard way to ensure resets and themes don't override component styles unintentionally.
**Consequence:** All global styles in `src/app.css` must be assigned to a layer.

### 8. Semantic Tokens with `light-dark()`

**Decision:** Define semantic tokens (e.g., `--surface-1`, `--text-1`) using the `light-dark()` function.
**Context:** We need to support both light and dark modes. Traditional media query approaches lead to code duplication or complex selector nesting.
**Consequence:** We can handle theme switching entirely within the CSS variable definitions, keeping the rest of the CSS theme-agnostic.

### 9. Container Queries for Layout Switching

**Decision:** Use Container Queries (`@container`) for the `Switch` component instead of the `flex-basis` hack.
**Context:** The `Switch` component needs to change layout based on available space, not viewport width. Container Queries are now Baseline 2025 and offer a more explicit and robust solution.
**Consequence:** The `Switch` component requires a wrapper with `container-type: inline-size`.

## Phase 3: Prototype / MVP

### 10. Generator Functions for Execution

**Decision:** Use JavaScript Generator Functions (`function*`) for the `Mimic` interpreter's execution loop.
**Context:** We need to pause execution between steps to allow the UI to render animations and the user to follow the logic. Callbacks or `setTimeout` chains are messy.
**Consequence:** The `runProgram` function yields control back to the UI loop after each step, allowing for clean `for await...of` consumption in the view layer.

### 11. Relative Movement Model (Logo-style)

**Decision:** Use relative movement commands (`Move Forward`, `Turn Left`, `Turn Right`) instead of absolute (`Move Up`, `Move Down`).
**Context:** This aligns with standard pedagogical progression (Logo, Bee-Bot) which emphasizes spatial reasoning and perspective taking ("body syntonicity").
**Consequence:** The `GameModel` must track `orientation` in addition to `position`.

### 12. Drag & Drop Library: `svelte-dnd-action`

**Decision:** Use `svelte-dnd-action` for the block coding interface.
**Context:** We needed a Svelte-friendly library that supports sorting and moving items between lists. While it relies on HTML5 DnD (requiring a polyfill for mobile), it offers the best developer experience for list-based interactions compared to writing raw pointer events.
**Consequence:** We accept a dependency on `svelte-dnd-action` and will need to ensure `mobile-drag-drop` polyfill is added for touch device support in later phases.
