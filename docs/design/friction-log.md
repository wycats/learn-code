# Friction Log

**Date:** [Current Date]
**Reviewer:** GitHub Copilot (Fresh Eyes)

## Overview
This document tracks friction points, bugs, and UI inconsistencies found during the "Fresh Eyes Review" of Phase 7.

## Observations

| ID | Severity | Category | Description | Proposed Fix |
|----|----------|----------|-------------|--------------|
| 1  | High     | UX       | **Error State Loop**: When execution fails (e.g., hitting a wall), the game pauses, but the "Play" button remains visible (toggling to "Stop" only if running). If the user clicks "Play" again, it resumes execution of the *same* failing block, causing an immediate fail loop. | Change "Play" to "Reset" or "Retry" when in a failed state. Or, have "Play" automatically reset if the previous run was a failure. |
| 2  | Medium   | Onboarding | **Orientation Confusion**: "Move Forward" is relative to the character's facing direction (East), but users might expect absolute movement ("Right"). | Add a visual indicator (arrow) to the "Move Forward" block showing the current direction, or emphasize orientation in the tutorial. |
| 3  | Medium   | Content  | **Text-Only Instructions**: The `InstructionBar` only supports text and emojis. Complex concepts (like loops) are hard to explain without diagrams. | Implement "Rich Media" support (images/diagrams) in the instruction schema. |
| 4  | High     | Learning | **No Feedback Loop**: If a user fails repeatedly, the game offers no assistance. | Implement the "Contextual Hint" system to detect struggle and offer help. |
| 5  | High     | Mobile   | **Fixed Layout**: The Tray is fixed at 400px width. On smaller screens (phones/small tablets), this consumes too much space or causes scrolling issues. | Implement a responsive layout (stack Stage and Tray vertically on small screens). |
| 6  | Medium   | A11y     | **Silent Updates**: Story text updates are not announced to screen readers. | Add `aria-live="polite"` to the `InstructionBar` text container. |

