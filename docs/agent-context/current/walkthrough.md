# Walkthrough: Phase 42 (Jonas' Feedback)

## Bug Fix: New Pack Loading Hang

### The Issue

Users reported that creating a new pack and level, then trying to play it via "Start Coding" -> Pack -> Level resulted in a "Loading..." hang.

### Root Cause

1.  **Pack Loading**: The `play` page (`src/routes/play/[packId]/[levelId]/+page.svelte`) was only checking `getPack(packId)`, which only returns built-in packs. It was not checking `localPacksStore` or `CampaignService` for user-created packs.
2.  **Proxy Cloning**: When cloning the level definition to avoid mutation, `structuredClone` was failing on the Svelte 5 `$state` proxy object.

### The Fix

1.  **Async Pack Loading**: Updated the `play` page to load the pack asynchronously, checking `getPack`, `localPacksStore`, and `CampaignService` in order.
2.  **Snapshot Cloning**: Used `$state.snapshot(proxy)` to unwrap the proxy before passing it to `structuredClone`.

### Verification

Added a new E2E test `e2e/play-local-pack.spec.ts` that:

1.  Creates a new pack via the Builder.
2.  Adds a level.
3.  Navigates to the Home screen.
4.  Starts the game with the new pack.
5.  Verifies the game loads successfully.

## Bug Fix: Navigation Crash (500 Error)

### The Issue

Users reported a 500 error and "Failed to fetch dynamically imported module" when navigating back from "Architect's Library" to the Home screen. This appeared to be caused by a client-side routing issue or server crash during HMR updates.

### The Fix

Updated the "Back" button in `src/routes/builder/packs/+page.svelte` and the "Exit" button in `src/routes/play/[packId]/[levelId]/+page.svelte` to use `window.location.href` instead of `goto`. This forces a full page reload, clearing any corrupted client-side state and ensuring a fresh environment.

### Verification

Added `e2e/navigation-crash.spec.ts` to verify that navigating Home -> Builder -> Home does not crash the application.

## How to Try It Out

1.  **Verify New Pack Loading**:
    - Go to "Builder Mode".
    - Click "Create New Pack".
    - Add a level (click "+", select "Empty Room").
    - Go back to the Home screen.
    - Click "Start Coding".
    - Select your new pack ("New Adventure").
    - Click the level.
    - **Verify**: The game loads and you can play.

2.  **Verify Navigation Stability**:
    - Go to "Builder Mode".
    - Click the "Back" arrow (top left).
    - **Verify**: You return to the Home screen without a crash or error in the console.
