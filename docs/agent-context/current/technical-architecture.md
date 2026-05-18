# Technical Architecture: Phase 37 — The Lost Fleet

## Architecture Summary

Phase 37 uses the existing level-pack architecture. No schema, cloud, storage, or interpreter architecture changes were required.

## Existing Pack Flow

- Built-in levels are parsed through `LevelDefinitionSchema` in the level registry.
- Built-in packs are parsed through `LevelPackSchema`.
- `VEHICLES_PACK` is included in `PACKS`.
- Library routes resolve built-in packs through `getPack(id)`.
- Play routes load levels from the resolved pack and instantiate `GameModel`.

## Boat Mechanic Flow

- Boat is an existing item with vehicle behavior.
- `Board` is an existing block type.
- Water is already passable by boat.
- The interpreter and Ghost Path simulation already support boarding and crossing water.

## Phase 37 Constraints

- Keep vehicles as content exposure, not new mechanics.
- Use tests to lock the pack and content shape.
- Keep Set Sail content polish data-only.
- Do not introduce disembark, vehicle variants, builder redesign, schema migration, or cloud work in this slice.

## Validation Coverage Added

- Unit coverage for pack registration, vehicles level count/order, and duplicate built-in level ids.
- E2E coverage for Library visibility, direct pack route loading, first-level playability, and Set Sail win flow.
