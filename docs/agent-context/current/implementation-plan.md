# Phase 16: Content Expansion & Narrative Polish - Implementation Plan

## Goals
We are expanding the scope of this phase to not just polish the existing content, but to deepen the narrative experience and flesh out the "endgame" content. We will lean into the "Jonas vs. Zoey" dynamic (Architect vs. Explorer) and expand "The Gauntlet" into a proper challenge pack.

## Scope

### 1. Narrative Deepening ("Jonas & Zoey")
- **Concept**: Frame the experience as a playful dialogue between the **Architect** (Jonas, who builds the levels) and the **Explorer** (Zoey, who plays them). The **Guide** (Robot) acts as the mediator.
- **Implementation**:
  - **Guide Persona**: Update the Guide's hints and dialogue to reference "The Architect" (e.g., "The Architect put a lot of lava here!").
  - **Level Intros/Outros**: Rewrite select level descriptions to reflect this dynamic (e.g., "Jonas says this one is impossible. Prove him wrong!").
  - **"Banter" Hints**: Add specific hints that add flavor/humor to the "Gauntlet" levels.

### 2. "The Gauntlet" Expansion
- **Goal**: Turn "The Gauntlet" from a single level into a 3-level "Challenge Pack".
- **Content**:
  - **Level 9 (Existing)**: "The Gauntlet" (Ice + Lava). Refine if necessary.
  - **Level 10 (New)**: "Slippery Slopes" (Focus on Ice momentum mechanics).
  - **Level 11 (New)**: "The Floor is Lava" (Tight maneuvering around hazards).
- **Pack Config**: Ensure the `GAUNTLET_PACK` includes these new levels.

### 3. Content Audit & Polish (Levels 1-8)
- **Audit**: Playtest Levels 1-8 to ensure the difficulty curve is smooth before hitting The Gauntlet.
- **Hint Coverage**:
  - Ensure **every** level has at least one "Idle" hint.
  - Add "Anti-Pattern" hints for common mistakes in early levels.
- **Metadata**:
  - Update Level Titles and Descriptions to match the new narrative tone.
  - Assign distinct **Icons** and **Difficulty** indicators.

### 4. Feedback Mechanism
- **Implementation**:
  - Add a subtle "Feedback" button to the Home Screen / Settings.
  - Action: `mailto:feedback@wonderblocks.app` (or similar placeholder) with a pre-filled subject line.

## Proposed Workflow
1.  **Gauntlet Expansion**: Create Levels 10 and 11 using the **Builder**.
2.  **Narrative Pass**:
    - Update `messages/en.json` (or level JSONs directly) with new descriptions and dialogue.
    - Add "Banter" hints to the new levels via the **Builder**.
3.  **Audit & Polish**: Run through Levels 1-11. Fix hints and metadata.
4.  **Feedback**: Implement the mailto link.
5.  **Final Review**: "Fresh Eyes" check on the full campaign.

## Questions for User
- Does this "Jonas vs. Zoey" framing align with your vision?
- Are there specific mechanics you want to highlight in the new Gauntlet levels (e.g., more Functions, or just pure navigation challenges)?

## Final Plan Status
- **Approved by User**: Yes
- **Ready for Implementation**: Yes

