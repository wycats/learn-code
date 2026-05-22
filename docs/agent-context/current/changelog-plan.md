# Changelog Plan: Phase 46 — Variables & Scoping / Engine Readiness

## Candidate User-Facing Summary

Creators can build simple locked-door puzzles by placing a key and a door in the Builder. Players pick up the key, carry it in the Thought Bubble, and use it to pass through the door.

## Candidate Highlights

- Add Key as a Builder item tool.
- Add Door as a Builder terrain preset.
- Door behaves like a wall that opens when the character holds Key.
- Reuse the existing Thought Bubble / held-item mechanic as the first visible variable concept.
- Add interpreter and Ghost Path coverage for the key-door puzzle loop.

## Non-User-Facing Notes

- No named variables, counters, lexical scoping, or PXT integration in this first slice.
- Door is stored as a custom wall tile with `passableBy: 'key'`.
- Runtime behavior uses existing held-item/passability semantics.

## Validation Notes To Include Internally

- BuilderModel key and door painting tests.
- Interpreter key-door solve test.
- Ghost Path key-door solve and blocked-path tests.
- Integrated browser review of the Builder creation loop.
