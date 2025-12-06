# Axiom 10: Schema Stability (No Breaking Changes)

**We respect the user's creations.**

## Principle

An update to the app must never break an existing level or pack. User data is sacred.

## Application

- **Backward Compatibility**: The schema parser (Zod) must always handle older versions of the data format.
- **Migration**: If the internal model changes, we must provide a migration path (e.g., `transformV1toV2`) that runs transparently on load.
- **Lenient Validation**: We validate inputs strictly, but we are lenient with outputs (Postel's Law). If a field is missing in a save file, provide a sensible default rather than crashing.

## Anti-Pattern

- A "Corrupted Save" error after an app update.
- Forcing users to "reset" their progress.
