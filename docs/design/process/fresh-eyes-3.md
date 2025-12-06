# Fresh Eyes Review III

**Date:** December 3, 2025
**Focus:** Authentication, Cloud Sync, and P2P Sharing

## Context

We have just completed a major infrastructure upgrade, adding user accounts, profiles, and cloud synchronization. This review aims to identify friction points in these new flows and ensure they align with our "Touch First" and "Diagetic" axioms.

## Friction Log

### Authentication & Onboarding

- [x] **Login Flow**: Is the distinction between "Parent Account" and "Child Profile" clear?
  - _Observation_: The login page clearly separates "Connect Device" (Child) and "Parent Login".
- [ ] **Profile Creation**: Is the avatar/color picker fun and easy to use?
  - _Observation_: The UI looks good, but we haven't tested the interaction yet.
- [x] **Handshake**: Is the QR code flow intuitive? What happens if the camera fails?
  - _CRITICAL_: The "Parent Dashboard" (`/profiles`) **missing the "Scan Code" button**. The instructions on the child device say "Log in and tap Scan Code", but the button doesn't exist.
  - _CRITICAL_: There is **no manual code entry**. If the camera fails, the user is stuck. The child device generates a code, but doesn't display it textually for the user to type.

### Cloud Sync

- [x] **Sync Indicators**: Are the icons (cloud, spinner) clear? Do they distract from the game?
  - _Observation_: The "Idle" state shows a grey cloud. It might be better to show nothing or a checkmark to reduce visual noise.
- [ ] **Conflict Resolution**: Does the "High Water Mark" strategy feel fair?
  - _Observation_: Conceptually sound for a single-player game.

### General Polish

- [ ] **Mobile Layout**: How do the new auth screens look on mobile?
- [ ] **Navigation**: Is it easy to get back to the game from the settings/profile screens?

## Action Items

1.  **Implement "Scan Code" Entry Point**: Add a button to the `/profiles` page (Parent Dashboard) to launch the QR scanner.
2.  **Implement Manual Handshake**:
    - Update Child View (`/login`) to display the alphanumeric code alongside the QR code.
    - Update Parent View (Scanner) to allow manual code entry.
3.  **Refine Sync Status**: Experiment with hiding the icon when idle/synced.
