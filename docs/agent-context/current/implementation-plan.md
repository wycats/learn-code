# Phase 37: The Lost Fleet

**Goal:** Expose the hidden "Boat" mechanic to the user by creating a dedicated Level Pack and polishing the experience.

## High-Level Outline

1.  **Pack Infrastructure**
    - Create `src/lib/game/packs/vehicles.ts`.
    - Define `VEHICLES_PACK` with a "Ship" or "Water" theme.
    - Export it in `src/lib/game/packs/index.ts`.

2.  **Level Migration & Creation**
    - **Migrate**: Remove `LEVEL_BOAT_1` from `BASICS_PACK` and add it to `VEHICLES_PACK`.
    - **New Level 1**: "Set Sail" - A very simple intro where the boat is right in front of you.
    - **New Level 2**: "Island Hopping" - Using the boat to cross multiple small bodies of water.
    - **Existing Level**: "Row Your Boat" (becomes Level 3).

3.  **Visual & Audio Polish**
    - **Icons**: Ensure the "Vehicles" pack has a distinct icon (e.g., `Ship` from Lucide).
    - **Sound**: Verify the "Board" action has a sound effect (or add one).

4.  **Verification**
    - Verify the pack appears in the Library.
    - Verify the levels unlock correctly.
    - Verify the "Board" block works as expected.
