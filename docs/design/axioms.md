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
