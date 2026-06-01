# Changelog Plan: Phase 47 — The Syntax Bridge

## Candidate User-Facing Summary

Players can open a read-only Code View that shows their Kibi block program as TypeScript-flavored code. The view includes syntax highlighting, updates after committed block changes, shows both the main program and any function definitions, visually connects selected or executing blocks to their generated code lines, and includes a compact board preview when space allows.

## Candidate Highlights

- Add a pure block-to-code formatter for the current Kibi block schema.
- Use a small code-writer helper so indentation is centralized instead of hand-managed by every block formatter.
- Add a read-only Code View dialog in the shared game toolbar.
- Show the whole program without wrapping it in a fake `main()` function.
- Render function calls and definitions with quoted creator-authored names.
- Render Number/Thought Bubble repeat values as `heldItem`.
- Add Shiki syntax highlighting with a plain-code fallback.
- Highlight selected and executing code lines using a formatter-generated block source map.
- Add playback controls and a compact board preview inside Code View.
- Add formatter and component tests for generated code and committed model updates.

## Non-User-Facing Notes

- Generated code is an explanatory pseudo-runtime, not executable JavaScript.
- Blocks remain the source of truth.
- No schema, runtime, interpreter, or Builder semantics changed.
- Editable text mode, round-trip parsing, direct code execution, and PXT remain deferred.
- During-drag code preview remains a follow-up product decision.

## Validation Notes To Include Internally

- Focused formatter tests.
- Focused Code View component tests.
- `PROTO_NODE_VERSION=24 pnpm check`.
- `PROTO_NODE_VERSION=24 pnpm lint`.
- `git diff --check`.
- Manual browser review at `https://kibi.localhost/`.
