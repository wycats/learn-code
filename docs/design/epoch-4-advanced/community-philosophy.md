# Community Philosophy: The Ceiling is Reality

**Date:** December 2025
**Phase:** 39 (Community & Sharing)

## The Core Question

As we add "Community Sharing" to Kibi, we face a choice:

1.  **The Walled Garden**: Build a custom "Kibi Cloud" where users share levels via our own API, stored in our database, accessible only through our app.
2.  **The Open Ecosystem**: Integrate with the tools real developers use—GitHub.

## The Decision: Real Tools (GitHub)

We choose **Option 2**.

### Rationale

This decision is rooted in our axioms:

1.  **Low Floor, High Ceiling (Axiom 2)**:
    - **Floor**: A user can play a level via a shared URL.
    - **Ceiling**: A user can _fork_ the game engine, add a new mechanic, and submit a Pull Request.
    - By using GitHub, the "ceiling" isn't an artificial limit we set; it's the limit of professional software engineering.

2.  **Creation is Social (Axiom 3)**:
    - Social coding _is_ Open Source.
    - We want to teach the _social mechanics_ of coding (Fork, Commit, PR, Review) just as much as the _algorithmic mechanics_ (Loop, If, Variable).

3.  **Zero Backend, Local First (Axiom 9)**:
    - If we store user levels in a proprietary database, we own them.
    - If users store levels in _their_ GitHub repo, _they_ own them. We are just a client.

4.  **Tooling Parity (Axiom 16)**:
    - We use GitHub to build Kibi.
    - Why should users use a toy version of version control?

## Implications

- **Identity**: We must treat GitHub identity as a first-class citizen.
- **Friction**: There is more friction to set up a GitHub account than a simple "Guest" account. We must mitigate this with "Guest Mode" for playing, but require "Developer Mode" (GitHub) for publishing.
- **Transparency**: All shared levels are just JSON files in a public repo. This makes them inspectable, diffable, and learnable.

## The "Contribution Flow"

This philosophy leads to a specific feature: **The Contribution Flow**.
Instead of just "Sharing" a level, users can "Contribute" a level to the official game. This introduces the concept of **Code Review** (by us, the maintainers) as a gamified mechanic. Getting your level "Merged" is the ultimate badge of honor.
