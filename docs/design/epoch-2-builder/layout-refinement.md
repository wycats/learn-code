# Layout Refinement Strategy

## Problem Statement

The current layout stacks the Header, Stage, and Tray vertically. This causes the page to grow beyond the viewport height, requiring scrolling. For a touch-first educational tool (especially for children), the interface should ideally be "app-like" — fixed to the viewport with no global scrolling, where all interactive elements are visible and accessible.

## Constraints & Requirements

1.  **Touch-First**: Large touch targets (min 44px).
2.  **No Global Scrolling**: The main interface should fit within the viewport (100vh).
3.  **Orientation**: Primary target is Landscape (Tablet/Desktop).
4.  **Components**:
    - **Header**: Level Title, Global Controls (Undo, Redo, Play, Reset).
    - **Stage**: The 5x5 Grid. Needs to be large enough to be clear.
    - **Tray**:
      - **Palette**: Available blocks (Source).
      - **Program**: The user's code (Target). Needs to accommodate growing sequences.

## Proposed Layouts

### Option 1: The "IDE" Layout (Two-Column)

- **Header**: Top bar (slim).
- **Body**: Split vertically (e.g., 50/50 or 40/60).
  - **Left Column**: The Stage (Grid). Centered vertically.
  - **Right Column**: The Tray.
    - **Top**: Palette (Grid of available blocks).
    - **Bottom**: Program (Vertical list or wrapping grid).
- **Pros**: Efficient use of landscape space. Program can grow vertically within its own scrollable area (if absolutely needed) without pushing the Stage off-screen.
- **Cons**: Might feel "heavy" on the right side.

### Option 2: The "Studio" Layout (Bottom Bar)

- **Header**: Top bar.
- **Stage**: Centered in the remaining space.
- **Tray**: Fixed height bar at the bottom (e.g., 25% of screen).
  - **Palette**: Fixed area on the left of the bar.
  - **Program**: Horizontal scrolling area on the right.
- **Pros**: Classic "timeline" feel. Maximizes Stage visibility.
- **Cons**: Horizontal scrolling (which we want to avoid if possible, but might be necessary for long programs).

### Option 3: The "Floating" Layout

- **Stage**: Full screen background.
- **Header**: Floating controls top-right.
- **Tray**: Floating panel or drawer.
- **Pros**: Immersive.
- **Cons**: Complex to manage overlapping states.

## Recommendation: Option 1 (The "IDE" Layout)

Moving the Tray to the side allows the Program to grow vertically (which is more natural for lists) without displacing the Stage. It utilizes the width of modern screens better than a vertical stack.

### Refined "IDE" Layout Structure

```
+-------------------------------------------------------+
| Header (Title + Controls)                       [H]   |
+---------------------------+---------------------------+
|                           |  Palette (Available)      |
|                           |  [ ^ ] [ < ] [ > ] [ O ]  |
|        STAGE              |                           |
|       (Grid)              +---------------------------+
|                           |  Program (Sequence)       |
|                           |  [ ^ ]                    |
|                           |  [ ^ ]                    |
|                           |  [ < ]                    |
|                           |                           |
+---------------------------+---------------------------+
```
