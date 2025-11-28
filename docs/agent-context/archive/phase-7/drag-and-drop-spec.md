# Drag and Drop Specification (Pragmatic DnD)

## Core Philosophy

- **Library**: `@atlaskit/pragmatic-drag-and-drop`
- **Principle**: "No Layout Shifts". The document flow should never change during a drag operation. The user should see exactly where the item will land via a visual indicator, but the surrounding blocks must remain rock steady.

## 1. Dragging from Palette

- **Visual**: Full-opacity "Real Block". It should look exactly like the block that will be created.
- **Behavior**: Cloning. The original block in the palette remains unchanged.
- **Cursor**: Standard grabbing cursor (or native drag preview).

## 2. Drop Indicators (The "Blue Line")

- **Visual**: A thin blue line (approx 2px-4px) indicating the insertion point.
- **Constraint**: **Zero Layout Shift**. The line must be rendered in a way (e.g., absolute positioning or zero-height container) that does not cause the list to grow, shrink, or jump.
- **Logic**:
  - **Between Blocks**: Appears between two existing blocks.
  - **Empty List**: Appears inside the empty container.

## 3. Nesting ("Again" Block)

- **Target Areas**:
  - **Header**: Hovering the header of a Loop block targets the _top_ of its internal list (index 0).
  - **Bottom**: Hovering the bottom area targets the _bottom_ of its internal list (index length).
  - **Middle**: Standard insertion between existing children.
- **Visual**: The blue line appears _inside_ the loop block, indented correctly.

## 4. Deletion & Toolbar

- **Structure**: A "Toolbar" area located to the left of the program stack.
- **Default State**: Hidden or collapsed? (User said "activates", implying it might appear on selection/drag).
- **Interaction 1 (Selection)**:
  - User clicks/taps a block -> Block gets a "Focus Ring".
  - Toolbar appears/activates showing a **Trash Can** icon.
  - Clicking Trash Can deletes the selected block.
- **Interaction 2 (Drag)**:
  - Dragging a block (from program) activates the Toolbar/Trash Can.
  - Dropping the block onto the Trash Can deletes it.
- **Future Proofing**: The Toolbar component should be designed to eventually hold other actions (Duplicate, Multi-select) in addition to Trash.

## 5. Technical Implementation Strategy

- **State Management**:
  - Use `monitorForElements` to track global drag state.
  - Local state for "isHovering" and "closestEdge" to render the line.
- **Components**:
  - `DraggableBlock`: Wrapper for the block content.
  - `DropIndicator`: Standalone component for the blue line.
  - `Toolbar`: New component for the side actions.
