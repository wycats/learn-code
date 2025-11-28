# Ideas for Future Work

- [ ] **Level Builder**: A mode where users can design their own levels, place walls, goals, and define available blocks.
- [ ] **Variables & Scoping**: Introduce variables using a "box" metaphor.
  - **Lexical Scoping**: Avoid global variables. Variables should be scoped to the block/container they are defined in (the "box").
  - **Visual Representation**: The UI should visually reinforce scoping (e.g., variables defined inside a loop or function are only visible/accessible within that visual container).
  - **Philosophy**: Even young children can understand that if you put something in a box, it's in _that_ box. We should lean into this physical intuition rather than the "magic global state" often found in block-based languages.

## Technical Architecture

- **PXT / MakeCode Integration**: Use Microsoft's PXT (Programming Experience Toolkit) as the underlying engine. This would allow us to support the "Kinetic Architect" persona by providing a robust Blocks-to-TypeScript bridge out of the box. It handles the AST, block rendering, and compilation.
