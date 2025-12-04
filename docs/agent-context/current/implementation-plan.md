# Phase 31: Authentication & Child Safety

**Goal:** Implement a secure, COPPA-compliant authentication system that supports the "Netflix Model" (Parent-owned account, Child profiles) and solves the Family Link constraint via QR Handshake.

## High-Level Outline

1.  **Database Schema**
    - Define tables for Users (Parents), Profiles (Children), and Device Auth.
    - Ensure cascade deletes work correctly (deleting parent deletes profiles).

2.  **Authentication Infrastructure**
    - Set up OAuth providers (Google, GitHub).
    - Implement "Sudo Mode" middleware/checks.
    - Implement QR Code generation and polling logic.

3.  **User Interface**
    - **Parent Gate**: A clear distinction between "Child Mode" and "Parent Mode".
    - **Profile Picker**: The primary entry point for children.
    - **Settings**: A protected area for managing profiles.

4.  **Integration**
    - Connect the Auth system to the existing Game/Builder state.
    - Handle offline/online transitions gracefully.
