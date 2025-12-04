# Fresh Eyes Review (Phase 13)

> **Date**: November 29, 2025
> **Goal**: To review the current application state through the lens of our enriched personas, identifying friction points and opportunities for improvement.

## 1. The Intuitive Explorer (Pre-Literate, Age 3-4)

**Mindset**: "I want to touch it. I want to see it move. I don't want to wait."
**Key Question**: Can I play the game without reading a single word?

### Findings

1.  **Home Screen (`/`)**:
    - **Good**: The "Start Coding" button has a clear arrow icon (`ArrowRight`).
    - **Friction**: The text "Start Coding" is the primary affordance. A non-reader might just click the big colored blob, which works, but the "Code" icon (`<Code />`) is abstract.
    - **Opportunity**: Make the "Play" button pulsate or be significantly larger/more "toy-like".

2.  **Level 1 (`/play/...`)**:
    - **Good**: The goal (Zoey -> Goal) is visually distinct.
    - **Friction**: The intro sequence relies on text bubbles ("Hi! I'm Zoey..."). While there is an emotion icon, the _instruction_ ("Use the 'Move Forward' block") is buried in text.
    - **Critical**: If the child ignores the text, they might just stare at the screen. The `highlight` in `intro-3` helps, but it only triggers after the text is displayed.
    - **Opportunity**: Voiceover is essential here. Without it, this is a wall of text.

3.  **Builder Library (`/builder/packs`)**:
    - **Friction**: "Architect's Library", "My Packs", "Built-in Packs" - this is a text-heavy dashboard.
    - **Trap**: The "Clone" overlay requires hovering (`.template-card:hover .clone-overlay`). Touch devices (tablets) don't hover well. A child tapping a card might get confused if nothing happens or if it just highlights.
    - **Good**: The "Create New Pack" button has a `+` icon.

### Recommendations for Intuitive Explorer

- **Home**: Add a "Play" symbol (triangle) to the main CTA.
- **Level 1**: Ensure the "Guide" character points physically to the tray, not just highlights it.
- **Builder**: This area is currently unsafe for non-readers. It needs a "Junior Mode" or just better iconography.

## 2. Zoey (The Logic Linguist)

**Profile**: 4-5 years old. Early reader. Loves stories, characters, and "why".
**Goal**: To engage with the narrative and express creativity.

### 2.1. The "Boring" Guide

- **Observation**: In Level 1, the Guide says: "Greetings. I am the Guide. I will assist you in constructing a program."
- **Friction**: This is robotic and cold. Zoey tunes out. She wants to know _why_ she is crossing the river. Is there a dragon? A picnic?
- **Impact**: The "Story" feels like a wrapper for homework, not an adventure.
- **Recommendation**:
  - Give the Guide a personality (or replace with a character).
  - Give the objective a _narrative reason_ (e.g., "The bridge is broken, but we can hop on these stones to get to the party!").

### 2.2. The "Writer's Block" (Builder)

- **Observation**: The Story Editor in the Builder relies entirely on a `<textarea>` for dialogue.
- **Friction**: Zoey has a great story in her head ("The robot is sad because he lost his balloon"), but she cannot type it. She gets frustrated and asks her parent to type everything.
- **Impact**: She feels dependent, not like a creator.
- **Recommendation**:
  - **Voice Recording**: Allow recording short audio clips for dialogue.
  - **Picture Stories**: Allow using icons/stickers in the speech bubble instead of just text.
  - **Mad Libs**: "I am [Happy/Sad] because [Balloon/Cookie] is [Gone/Here]."

### 2.3. The "Cliffhanger" Ending

- **Observation**: Level 1 has no `outro`. When she wins, she gets a generic "Level Complete!" popup.
- **Friction**: "But what happened? Did she get to the other side?" The narrative arc is cut off.
- **Impact**: The reward is extrinsic (stars/points) rather than intrinsic (story resolution).
- **Recommendation**:
  - Ensure all built-in levels have an `outro` that resolves the micro-story.
  - The Win Modal should reflect the story success ("You made it to the party!"), not just the logic success.

---

## 3. Jonas (The Social Architect)

**Profile**: 6-7 years old. Competent player. Wants to _make_ and _share_.
**Goal**: To build cool stuff and show his friends/parents.

### 3.1. The "Lonely" Builder

- **Observation**: The Builder has a "Save" button, but no "Share" or "Publish" button.
- **Friction**: Jonas builds a cool level. He yells "Mom, look!" (which works), but he can't send it to his friend at school.
- **Impact**: The "Social" motivation is blocked. He gets bored because he has no audience.
- **Recommendation**:
  - **Export to File/Code**: Allow exporting a level as a small JSON string or code that can be pasted.
  - **"Play Mode" URL**: Generate a URL that opens the level directly in "Play Mode" (no builder UI).

### 3.2. The "Landscaper" Problem

- **Observation**: The Builder tools are mostly terrain (Grass, Wall, Water).
- **Friction**: Jonas wants to make a _hard_ level. He wants keys, doors, spikes, and teleporters. He can only make mazes.
- **Impact**: He hits the creative ceiling in 10 minutes. "Is that it?"
- **Recommendation**:
  - **Gadgets**: Add interactive elements (Keys/Doors are essential).
  - **Logic Blocks**: Add "If" tiles (e.g., "If you step here, this door opens").

### 3.3. The "Boring" Menu

- **Observation**: Level selection in the Builder is a standard HTML `<select>` dropdown.
- **Friction**: It feels like a spreadsheet. Jonas wants to see his levels as _worlds_.
- **Impact**: Low emotional connection to his creations.
- **Recommendation**:
  - **Visual Level Select**: A grid of thumbnails for his levels.
  - **World Map**: Let him place his levels on a map (Mario Maker style).

---

## 4. The Facilitator (Teacher/Parent)

**Profile**: Adult. Wants educational value. Wants to verify solvability.
**Goal**: To ensure the child is learning and not getting stuck on broken levels.

### 4.1. The "Impossible Level" Problem

- **Observation**: There is no validation that a user-created level is solvable.
- **Friction**: Jonas creates a level with no path to the goal. Zoey tries to play it and fails repeatedly. She thinks she is "bad at coding," but the level is actually broken.
- **Impact**: Loss of confidence for the player. Frustration for the parent who can't solve it either.
- **Recommendation**:
  - **The "Mario Maker" Rule**: The creator _must_ solve the level themselves before they can "Save" or "Share" it.
  - **Auto-Solver**: Implement a simple pathfinding algorithm (A\*) in the Builder to warn the creator if the goal is unreachable.

### 4.2. The "Blind Leading the Blind"

- **Observation**: When a child is stuck, the parent often doesn't know the answer either (especially with loops/functions later on).
- **Friction**: The parent tries to help, gets frustrated, and says "Let's do something else."
- **Impact**: The learning journey ends prematurely.
- **Recommendation**:
  - **Solution Key**: A "Parent Mode" that reveals the optimal solution code.
  - **Pedagogical Tips**: Context-sensitive advice for the parent. "If they are stuck here, ask them to trace the path with their finger first."

### 4.3. Reactive vs. Proactive Hints

- **Observation**: The current hint system (`analysis.ts`) detects mistakes _after_ they happen (e.g., "redundant-turn").
- **Friction**: It waits for failure.
- **Impact**: The child can flail for a long time before the system helps.
- **Recommendation**:
  - **Visual Scaffolding**: If the user drags 4 "Move" blocks, _immediately_ highlight them and suggest a Loop, rather than waiting for them to run the code.
  - **Ghost Blocks**: Show a "Ghost" of the next logical block if the user idles for too long (optional/adaptive).

---

## 5. Summary of Priorities

1.  **Narrative Injection**: Zoey needs a reason to care. (Fix Level 1 Intro).
2.  **Social Sharing**: Jonas needs to show off. (Add "Play URL" or "Export").
3.  **Solvability Check**: The Facilitator needs to know it's fair. (Add "Verify" step).
