# Walkthrough: Phase 45 — Context-Aware Field Guide

## Current Status

Phase 45 planning has started with a recon of the existing Field Guide runtime, pack schemas, and builder authoring surfaces. The recommended first implementation slice is a runtime/schema foundation that makes the Field Guide dynamic and pack-extensible before adding a full Jonas-facing authoring UI.

## Why This Phase Matters

The Field Guide is already the project’s diegetic manual. It should become the place where:

- Zoey can get help that is relevant to the level she is playing;
- Jonas can explain the special rules and ideas in packs he creates;
- parents/maintainers can distinguish reference material from story/hints without adding intrusive popups.

## Recon Summary

The current Field Guide is useful but static:

- the store and modal read from a singleton built-in guide;
- play mode does not pass current pack/level context into the guide;
- packs cannot include their own guide content;
- builder story and hint editors already demonstrate authoring patterns that could later support guide editing.

## Planned Shape

### Runtime Foundation

First, make the guide runtime accept a dynamic book and support targeted opening. This gives the rest of the phase a stable boundary.

### Pack Extensibility

Next, allow packs to carry optional guide content and merge that with the built-in guide when playing a pack. This is the core unlock for Jonas-created explanations.

### Context Awareness

Then, use level/pack signals to make the guide feel relevant without adding notification pressure. The book should feel helpful when opened, not nagging when closed.

### Minimal Authoring

Finally, give Jonas a small text/voice guide authoring surface in the Pack Builder. The first version should feel like writing “How this pack works” designer notes, not like editing a book schema. Rich authoring can wait until the basic loop is proven.

The visible Jonas loop should be:

1. Jonas writes a short designer note in Builder.
2. Builder previews the note as it will appear in the Field Guide.
3. Jonas playtests the pack.
4. The Field Guide shows that note in the context of his pack.
5. Jonas can share the pack knowing players will see his explanation.

## Important Constraints

- Do not start with a full CMS-like authoring studio.
- Do not make Jonas manage raw chapters, page ids, tags, or schema fields for the first authoring slice.
- Do not introduce unread-dot fatigue.
- Do not rely on `unlockedBy` until unlock semantics are explicitly designed.
- Do not expose unsupported rich content blocks in builder authoring until rendering support exists.
- Treat shared/imported guide text as a future safety and moderation question.

## Next Implementation Target

PER 1 should change as little product UX as possible while creating the runtime/schema foundation:

1. Dynamic `BookStore`/`BookModal`.
2. `openTo(chapterId, pageId?)`.
3. Optional `guide` on packs.
4. Play-mode merge of built-in plus pack guide.
5. Focused tests.
