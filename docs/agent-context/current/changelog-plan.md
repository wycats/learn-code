# Changelog Plan: Phase 48 PER 1 — The Drafting Table

## Candidate User-Facing Summary

Builders can use a Drafting Table while testing a level: a safe scratchpad for staging block ideas before copying them into the executable Program.

## Candidate Highlights

- Add a visible Builder/Test Drafting Table lane above the Program.
- Let creators stage blocks without affecting run behavior, block limits, Ghost Path, or Code View.
- Copy blocks safely between Program and Drafting Table with fresh IDs.
- Keep drafts session-only and level-scoped within the current Builder session.
- Reuse existing block visuals and loop/call configuration affordances for draft blocks.

## Non-User-Facing Notes

- Drafts are not persisted in level JSON.
- Drafts are not part of `GameModel` execution state.
- Player trays are unchanged.
- Semantic Zoom and saved snippet libraries remain deferred.

## Validation Notes To Include Internally

- Focused block-list helper tests.
- Focused BuilderModel draft-state tests.
- Focused Tray component tests.
- `PROTO_NODE_VERSION=24 pnpm check`.
- `PROTO_NODE_VERSION=24 pnpm lint`.
- `git diff --check`.
- Manual browser review at `https://kibi.localhost/`.
