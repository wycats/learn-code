# Phase 7 Task List: Tutorial System Expansion

## 1. Preparation & Quick Fixes
- [x] **Fresh Eyes Review**: Review the application as a new user. Note friction points, visual inconsistencies, and bugs.
- [x] **Fix Error State Loop**: Ensure "Play" button resets or handles failure state gracefully.
- [x] **Fix A11y**: Add `aria-live` to `InstructionBar`.
- [x] **Refinement Plan**: Create a list of immediate fixes based on the review.

## 2. Tutorial Engine
- [x] **Hint System**: Implement logic to detect "struggle" (e.g., 3 failed attempts, 30s idle).
- [x] **Hint UI**: Design and implement the UI for displaying hints (subtle nudge vs. explicit help).

## 3. Content Enhancement
- [x] **Rich Media Support**: Update `InstructionBar` to render images/diagrams.
- [x] **Guide Character**: Design and implement the "Guide" (visuals + dialogue integration).

## 4. Integration
- [x] **Level Updates**: Update existing levels to use the new Guide and Hint systems.
