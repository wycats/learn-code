# Walkthrough: Phase 37 — The Lost Fleet

## Current Status

Phase 37 execute is a bounded validation-and-polish slice. The pack itself was already present before execution: `VEHICLES_PACK` existed, was exported through `PACKS`, and contained Set Sail, Island Hopping, and Row Your Boat.

## What Changed

### Pack Validation

- `validate.test.ts` now proves The Lost Fleet is registered as the `vehicles` pack.
- It asserts the three expected boat levels and their order.
- It adds a duplicate built-in level id check across registered packs.

### Set Sail Content Polish

- Set Sail's description now explicitly names `Board`.
- The first intro segment targets the boat tile.
- The second intro segment targets the `Board` block and the water crossing tile.
- The copy is now more direct: step onto the boat, then use `Board` before crossing water.

### Lost Fleet E2E Coverage

The new targeted Playwright spec covers the user-facing slice:

- Library visibility for The Lost Fleet.
- Direct routing to `/library/vehicles`.
- Pack page visibility for Set Sail, Island Hopping, and Row Your Boat.
- First level play route loading.
- Winning Set Sail with Step → Board → Step → Step.

## Validation Results So Far

- `PROTO_NODE_VERSION=24 pnpm exec vitest --run src/lib/game/packs/validate.test.ts` — passed.
- `PROTO_NODE_VERSION=24 pnpm exec vitest --run src/lib/game/packs/validate.test.ts src/lib/game/interpreter.test.ts src/lib/game/ghost-path.test.ts` — passed.
- `PROTO_NODE_VERSION=24 pnpm exec playwright test e2e/lost-fleet.spec.ts --project=chromium` — passed after one test assertion was corrected.
- `PROTO_NODE_VERSION=24 pnpm check` — passed with existing unrelated warnings.
- `PROTO_NODE_VERSION=24 pnpm lint` — passed.
- `PROTO_NODE_VERSION=24 pnpm build` — passed with existing unrelated warnings and the adapter-auto notice.
- `git diff --check` — passed.

## Playwright Startup Note

The initial targeted Playwright attempts timed out waiting for the configured web server because the production build can exceed the config's 60s startup window. Running the build step directly succeeded, and the targeted Playwright command passed normally after warm-up.

The final targeted Playwright run passed without needing any additional workaround.

## Out of Scope Preserved

- No new boat mechanics.
- No disembark rules.
- No new vehicle types.
- No builder redesign.
- No cloud/schema work.

## Manual Visual Review Checklist

- Open Library and confirm The Lost Fleet card feels visually consistent with other packs.
- Open `/library/vehicles` and confirm the three boat levels are visible in order.
- Open `/play/vehicles/level-boat-intro`, advance the story, and confirm the boat/Board highlights are clear.
- Build Step → Board → Step → Step and confirm the boat crossing is visually understandable.
- Confirm the win modal appears and no unexpected replay/progress behavior is introduced.

## Manual Visual Review Result

- Local review accepted the Lost Fleet slice as working and visually good enough for this pass.
