# Changelog Plan: Phase 37 — The Lost Fleet

## Candidate User-Facing Summary

The Lost Fleet is now visible and validated as Kibi's boat-themed pack. Players can find it in the Library, open the Vehicles pack directly, and complete Set Sail by boarding a boat and crossing water.

## Candidate Highlights

- Added targeted validation for the built-in Vehicles pack.
- Added E2E coverage proving The Lost Fleet is visible, routable, and playable.
- Polished Set Sail's intro guidance so `Board` and the boat crossing are highlighted.

## Non-User-Facing Notes

- This was a stabilization slice, not a new mechanic slice.
- No boat mechanics, vehicle types, builder redesign, or persistence/schema work were introduced.

## Validation Notes To Include Internally

- Focused unit validation passed.
- Targeted Lost Fleet Playwright coverage passed.
- Broader check, lint, build, and diff whitespace validation passed.
