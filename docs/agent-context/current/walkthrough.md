# Walkthrough: Phase 45 — Context-Aware Field Guide

## Current Status

Phase 45 is implemented and ready to close as the first Context-Aware Field Guide slice. The Field Guide runtime can navigate a dynamic book source, packs can carry optional guide content, play mode merges built-in guide chapters with pack-authored chapters, the existing Field Guide button opens relevant pages passively, and Jonas can write “How this pack works” notes in the Pack Builder.

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

The guide runtime now accepts a dynamic book and supports targeted opening. This gives the rest of the phase a stable boundary.

### Pack Extensibility

Packs can carry optional guide content, validated with the shared book schema. Play mode merges pack guide chapters with the built-in guide, and pack-authored ids are namespaced/deduplicated to avoid collisions.

### Context Awareness

The existing Field Guide button now opens the most relevant known page when the current level/pack has a clear signal. The first-pass signals are intentionally small: available movement/turn/loop blocks, custom tile/item context paired with pack-authored guide pages, and a `loops` pack tag. Unknown or unsupported contexts still open the guide normally.

There are no unread badges, notification dots, or automatic popups. The book should feel helpful when opened, not nagging when closed.

### Minimal Authoring

Jonas now has a small text/voice guide authoring surface in the Pack Builder. The first version feels like writing “How this pack works” designer notes, not like editing a book schema. Authored note rendering uses sanitized Markdown links so shared/imported pack text cannot inject unsafe link attributes. Rich authoring can wait until the basic loop is proven.

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

PER 1 changed as little product UX as possible while creating the runtime/schema foundation:

1. Dynamic `BookStore`/`BookModal`.
2. `openTo(chapterId, pageId?)`.
3. Optional `guide` on packs.
4. Play-mode merge of built-in plus pack guide.
5. Focused tests.

PER 2 context-aware surfacing is implemented as a passive opener.

PER 3 minimal Jonas-centered authoring is implemented:

1. Pack Builder “How this pack works” guide section.
2. Four starter prompts for Jonas notes.
3. Direct `pack.guide` persistence through the existing pack update flow.
4. Preview through the real `BookPage` renderer.
5. Builder playtest receives the merged guide and related target.

## Visual/Product Review Results

### Jonas

- The authoring loop works: write a note, preview it, playtest, open Field Guide, see the note.
- The prompts feel creator-centered and avoid raw schema concepts.
- Future polish should make the section feel more like a playful creator card and less like a formal form.

### Zoey

- Context-aware opening remains passive and does not add pressure.
- Pack-authored notes can explain special rules when she plays someone else’s pack.
- The book icon may need a future gentle affordance when relevant help exists.

### Desktop, Tablet, Phone

- Desktop layout is comfortable for guide authoring.
- Tablet remains usable but scroll-heavy.
- Phone should receive future polish around prompt/preview height and Field Guide table-of-contents layout.

## Completion Assessment

Phase 45 can close if its accepted scope is the first Context-Aware Field Guide slice:

1. Dynamic guide runtime.
2. Pack-extensible guide content.
3. Passive context-aware guide opening.
4. Minimal Jonas-centered pack guide authoring.

The original “Master Teacher” story/tutorial control items are deferred to a later phase.
