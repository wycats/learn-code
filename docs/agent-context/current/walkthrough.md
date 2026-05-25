# Walkthrough: Phase 46 — Variables & Scoping / Engine Readiness

## Current Status

Phase 46 has progressed through the Jonas Key/Door creator loop, Number pickup Builder slice, runtime parity polish, and a tiny player-facing Number/Repeat teaching-content pass. The intent remains to make existing visible memory mechanics creator-accessible and learnable before introducing abstract variables, scoped boxes, counters, or PXT.

## Why This Phase Matters

The current engine already has a powerful idea: the character can hold one visible item in a Thought Bubble, and the world can respond to that held item. This is the right developmental foundation for variables because it starts with possession rather than symbols.

## Recon Summary

- Current “variables” are really `heldItem` references.
- `pick-up` puts an item in the Thought Bubble.
- Walls can be passable by a held key.
- Loop counts can read value-style held items, but number tools are not ready for Jonas yet.
- Builder can define passable tiles but does not expose Key/Door as an easy loop.
- Interpreter and Ghost Path both need parity coverage when variable-like behavior expands.

## Implemented Shape

### Key Tool

The Builder now exposes Key as a standard item tool. Painting a key places a built-in collectible item that can be picked up.

The visible key treatment was adjusted after browser review: it now uses a warmer stroke-only key icon and renders as a small pickup token near the bottom of a cell. This keeps the grass/terrain marker visible instead of stacking two icons in the same center point.

### Door Preset

The Builder now exposes Door as a terrain preset. Painting a door persists a custom tile definition that behaves like a wall and opens when the character holds a key.

### Runtime Meaning

No new runtime semantics were needed. The existing engine already understands:

1. pick up key;
2. store key in Thought Bubble;
3. check `passableBy: 'key'` on wall-like tiles;
4. allow movement through the door when holding the key.

## What This Teaches

The key-door loop teaches the first variable idea without naming it:

> “I am holding something, and what I am holding changes what happens later.”

This is the foundation for later number values, counters, operations, and eventually scoped boxes.

## Browser Review Outcome

Integrated browser review passed on the Builder route:

1. Created a fresh test level.
2. Placed Key and Door tools from the Terrain tray.
3. Confirmed the Door renders with the key-required overlay.
4. Enabled Pick Up in the Logic tray.
5. Playtested with `Step → Pick Up → Step → Step`.
6. Confirmed the run reaches `Won`, the key appears in the Thought Bubble, and the character passes the Door.

Follow-up visual review found that the initial key icon rendered too dark/small and directly overlaid the terrain marker. The current fix separates “what the ground is” from “what item can be picked up here” by keeping terrain markers centered and docking pickup items into a bottom badge.

Additional regression review found two basic affordance problems while adding Key/Door:

- Program blocks could not be dragged into the trash because the interaction system treated `accepts: ['any']` as a literal type, not a wildcard. The trash zone now accepts statement blocks again.
- Removing Key/Door placements depended on the top-toolbar Erase control, which was too easy to miss while working in the Terrain tray. The Terrain tray now includes its own Erase tool, and the erase behavior is covered for mixed key+door cells.

Tablet visual review also exposed uneven tray polish: tool icons had different apparent sizes, tab widths were inconsistent, and the Door looked like an empty amber tile with a tiny key badge. The tray now normalizes preview boxes and icon sizes at tablet width, uses an even four-column tab grid, and renders the Door with a primary locked-door glyph plus the small key requirement badge.

The Builder top bar no longer horizontally scrolls at tablet width. Its layout now reserves fixed space for the right-side play/theme controls, lets the left tool groups compress, and hides duplicate mode/status chips in the tablet breakpoint rather than letting the whole toolbar overflow offscreen.

Rather than continuing to whack-a-mole individual labels, the Builder route now defines a small Builder UI typography scale. The tray consumes those tokens and enforces a readable tablet floor: tool labels stay at 16px, tab labels stay near 15px, and narrow tray behavior changes layout/spacing before shrinking text.

The first erase attempt exposed a Svelte outro-transition crash: `Cell` was reading the live `item` prop while the keyed item marker was leaving. The item marker now renders from a stable one-item array, so clearing the prop can animate/remove the marker without trying to read `undefined.type`.

## PER 2 Progress

Number pickup is now the second visible-memory slice. Builder exposes a Number item tool with a hash/value preview, paints Number items as numeric `value: 3` by default, and provides a small touch-friendly editor for selected Number items. The editor clamps values to `1..9` so Jonas only sees positive Repeat counts for now.

Zero remains deferred because current loop semantics mirror Interpreter and Ghost Path by running a `0` repeat body once. Exposing `0` before redesigning that behavior would make the visible value teach the wrong expectation.

Runtime behavior stayed small: Pick Up already stores Number items in the Thought Bubble, and Repeat already reads held value items through `heldItem`. PER 2 adds parity tests for Pick Up Number 3 → Repeat Move in both Interpreter and Ghost Path.

## PER 3 Progress

PER 3 tightened the Key/Number slice without expanding it. The duplicated runtime rules in the live Interpreter and Ghost Path simulator now share one pure helper for:

1. resolving `heldItem` variable values;
2. resolving built-in and custom terrain behavior;
3. checking passability from `{ heldItem, vehicle }`.

The behavior was intentionally preserved. A locked Door still opens only while holding the matching Key; keys are not consumed; no door state is introduced. Boats still use the `vehicle` channel, and Number remains a held value for Repeat. The current zero-repeat parity also remains unchanged and deferred.

The visible held-item treatment was also unified. `HeldItemToken` now renders the shared Key/Number/Boat/color token shape across the Thought Bubble, pickup badges, the player tray Held Item token, the Repeat variable badge, and the Builder logic Held Item token. This keeps “the thing I am carrying” visually consistent across the grid, bubble, and parameter surfaces.

Locked doors now get visual-only passable feedback while the matching held item is present. The cell and requirement badge highlight as passable, but the runtime does not mutate the door or consume the held Key.

PER 3 added/confirmed parity coverage for:

- Key → locked Door success.
- Locked Door without Key blocked.
- Number 3 → Repeat Move reaches the goal.
- Boat → Water still works through the vehicle path.
- Zero repeat still mirrors current behavior.

## PER 4 Progress

PER 4 kept the runtime and Builder untouched and polished the existing `level-keys-1` teaching level instead of adding another near-duplicate. The level still uses the same id, straight-line 5×5 geometry, Number value `3`, and block set, but its player-facing text now names the full sequence:

1. Pick Up the Number.
2. Watch the Thought Bubble hold it.
3. Use Held Item as the Repeat count.
4. Put Step inside Repeat so the held `3` runs Step three times.

The level intro now has targets for the Number, Pick Up, Repeat, and Step surfaces, and the level has two lightweight hints: one for picking up the Number and one for using Held Item with Repeat.

The Field Guide Automation/Loops page now adds the same concept in one concise note: a Number in the Thought Bubble can drive Repeat through Held Item.

Pack validation now includes a focused assertion that `VARIABLES_PACK` continues to register `level-keys-1`, so the teaching level remains present in the built-in Variables pack.

## How to Try It Out

Use the user-managed dev server at `https://learn-coding.localhost/`. If it is stale, restart it yourself with `pnpm dev`.

### Try the Jonas Key/Door Builder loop

1. Open the Builder and create or open a level.
2. In the Terrain tray, place a Door.
3. In the same tray, place a Key before the Door.
4. Use the Erase tool to confirm Key/Door placements can be removed from the tray where they were added.
5. In the Logic tray, enable/use Pick Up.
6. Switch to test/play mode.
7. Build a program like `Step → Pick Up → Step → Step` so Zoey picks up the Key and walks through the Door.
8. Confirm the Key appears in the Thought Bubble and the Door visually reads as passable while the Key is held.

### Try the Number/Repeat Builder loop

1. In the Builder, select the Number item tool.
2. Place a Number on the grid.
3. Select the placed Number and use the value editor to adjust it between `1` and `9`.
4. Put the goal exactly that many steps after the Number pickup.
5. In test/play mode, use `Pick Up`, then a `Repeat` whose count is set to Held Item / the Thought Bubble token.
6. Put `Step` inside Repeat and run.
7. Confirm Ghost Path and runtime agree, and Zoey reaches the goal when the path length matches the carried Number.

### Try the built-in teaching level

1. Open the Library.
2. Open the Variables pack / “Keeper of Keys”.
3. Start `The Number Key` (`level-keys-1`).
4. Follow the level copy: pick up the Number, use Held Item as the Repeat count, and put Step inside Repeat.
5. Open the Field Guide from the level and confirm the Loops page mentions Thought Bubble Numbers as Repeat counts.

## Deferred Work

- Zero-valued Number tools and revised zero-repeat semantics.
- Number values beyond the `1..9` Builder slice.
- Counters and merge operations.
- Multiple inventory slots.
- Key colors.
- Function parameters/returns.
- Lexical scoping / box metaphor.
- PXT / MakeCode integration.
- Door consumption/unlocked state.
- Zero-repeat redesign.
