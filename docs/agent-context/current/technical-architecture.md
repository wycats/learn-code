# Technical Architecture: Phase 45 — Context-Aware Field Guide

## Architecture Summary

Phase 45 should evolve the Field Guide from a static singleton into a dynamic guide system. The runtime should be able to render a book assembled from the built-in Field Guide plus optional pack-authored chapters.

## Current Architecture

- Built-in content lives in `THE_FIELD_GUIDE`.
- `BookStore` imports that singleton directly for current chapter/page state and navigation.
- `BookModal` imports the singleton directly for table-of-contents and navigation bounds.
- `BookPage` renders pages from the active store but supports only some schema block types.
- `Game.svelte` opens the Field Guide without pack or level context.

## Target PER 1 Architecture

1. A guide source is assembled for the current play context.
2. The source starts with built-in Field Guide chapters.
3. If the current pack has guide content, pack-authored chapters are appended or grouped after built-in content.
4. `BookStore` navigates the active guide source and exposes `open()`, `openTo()`, `close()`, `nextPage()`, `prevPage()`, and `goToChapter()`.
5. `BookModal` renders the active guide source without importing built-in content directly.

## Proposed Data Boundary

Add optional pack-level guide content:

- `LevelPackSchema.guide?: BookSchema`

Keep level-level relevance metadata separate until context-aware surfacing is designed. Candidate future fields:

- `LevelDefinition.guideEntryIds?: string[]`
- `LevelDefinition.concepts?: string[]`
- `BookChapter.tags?: string[]`
- `BookPage.tags?: string[]`

## Builder Boundary

The first runtime/schema slice should not require builder UI. A later slice can add a Pack Builder Guide section that writes into `pack.guide`.

Initial authoring should support only safe, simple content:

- chapters;
- pages;
- text blocks;
- voice blocks.

Rich content remains deferred:

- image upload/selection;
- mini-playground authoring;
- arbitrary component blocks;
- unlock semantics;
- interactive tutorial validation.

## Compatibility Notes

- Optional guide content should not break existing packs.
- Imported packs with no guide should behave exactly as they do today.
- Unsupported guide block types should either render with a clear fallback or be excluded from creator authoring until supported.
- If custom guide text is shared through packs, future safety/moderation work may be needed.

## Testing Strategy

- Unit-test `BookStore` against a custom book fixture.
- Unit-test `openTo` fallback behavior for missing chapters/pages.
- Schema-test pack guide parsing.
- Add a focused play-mode/component test for built-in plus pack guide merging.
