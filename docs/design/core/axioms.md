# Design Axioms (The Constitution)

These axioms guide every design decision in the project. When in doubt, refer to these principles.

## 1. Story is the Engine

Logic is the fuel, but Story is the destination.

- **Principle**: We are not teaching "loops"; we are teaching "how to make the robot dance forever."
- **Application**: Every level must have a narrative context (Intro/Outro). The "Why" must precede the "How".
- **Anti-Pattern**: Abstract puzzles with no characters or motivation.

## 2. Low Floor, High Ceiling, Wide Walls

(Inspired by Mitch Resnick/Seymour Papert)

- **Low Floor**: A 4-year-old (Zoey) must be able to play the first level without reading.
- **High Ceiling**: A 7-year-old (Jonas) should be able to build complex logic puzzles.
- **Wide Walls**: There should be many ways to succeed. Support diverse creative expressions (Storytelling, Art, Logic).

## 3. Creation is Social

Code is a medium for human connection.

- **Principle**: A creation that cannot be shared is a dead end.
- **Application**: The Builder must prioritize _sharing_ (Export, Play Link) as much as _making_.
- **Anti-Pattern**: A "Save" button that only writes to `localStorage`.

## 4. The "Mario Maker" Rule (Honesty)

The creator must prove solvability.

- **Principle**: You cannot share what you cannot solve.
- **Application**: The Builder must enforce a "Verification Run" before allowing a level to be shared.
- **Reasoning**: This prevents frustration for the player and ensures the creator understands their own logic.

## 5. Failure is Information

Errors are not punishments; they are clues.

- **Principle**: The system should never say "Wrong." It should say "Here is what happened."
- **Application**: Visual execution (stepping) is more important than the final result. Hints should be scaffolded (Nudge -> Clue -> Answer).
- **Anti-Pattern**: A red "X" with no explanation.

## 6. Tools for Thought, Not Just Tasks

The interface should help the user _think_.

- **Principle**: Offload cognitive load to the UI.
- **Application**:
  - **Zoey**: Use icons instead of text.
  - **Jonas**: Use "Ghost Blocks" to suggest patterns.
  - **Facilitator**: Show the "Solution Path" to help them guide the child.

## 7. Touch First, Mouse Second

The finger is the primary input device.

- **Principle**: If it feels clunky on an iPad, it is broken.
- **Application**:
  - Minimum touch target size: 44px.
  - No hover-dependent interactions (hover is a bonus, not a requirement).
  - Drag-and-drop must handle "fat fingers" and occlusion.
  - **Equivalence**: A mouse or keyboard should not change the interaction model. Hover effects are strictly additive (delight), never functional requirements.
- **Anti-Pattern**: Tooltips that contain critical information.

## 8. Modern Matte & Diegetic UI

The interface should feel like a physical toy, not a website.

- **Principle**: "Modern Matte" aesthetic—flat, tactile, low-glare.
- **Application**:
  - Use `Open Props` for consistent design tokens.
  - UI elements should exist "in the world" where possible (e.g., the "Guide" is a character, not a modal).
  - Motion conveys meaning (e.g., a block "snaps" into place).
- **Anti-Pattern**: Glossy "Web 2.0" buttons, system alerts, or jarring modal popups.

## 9. Zero Backend, Local First

The user owns their data.

- **Principle**: The app should be fully functional offline.
- **Application**:
  - Use `OPFS` (Origin Private File System) for persistence.
  - No required login or server round-trips for core gameplay.
  - **Distributed Ownership**: There is no "Master" device. Every device is a peer. Sync is a merge operation, not a "download".
- **Anti-Pattern**: "Loading..." spinners for local actions, or "Sign in to play".

## 10. Schema Stability (No Breaking Changes)

We respect the user's creations.

- **Principle**: An update to the app must never break an existing level or pack.
- **Application**:
  - **Backward Compatibility**: The schema parser (Zod) must always handle older versions of the data format.
  - **Migration**: If the internal model changes, we must provide a migration path (e.g., `transformV1toV2`) that runs transparently on load.
  - **Validation**: We validate inputs, but we are lenient with outputs. If a field is missing, provide a sensible default rather than crashing.
- **Anti-Pattern**: A "Corrupted Save" error after an app update.

## 11. Native Modality & Layering

We respect the browser's native layering model.

- **Principle**: Never reinvent the wheel for z-index or focus management.
- **Application**:
  - **Modals**: Always use `<dialog>`.
  - **Popovers**: Always use the `popover` attribute.
  - **Control**: Use declarative triggers (`popovertarget`, `command` invokers) wherever possible.
  - **Dismissal**: All modals must support "light dismissal" (Esc key, backdrop click) and have a visible close button unless strictly modal (e.g., critical error).
- **Anti-Pattern**: "Portal" hacks, manual z-index management, or custom overlay divs.

## 12. Unified Interaction Physics

Touch and Mouse are citizens of the same world.

- **Principle**: The interaction model is unified, not bifurcated.
- **Application**:
  - **Equivalence**: All drags work as touch moves, and vice versa.
  - **Mediation**: All drag operations are mediated through a "Move" operation.
  - **Click-Click**: Every drag operation must have a click-click equivalent. If you can drag to trash, you must be able to click to select and then click trash.
- **Anti-Pattern**: Features that only work with a specific input device.
