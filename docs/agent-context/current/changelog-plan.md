# Changelog Plan: Phase 46 — Variables & Scoping / Engine Readiness

## Candidate User-Facing Summary

Creators can build simple locked-door puzzles by placing a key and a door in the Builder. Players can also learn the visible-value version of the same idea: pick up a Number, hold it in the Thought Bubble, and use Held Item to control Repeat.

## Candidate Highlights

- Add Key as a Builder item tool.
- Add Door as a Builder terrain preset.
- Door behaves like a wall that opens when the character holds Key.
- Reuse the existing Thought Bubble / held-item mechanic as the first visible variable concept.
- Add interpreter and Ghost Path coverage for the key-door puzzle loop.
- Polish the built-in Number/Repeat teaching level so it explains Pick Up Number → Thought Bubble → Held Item Repeat → Step inside Repeat.
- Add a short Field Guide note about Thought Bubble Numbers as Repeat counts.

## Non-User-Facing Notes

- No named variables, counters, lexical scoping, or PXT integration in this first slice.
- Door is stored as a custom wall tile with `passableBy: 'key'`.
- Runtime behavior uses existing held-item/passability semantics.
- Number/Repeat teaching content reuses existing runtime support; no runtime or Builder changes were needed for PER 4.
- `level-keys-1` remains the existing Variables pack level with the same id, layout, Number value `3`, and available blocks.

## Validation Notes To Include Internally

- BuilderModel key and door painting tests.
- Interpreter key-door solve test.
- Ghost Path key-door solve and blocked-path tests.
- Integrated browser review of the Builder creation loop.
- Variables pack registration assertion for `level-keys-1`.
- Focused PER 4 validation: pack validation, variables runtime parity, Ghost Path, and Field Guide relevance.
