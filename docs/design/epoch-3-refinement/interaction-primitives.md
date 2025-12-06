# Interaction Primitives Design: The "Headless" Architecture

## Core Philosophy

We are adopting a **Headless UI** approach to unify interactions across the application. The goal is to separate the _logic_ of interaction (what can move where, what is selected, what is compatible) from the _mechanics_ (drag & drop vs. click-click) and the _visuals_ (ghosts, drop indicators).

### Axioms

1.  **Lifecycle is Framework-Managed**: Any logic with a lifecycle (registration, cleanup) must be handled by framework features (Svelte Actions or Effects) to ensure RAII-style safety.
2.  **No Observers**: Communication from Manager to Component happens via direct method calls on a provided interface, or via reactive state. We do not use event listeners for internal coordination.
3.  **Unify "Move" and "Target"**: Treat moving a block and targeting a block (for hints/story) as variations of the same underlying "Selection & Compatibility" mechanism.

---

## 1. The Interaction Type System

To avoid confusion between "Block Types" and "Data Types", we distinguish between the _structural role_ and the _data domain_.

### Structural Role (`InteractionRole`)

Describes _what_ the element is in the UI hierarchy.

```typescript
export type InteractionRole =
	| 'block' // A code block (Move Forward, Loop)
	| 'value' // A raw value (Number 5, Color Red)
	| 'variable' // A reference (Held Item)
	| 'slot' // A container for a list of blocks (The "inside" of a loop)
	| 'property' // A specific field on a block (The "count" of a loop)
	| 'root'; // The main program list
```

### Data Domain (`DataType`)

Describes _compatibility_ (what fits where).

```typescript
export type DataType =
	| 'statement' // A block that performs an action (void)
	| 'integer' // A number (for loop counts)
	| 'color' // A color (for paint)
	| 'any'; // Wildcard
```

### The Node Interface

```typescript
export interface InteractionNode {
	id: string;
	role: InteractionRole; // e.g., 'property'
	dataType: DataType; // e.g., 'integer'
	data?: any; // The backing model (e.g., the Block object)
	parentId?: string;
	// For slots/containers, what type do they accept?
	accepts?: DataType[];
}
```

---

## 2. The Registry: Logical vs. Visual

To handle large programs efficiently, we separate the **Logical Index** from the **Visual Registry**.

### 1. Logical Index (The Truth)

- Built from the `GameModel`.
- Contains all potential targets (blocks, slots, properties) whether they are rendered or not.
- Used to pre-calculate `candidates` efficiently.

### 2. Visual Registry (The UI)

- Components "attach" themselves to the Logical Index when they mount.
- This allows the Manager to interact with the _specific DOM component_ (e.g., to scroll it into view or measure its position) only when needed.

---

## 3. The Component Interface (The Pragmatist's View)

Components interact with the system via a Svelte Action: `use:interactionTarget`.

### The Contract

1.  **Input**: The component provides an **Interface** to the manager (for imperative DOM operations).
2.  **Output**: The component **derives** its state from the manager (Pull model).

```typescript
// Interface provided BY the component TO the manager
interface ComponentInterface {
	highlight(style: 'ghost' | 'ring' | 'pulse'): void;
	clearHighlight(): void;
	scrollIntoView(): void;
	getBoundingRect(): DOMRect;
}

// State derived BY the component FROM the manager
type ComponentState =
	| { status: 'idle' } // Can be picked up / targeted
	| { status: 'source' } // Is currently being moved
	| { status: 'candidate'; isHovered: boolean } // Is a valid target
	| { status: 'disabled' }; // Cannot be interacted with

// Usage in Svelte
/*
<script>
    import { interactionManager } from '$lib/interactions';
    
    // Derived State (The Ember Pattern)
    let state = $derived(interactionManager.getComponentState(block.id));

    const api: ComponentInterface = {
        highlight: (style) => { ... },
        clearHighlight: () => { ... },
        // ...
    };
</script>

<div 
    use:interactionTarget={{ id: block.id, api }}
    class:ghost={state.status === 'source'}
    class:ring={state.status === 'candidate'}
>
    ...
</div>
*/
```

---

## 4. The `InteractionManager` & `InteractionSession`

The `InteractionManager` is the singleton service that vends `InteractionSession`s.

### InteractionManager

- Maintains the `LogicalIndex` (populated by GameModel).
- Handles `startSession(sourceId, mode)`.
- Returns an `InteractionSession`.
- Exposes `getComponentState(id)` for components to derive their status.

### InteractionSession

Represents a single active interaction (Move, Copy, Target).

```typescript
export class InteractionSession {
    // State
    state = $state<'active' | 'committed' | 'cancelled'>('active');
    candidates = $state<InteractionNode[]>([]);
    activeTargetId = $state<string | null>(null);

    // Actions
    hover(targetId: string | null) { ... }

    commit() {
        // 1. Update Model
        // 2. Notify UI (via state updates)
        this.state = 'committed';
    }

    cancel() {
        // 1. Revert UI (clear ghosts)
        this.state = 'cancelled';
    }
}
```

---

## 5. Reactivity Philosophy: "The Ember Pattern" in Svelte 5

We structure our application state using a pattern inspired by Ember's **Services**, **Components**, and **Modifiers**, adapted for Svelte 5's Runes system.

### 1. Service-Based Root State (The "Service")

- **Concept**: Long-lived singletons (like `InteractionManager`) hold the "Source of Truth" using `$state`. They exist independently of the UI tree.
- **Role**: They manage complex logic, data indexing, and cross-component coordination (e.g., Drag & Drop sessions).

### 2. Pull-Based Reactivity (The "Component")

- **Concept**: Components do _not_ maintain their own copy of the interaction state. Instead, they **derive** their local state from the Service using `$derived`.
- **Benefit**: This ensures the UI is always consistent with the Service without manual synchronization or event listeners.
- _Example_: `let state = $derived(interactionManager.getComponentState(block.id));`
- **Warning**: In Svelte 5, if you omit `$derived` (e.g., `let state = manager.getState()`), the value is calculated **once** at setup and never updates. Always wrap service-derived state in `$derived` to create a reactive signal.

### 3. Lifecycle via Actions (The "Modifier")

- **Concept**: We use Svelte Actions (e.g., `use:interactionTarget`) as the bridge between the DOM and the Service.
- **Role**: They handle the "Visual Registry"—registering the DOM element with the Service on mount and cleaning up on destroy (RAII pattern). This keeps the component logic pure and declarative.

### 4. The "Interface" Contract

- **Concept**: Data flows from the **Reactive Root** to the **DOM**, and actions mutate the root state from **outside the rendering flow**.
- **Mechanism**: The Action registers a `ComponentInterface` (an object with methods like `scrollIntoView` or `highlight`) with the Service. This allows the Service to command the DOM when necessary (e.g., "scroll to this block") without owning the DOM itself.
