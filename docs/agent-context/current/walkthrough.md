# Walkthrough: Phase 46 — Variables & Scoping / Engine Readiness

## Current Status

Phase 46 has started with a variables/scoping recon and a first concrete implementation slice: Jonas Key/Door Creator Loop. The intent is to make existing visible memory mechanics creator-accessible before introducing abstract variables, scoped boxes, counters, or PXT.

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

## Deferred Work

- Zero-valued Number tools and revised zero-repeat semantics.
- Number values beyond the `1..9` Builder slice.
- Counters and merge operations.
- Multiple inventory slots.
- Key colors.
- Function parameters/returns.
- Lexical scoping / box metaphor.
- PXT / MakeCode integration.
