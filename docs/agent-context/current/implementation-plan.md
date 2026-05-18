# Implementation Plan: Phase 37 — The Lost Fleet

## Status

Execution slice is implemented. Phase 37 was not a from-scratch pack build: `VEHICLES_PACK` already existed, was registered in `PACKS`, and already contained the three boat levels.

This slice therefore focused on validation, small Set Sail content polish, and visibility coverage.

## Phase Goal

Expose and stabilize the existing boat mechanic by proving that The Lost Fleet is visible, routable, playable, and backed by content assertions.

## Implemented Scope

### Pack and Content Validation

- Added targeted assertions that `VEHICLES_PACK` is registered in `PACKS`.
- Asserted the pack id/name and its three-level sequence:
  - Set Sail
  - Island Hopping
  - Row Your Boat
- Added a uniqueness assertion for built-in level ids across all registered packs.

### Lost Fleet Playwright Coverage

- Added a focused `lost-fleet` E2E spec covering:
  - The Lost Fleet appears in Library.
  - `/library/vehicles` loads directly.
  - Set Sail, Island Hopping, and Row Your Boat appear on the pack page.
  - The first level route loads as a playable game surface.
  - Set Sail can be won with the intended Step → Board → Step → Step flow.

### Content Polish

- Updated Set Sail's description to call out `Board` explicitly.
- Added intro targets that highlight the boat cell and the `Board` block/water crossing.
- No boat mechanics, disembark rules, builder redesign, new vehicle types, or schema/cloud work were added.

## Validation Plan

- `PROTO_NODE_VERSION=24 pnpm exec vitest --run src/lib/game/packs/validate.test.ts src/lib/game/interpreter.test.ts src/lib/game/ghost-path.test.ts`
- `PROTO_NODE_VERSION=24 pnpm exec playwright test e2e/lost-fleet.spec.ts --project=chromium`
- `PROTO_NODE_VERSION=24 pnpm check`
- `PROTO_NODE_VERSION=24 pnpm lint`
- `git diff --check`

## Validation State

- Focused unit tests: passed.
- Targeted Playwright Lost Fleet spec: passed after correcting the playability assertion to match the current play UI.
- `PROTO_NODE_VERSION=24 pnpm check`: passed with existing unrelated warnings.
- `PROTO_NODE_VERSION=24 pnpm lint`: passed.
- `PROTO_NODE_VERSION=24 pnpm build`: passed with existing unrelated warnings and the adapter-auto notice.
- `git diff --check`: passed.

## Known Validation Note

The first two normal Playwright attempts hit the configured 60s web server timeout while the production build was still warming. Running the build step separately showed the production build succeeds but can take about 1m45s. After warm-up, the normal targeted Playwright command passed.
