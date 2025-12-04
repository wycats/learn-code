# Axiom 9: Zero Backend, Local First

**The user owns their data.**

## Principle

The app should be fully functional offline. We do not rent the user's creativity back to them.

## Application

- **Persistence**: Use `OPFS` (Origin Private File System) or `localStorage` for robust local saving.
- **No Login Wall**: Core gameplay and creation must work without an account.
- **Sync is Optional**: Cloud sync is a convenience feature, not a requirement.
- **Distributed Ownership**: There is no "Master" device. Every device is a peer.

## Anti-Pattern

- "Loading..." spinners for local actions.
- "Sign in to play".
- Losing data because the internet cut out.
