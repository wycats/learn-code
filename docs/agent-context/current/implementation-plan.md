# Implementation Plan: Phase 45 — Context-Aware Field Guide

## Status

Phase 45 is implemented and ready to close as the first Context-Aware Field Guide slice. PER 1 runtime/schema foundation, PER 2 context-aware surfacing, and PER 3 minimal Jonas-centered authoring are complete. The current Field Guide can be supplied dynamically, packs can include optional guide content, the existing Field Guide button passively opens the most relevant known page when the current play context has a clear signal, and custom pack creators can write “How this pack works” notes in the Pack Builder.

## Phase Goal

Empower players and young creators with a Field Guide that explains the current level/pack in context, while giving Architects like Jonas a path to write guide material for their own packs.

## Persona Goals

### Zoey

- Needs help that appears near the moment of confusion.
- Benefits from voice, character framing, and concrete examples.
- Should not be overwhelmed by unread badges, long documentation lists, or abstract reference material.

### Jonas

- Wants to create his own things and explain how they work.
- Needs a creator surface that feels like writing designer notes for his pack, not maintaining a complex documentation system.
- Should not need to manage IDs, schemas, tags, or book structure to get a useful first result.
- Benefits from a short loop: write a note, preview it, play the pack, then share the pack with someone else.
- Benefits from seeing his guide content appear when someone plays his levels.

## Recon Findings

See `field-guide-recon.md` for details. The short version:

- `BookStore` and `BookModal` are coupled to the singleton `THE_FIELD_GUIDE`.
- Play mode does not pass pack/level context to the Field Guide.
- `BookSchema` already exists and can likely be reused for pack-authored guide content.
- `LevelPackSchema` does not yet include guide content.
- Builder has story and hint authoring patterns that can inspire a future guide authoring UI.

## Proposed Phase 45 Shape

### PER 1 — Runtime and Schema Foundation

- Refactored Field Guide runtime to accept a dynamic `Book` source.
- Added `bookStore.openTo(chapterId, pageId?)` with safe fallback behavior.
- Added optional pack-level guide content to `LevelPackSchema`.
- Merged built-in guide chapters with pack-authored guide chapters in play mode.
- Namespaced and deduplicated pack-authored chapter/page ids during merge.
- Kept unsupported rich book blocks out of the authoring path for now.
- Added tests for dynamic book navigation, pack guide schema parsing, and guide merging.

## PER 1 Validation State

- Focused Field Guide/store/schema/import tests passed.
- `PROTO_NODE_VERSION=24 pnpm check` passed with existing unrelated warnings.
- `PROTO_NODE_VERSION=24 pnpm lint` passed.
- `git diff --check` passed.

### PER 2 — Context-Aware Surfacing

- Uses current pack and level data to prioritize or open relevant guide pages.
- Starts with simple signals: `availableBlocks`, custom tiles/items, and the `loops` pack tag.
- Opens related pages through the existing Field Guide button.
- Avoids unread-dot mechanics and automatic popups.
- Defers explicit guide metadata and broader tag relevance.

## PER 2 Validation State

- Focused Field Guide relevance/store/merge tests passed.
- `PROTO_NODE_VERSION=24 pnpm check` passed with existing unrelated warnings.
- `PROTO_NODE_VERSION=24 pnpm lint` passed.
- `git diff --check` passed.

### PER 3 — Jonas-Centered Minimal Authoring

PER 3 is implemented.

- Add a simple Pack Builder guide section around a “How this pack works” model.
- Start with creator prompts such as “Special rules,” “Tricky part,” “Designer tip,” and “What I want players to notice.”
- Compile those notes into text/voice Field Guide pages instead of making Jonas manage chapters and pages directly.
- Preview the guide content in the builder.
- Save guide content inside custom pack JSON.
- Sanitize Markdown links used by authored/imported guide text.
- Defer image, component, mini-playground, unlock, and interactive tutorial editing.

## PER 3 Validation State

- Focused PackGuideEditor component, pack-guide authoring helper, and relevance tests passed: 23 tests across `PackGuideEditor.svelte.test.ts`, `pack-guide-authoring.test.ts`, and `relevance.test.ts`.
- Markdown link sanitization tests passed.
- `PROTO_NODE_VERSION=24 pnpm check` passed with existing unrelated warnings.
- `PROTO_NODE_VERSION=24 pnpm lint` passed.
- `git diff --check` passed.

## Visual/Product Review State

- Jonas review accepted the write → preview → playtest → Field Guide loop as satisfying and appropriately creator-centered.
- Zoey review accepted passive context-aware opening because it adds help without popups, unread dots, or pressure mechanics.
- Desktop layout is comfortable for pack guide authoring.
- Tablet and phone layouts are usable for the first slice but should receive future polish around guide editor height and Field Guide table-of-contents behavior.

## Out of Scope for First Slice

- Full Field Guide authoring studio.
- Rich image/component/playground authoring UI.
- Interactive tutorial validation.
- Unlock/progress gating.
- Moderation workflow for shared custom guide content.
- Replacing story/hint systems.
- Story/tutorial control from the original “Master Teacher” outline.
- Mobile-specific Field Guide table-of-contents polish.
- Debounced/coalesced guide note save history.

## Validation Commands Used

- Focused tests for Field Guide store, merge, relevance, authoring helpers, PackGuideEditor, and Markdown sanitization.
- `PROTO_NODE_VERSION=24 pnpm check`.
- `PROTO_NODE_VERSION=24 pnpm lint`.
- `git diff --check`.

## Open Product Questions

- Should guide content live only at pack level first, or should levels also declare related guide entries?
- Should the guide open automatically to relevant pages, or simply prioritize them when the user opens the book?
- Should Jonas-authored guide pages use the book voices (`guide`, `zoey`, `jonas`) or arbitrary pack characters?
- Should imported pack guide content appear by default, or should there be safety controls before surfacing shared text?
- What is the smallest Jonas-friendly authoring flow that lets him add one useful guide note in under a minute?
