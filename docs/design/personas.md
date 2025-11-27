# Personas

## Child Learners

### 1. The Intuitive Explorer (Pre-Literate)

**Age**: 3-4
**Description**: Comfortable with touch interfaces (tablets) but cannot read yet. They explore the world through direct manipulation and trial-and-error. They have high "Go" energy—they want to touch the blocks and see the character move immediately.
**Needs**:

- **Zero-Text Interface**: Everything must be conveyed through icons, animation, and voiceover.
- **Immediate Feedback**: Needs to see the result of an action instantly.
- **Forgiveness**: "Wrong" answers should be fun or instructive, not punishing.
- **Scaffolding**: Needs the "Stop" character to gently intervene when they are just clicking randomly.
  **Frustrations**:
- Text instructions.
- Abstract symbols without clear meaning.
- Long setup times before "playing".
  **Focus**: Audio cues, distinct visual shapes for blocks, "Stop" mode as a narrator/guide.

### 2. Zoey (The Logic Linguist)

**Age**: 4-5
**Description**: A precocious learner who is fluent in reading and eager to prove their competence. She enjoys the narrative but also wants to understand the "rules" of the system. She might get bored if the pace is set strictly for non-readers.
**Needs**:

- **Text Reinforcement**: Labels on blocks (e.g., "Hop", "Loop") to connect actions to words.
- **Narrative Depth**: Engages more deeply with the _story_ reasons for solving the problem.
- **Efficiency Challenges**: "Can you do this in fewer blocks?"
  **Frustrations**:
- Unskippable, slow voiceovers explaining things she already read.
- Repetitive tasks that feel like "baby work."
  **Focus**: Richer story integration, optional text labels, "Optimization" challenges (using the "Again" block).

### 3. Jonas (The Kinetic Architect)

**Age**: 8
**Description**: A bright, high-energy child who has seen code before (maybe Scratch or Minecraft commands) but lacks foundational discipline. He wants to feel like a "real programmer."
**Note on Neurodiversity**: The app is designed with ADHD in mind (short feedback loops, clear "Stop/Plan" transitions, engaging but not over-stimulating visuals). This benefits Jonas specifically but helps all learners.
**Needs**:

- **The "Real" Code**: A toggle to see the underlying TypeScript/JavaScript (PXT style) to validate his skills.
- **Impulse Management**: The "Stop" phase is crucial here as a mechanism to slow down and plan, not just a tutorial.
- **Short Loops**: Quick, bite-sized challenges to maintain focus.
- **Sandbox Mode**: Freedom to experiment beyond the puzzles.
  **Frustrations**:
- Slow animations he can't speed up.
- Being forced to solve a problem in only one specific way.
- "Black box" magic—he wants to know _how_ it works.
  **Focus**: PXT integration (Blocks <-> TS), "Debug" mode as a primary gameplay loop, speed controls.

---

## Co-Pilots (Facilitators)

### 4. The Novice Guide (No Coding Experience)

**Description**: A parent or teacher with no technical background. They want to help their child but are afraid of teaching the "wrong" thing or getting confused themselves.
**Needs**:

- **Jargon-Free Context**: "This level teaches 'Patterns', which is like noticing that red-blue-red-blue repeats."
- **Answer Key**: A way to see the solution if the child is stuck, without having to solve it themselves.
- **Confidence**: Reassurance that they are doing a good job facilitating.
  **Frustrations**:
- Technical error messages.
- Abstract CS terminology (e.g., "recursion", "boolean") without analogies.

### 5. Leah (The Tech-Adjacent Facilitator)

**Description**: A bootcamp grad or low-code power user (Airtable, Claude Code). She understands the logic and value of coding but isn't writing C++ compilers. She wants to ensure the app is actually teaching transferable skills, not just "games."
**Needs**:

- **Pedagogical Transparency**: Wants to see _why_ a specific mechanic was chosen (e.g., "We use 'Stop' to teach inhibition control").
- **Bridge to Reality**: Appreciates features that connect the game logic to real-world logic (e.g., "This loop is like a spreadsheet formula").
- **Progress Tracking**: Detailed stats on what concepts the child has mastered.
  **Frustrations**:
- "Black box" educational apps that feel like distractions.
- Lack of visibility into the curriculum structure.

### 6. Yehuda (The Expert Mentor)

**Description**: A professional programmer and language designer. He wants to ensure the tool builds a _correct_ mental model that won't need to be unlearned later. He is interested in the "metal" (PXT, TypeScript) and the "meta" (how the tool is built).
**Needs**:

- **Correctness**: The abstractions must be leaky in the _right_ way. No "magic" that defies actual CS principles.
- **Extensibility**: Can he write a custom block or level for Jonas?
- **Code View**: Wants to show Jonas, "See? This block is actually this code."
  **Frustrations**:
- Simplified concepts that are actually wrong (e.g., confusing loops with if-statements).
- Closed ecosystems that don't allow peeking under the hood.
