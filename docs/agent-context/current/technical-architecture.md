# Technical Architecture: Phase 45 — Context-Aware Field Guide

## Architecture Summary

Phase 45 evolves the Field Guide from a static singleton into a dynamic guide system. The runtime can render a book assembled from the built-in Field Guide plus optional pack-authored chapters.

## Current Architecture

- Built-in content lives in `THE_FIELD_GUIDE`.
- `BookStore` imports that singleton directly for current chapter/page state and navigation.
- `BookModal` imports the singleton directly for table-of-contents and navigation bounds.
- `BookPage` renders pages from the active store but supports only some schema block types.
- `Game.svelte` opens the Field Guide without pack or level context.

## PER 1 Architecture

1. A guide source is assembled for the current play context.
2. The source starts with built-in Field Guide chapters.
3. If the current pack has guide content, pack-authored chapters are appended or grouped after built-in content.
4. Pack-authored chapter/page ids are namespaced and deduplicated to avoid collisions with built-in guide ids and Svelte keyed each blocks.
5. `BookStore` navigates the active guide source and exposes `open()`, `openTo()`, `close()`, `nextPage()`, `prevPage()`, and `goToChapter()`.
6. `BookModal` renders the active guide source without importing built-in content directly.

## PER 2 Architecture

1. A pure relevance helper inspects the active `Book`, current `LevelDefinition`, and optional `LevelPack`.
2. Built-in targets are limited to pages that exist today: movement, turning, and loops.
3. Level `availableBlocks` drives movement, turning, and loop relevance.
4. The `loops` pack tag can select the loops guide page when no level block signal exists.
5. Custom tile/item context can prioritize the first pack-authored guide page in the merged guide.
6. The existing Field Guide button calls `openTo()` only when the helper returns a safe target; otherwise it preserves normal `open()` behavior.

Explicit guide metadata, broad tag mapping, and richer relevance rules remain deferred until creator authoring establishes what Jonas can intentionally attach.

## Proposed Data Boundary

Add optional pack-level guide content:

- `LevelPackSchema` adds `guide?: Book`, validated with `BookSchema`.
- In Zod, this likely means adding `guide: BookSchema.optional()` to the pack schema.

Keep level-level relevance metadata separate until context-aware surfacing is designed. Candidate future fields:

- `LevelDefinition.guideEntryIds?: string[]`
- `LevelDefinition.concepts?: string[]`
- `BookChapter.tags?: string[]`
- `BookPage.tags?: string[]`

## Builder Boundary

The Pack Builder now includes a constrained guide authoring section that writes into `pack.guide`.

The builder does not expose the full `BookSchema` directly to Jonas. It writes a constrained Jonas-friendly authoring model and compiles that model into `pack.guide`.

The likely first authoring model is “How this pack works” notes:

- special rules;
- tricky parts;
- designer tips;
- what the creator wants players to notice.

Initial authoring supports only safe, simple content:

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
- Authored/imported Markdown links are sanitized before rendering.

## Testing Strategy

- `BookStore` is covered against a custom book fixture.
- `openTo` fallback behavior is covered for missing chapters/pages.
- Pack guide schema parsing is covered.
- Built-in plus pack guide merging, relevance, guide authoring, and Markdown sanitization are covered by focused tests.
