# Walkthrough: The Architect's Polish (Phase 19)

## Overview

This phase focuses on refining the Builder and Game experience based on feedback from Jonas. We are addressing visual polish, usability issues in the Builder, and expanding the content.

## Progress

- [x] **Visual Polish**
  - Updated "Clear Blocks" icon to Broom (via `@lucide/lab`).
  - Improved "Call ???" block empty state with distinct styling.
- [x] **Builder Enhancements**
  - Implemented Story Segment reordering using Drag & Drop and "Ghost" move system.
  - Refined Move mechanics: "Move" button now toggles the timeline view and highlights the active segment.
  - Enabled targeting of specific block properties (Repeat Count, Function Name) for tutorials.
  - Polished Builder Toolbar to show active tile preview.
- [x] **Content Polish**
  - Polished "Gauntlet" pack levels with improved narrative.
  - Created "The Void" (Hard) pack with 3 new levels featuring a purple "glitch" theme.
  - Updated "Architect's Library" back button to use SVG arrow.

## Key Decisions

- **Targeting Granularity**: We decided to allow targeting specific parts of a block (like the loop count badge) by threading an `onTarget` callback down the component tree. This allows the tutorial system to be very specific about what the user should click.
- **Icon Selection**: We installed `@lucide/lab` to access the `Broom` icon as requested, replacing the temporary `Eraser`.
- **Story Reordering**: Adopted the "Ghost" move system (click-click) and Drag & Drop for story segments to match the interaction model of the program builder.

## How to Try It Out

1.  **Story Reordering**:
    - Go to **Architect's Library** -> **Create New Pack** -> **Edit Level**.
    - Open the **Story Editor** (Book icon).
    - Add multiple segments to the Intro or Outro.
    - Click the **Move** button (crossed arrows) on a segment.
    - Observe the timeline list opening and the active segment highlighting.
    - Click another segment to see "Ghost" targets, or drag and drop segments to reorder.

2.  **Gauntlet & Hard Packs**:
    - Go to **Architect's Library**.
    - Clone "The Gauntlet" or "The Void" pack.
    - Play through the levels to see the new narrative and "glitch" theme (Level 12-14).

3.  **Visual Polish**:
    - In the Game view, check the "Clear Program" button (Broom icon).
    - Drag a "Call Function" block without selecting a function to see the improved empty state.
