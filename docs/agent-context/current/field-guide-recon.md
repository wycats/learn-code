# Field Guide Recon: Phase 45

## Question

What should the next Field Guide phase look like, especially if Jonas wants to create his own packs and write his own Field Guide material for them?

## Summary

The current Field Guide is a static global book. Phase 45 should first make it context-aware and pack-extensible, then add a minimal creator surface for pack-authored guide pages. A full authoring studio, interactive tutorials, image/component/playground authoring, and unlock semantics should remain later slices.

## Current Runtime Shape

- `Game.svelte` renders the Field Guide modal and opens it from the game header without passing current pack or level context.
- `BookStore` is coupled directly to the singleton `THE_FIELD_GUIDE`.
- `BookModal` also imports `THE_FIELD_GUIDE` for table-of-contents and navigation boundaries.
- `BookPage` renders only a subset of the book schema: text, voice, code, and playground blocks.
- `MiniPlayground` can render inline snippets, but `levelId`-based playground loading remains a TODO.

## Current Schema Shape

- `BookSchema` already models chapters, pages, and content blocks.
- `LevelPackSchema` has no `guide`, `fieldGuide`, or guide-entry field.
- `LevelDefinitionSchema` has `description`, `intro`, `outro`, `hints`, `characters`, and `emotions`, but no guide metadata.
- Built-in and custom packs already pass through `LevelPackSchema`, so a future optional pack-level guide field can persist through import/export once schema support exists.

## Existing Creator Surfaces

- Builder story authoring already lets creators write dialogue, choose speakers/emotions, and target UI/game elements.
- Builder hint authoring already lets creators write contextual help triggered by attempts, time, idle, story step, or analysis.
- These patterns are a better starting point for Jonas than a fully generic rich-book editor.

## Negative Findings

- No existing pack-authored Field Guide content surface was found.
- No runtime merge exists for built-in guide plus pack guide.
- No context-aware guide-opening API exists.
- `unlockedBy` exists on book chapters, but the current runtime does not enforce unlock rules.
- Book schema supports image/component blocks, but current rendering does not implement those block types.

## Design Direction

Phase 45 should establish a foundation with three goals:

1. The Field Guide runtime can use a dynamic book source.
2. Packs can optionally include their own guide content.
3. Play mode can surface guide content relevant to the current pack/level without adding unread-dot pressure.

Jonas's creator path should start with simple “How this pack works” notes for custom packs. The UI should feel like writing helpful designer notes for players of his pack, not like maintaining a documentation CMS or directly managing chapters and pages.

## Effort Breakdown

### Low Effort

- Add `bookStore.openTo(chapterId, pageId?)`.
- Let `BookModal`/`BookStore` receive a dynamic `Book` instead of importing `THE_FIELD_GUIDE` directly.
- Fix renderer gaps for safe schema-supported blocks or explicitly defer unsupported block types.
- Use current level signals (`availableBlocks`, custom tiles/items, pack tags) to suggest relevant built-in chapters.
- Show `level.description` in goal/help surfaces as a lightweight creator note.

### Medium Effort

- Add optional `guide?: Book` to `LevelPackSchema`.
- Merge built-in guide and pack guide at play time.
- Add `guideEntryIds` or `concepts` later if relevant pages need explicit level attachment.
- Add a simple Pack Builder Guide tab for “How this pack works” notes that compile into text/voice chapters and pages.
- Add “Open related Field Guide page” affordances from story/hints/book button.

### High Effort

- Full Field Guide authoring studio.
- Rich image/component/playground authoring.
- Interactive tutorial validation.
- Progress/unlock semantics.
- Community moderation and safety workflows for shared guide text.

## Recommended Phase 45 First Slice

### Context-Aware, Pack-Extensible Field Guide Foundation

1. Refactor `BookStore` and `BookModal` around a dynamic `Book`.
2. Add `openTo(chapterId, pageId?)` and safe fallback behavior.
3. Add optional `guide?: Book` to `LevelPackSchema`, validated with `BookSchema`.
4. Merge built-in and pack guide content in play mode.
5. Add tests for dynamic book navigation and pack guide schema parsing.
6. Defer builder authoring UI to the next slice after the runtime/schema boundary is proven.

## Product Decisions Still Needed

- Should pack-authored guide content be pack-level only at first, or should levels also declare relevant guide entries?
- Should the Field Guide open to recommendations automatically, or should the book button simply prioritize relevant pages?
- What voices should Jonas be able to use in authored guide pages? Existing book schema supports `guide`, `zoey`, and `jonas` voices, while level story supports arbitrary speakers.
- Should custom guide content be allowed in imported/shared packs immediately, or hidden behind a safety review later?
- What is the minimum useful authoring UI for Jonas: chapter/page editor, or a simpler “How this pack works” note that compiles into guide pages?

## Jonas Review Addendum

A Jonas-centered review sharpened the plan: the runtime/schema foundation is necessary, but the visible creator loop must not feel like a documentation CMS. The authoring surface should start as “How this pack works” notes that compile into guide pages.

Recommended acceptance shape for Jonas:

1. Write one useful note in under a minute.
2. Preview the note immediately in Builder.
3. Playtest the pack and see the note in the Field Guide.
4. Share the pack knowing the explanation travels with it.

The first builder-facing model should prefer starter prompts over raw chapter/page management:

- Special rules.
- Tricky part.
- Designer tip.
- What I want players to notice.
