# Task List: Phase 37 — The Lost Fleet

## Execute Slice

- [x] Confirm Phase 37 is already partially implemented.
- [x] Keep scope to validation, polish, and visibility.
- [x] Leave untracked `.logs/`, `.vscode/settings.json`, and `locald.toml` untouched.

## Pack and Content Assertions

- [x] Assert The Lost Fleet / `VEHICLES_PACK` is registered in `PACKS`.
- [x] Assert the vehicles pack has exactly 3 levels.
- [x] Assert the level names are Set Sail, Island Hopping, and Row Your Boat.
- [x] Assert built-in level ids are unique across registered packs.

## E2E Coverage

- [x] Add targeted Lost Fleet Playwright spec.
- [x] Prove The Lost Fleet appears in Library.
- [x] Prove `/library/vehicles` loads.
- [x] Prove Set Sail, Island Hopping, and Row Your Boat appear.
- [x] Prove first Lost Fleet level route is playable.
- [x] Prove Set Sail can be won by boarding the boat and crossing water.

## Content Polish

- [x] Update Set Sail description to name `Board`.
- [x] Add intro targets for the boat, `Board`, and the water crossing.
- [x] Avoid new boat mechanics, disembark rules, broad builder redesign, new vehicle types, and schema/cloud work.

## Validation

- [x] `PROTO_NODE_VERSION=24 pnpm exec vitest --run src/lib/game/packs/validate.test.ts`
- [x] `PROTO_NODE_VERSION=24 pnpm exec vitest --run src/lib/game/packs/validate.test.ts src/lib/game/interpreter.test.ts src/lib/game/ghost-path.test.ts`
- [x] `PROTO_NODE_VERSION=24 pnpm exec playwright test e2e/lost-fleet.spec.ts --project=chromium`
- [x] `PROTO_NODE_VERSION=24 pnpm check`
- [x] `PROTO_NODE_VERSION=24 pnpm lint`
- [x] `PROTO_NODE_VERSION=24 pnpm build`
- [x] `git diff --check`

## Manual Visual Review Checklist

- [ ] Library card for The Lost Fleet is visible and visually coherent.
- [ ] `/library/vehicles` shows the three boat levels in the intended order.
- [ ] Set Sail story highlights the boat, `Board`, and the water crossing clearly.
- [ ] During Set Sail run, Zoey visibly boards/carries the boat affordance while crossing water.
- [ ] Win modal appears after the Step → Board → Step → Step solution.
- [x] Manual local visual review accepted the Lost Fleet slice.
