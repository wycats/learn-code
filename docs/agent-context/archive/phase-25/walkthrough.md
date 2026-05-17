# Walkthrough - Phase 25: Variables & Memory ("The Thought Bubble")

## Overview

This phase introduces the concept of **Variables** using a physical "Thought Bubble" metaphor. The character can pick up items (Keys, Numbers) and hold them in a visible bubble. These held items can then be used as parameters in blocks (e.g., "Jump (Bubble) times").

## Changes

### Schema & State

- **`HeldItem`**: Defined a schema for items that can be held (type, value, icon).
- **`VariableRef`**: Added a schema for referencing the held item in block parameters (`{ type: 'variable', variableId: 'heldItem' }`).
- **`GameModel`**: Added `heldItem` state (using Svelte 5 runes) to track the currently held object.
- **`Block`**: Updated block schema to allow `count` to be a `VariableRef`.

### Core Engine

- **`pick-up` Block**: Implemented the logic to remove an item from the grid and place it in the character's `heldItem` state.
- **Variable Resolution**: Added `resolveValue` helper in `mimic.ts` to dynamically swap `VariableRef` for the actual held value during execution.
- **Interpreter**: Updated `StackInterpreter` to support the new block and variable resolution.

### UI & Visualization

- **`ThoughtBubble.svelte`**: Created a new component that floats above the character, displaying the currently held item.
- **`Grid.svelte`**: Updated to render the `ThoughtBubble` and pass item data to cells.
- **`Cell.svelte`**: Updated to display collectible items (keys, numbers) on the grid.
- **`BuilderTray.svelte`**: Added a draggable "Held Item" token representing the variable.
- **`Block.svelte`**: Updated to accept the "Held Item" token as a drop target for parameters (e.g., Loop count).

### Content

- **"Keeper of Keys" Pack**: Created a new level pack focused on variables.
- **Level 1**: "The Number Key" - A simple level where the player must pick up a number to determine the loop count.

### Verification

- **Unit Tests**: Added `variables.spec.ts` to verify the full execution flow: Move -> Pick Up -> Loop (Variable) -> Move.
