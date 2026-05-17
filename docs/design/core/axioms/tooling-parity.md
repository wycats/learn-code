# Axiom: Tooling Parity (The Dogfood Principle)

**"If it's good enough for the user, it's good enough for us. If it's not good enough for us, it's not good enough for the user."**

## The Law

We do not build separate "Admin Tools" or "Level Editors" that are distinct from the game itself. The tools we use to create the official campaign content **MUST** be the exact same tools available to the player in "Architect Mode".

## Why?

1.  **Empathy**: By forcing ourselves to use the in-game tools, we feel the friction that users feel. If placing a tile is annoying for us, we fix it for everyone.
2.  **Power**: It guarantees that the user has the full power of the engine. There are no "magic developer-only features".
3.  **Maintainability**: We only maintain one set of UI and logic.

## Implications

- **No JSON Hacking**: We should not be hand-editing level JSON files to achieve effects that the Builder UI cannot produce.
- **The "Architect" Persona**: When we are designing levels, we are roleplaying as Jonas.
- **Feature Promotion**: If we need a feature (e.g., "Invisible Walls"), we must implement it as a first-class feature in the Builder (e.g., a "Void" tile) rather than a hack.
