# Task List: Phase 45 — Context-Aware Field Guide

## Recon and Planning

- [x] Investigate current Field Guide runtime, schema, and builder surfaces.
- [x] Identify Jonas-centered custom pack guide needs.
- [x] Document runtime/schema constraints and phased implementation plan.

## PER 1 — Runtime and Schema Foundation

- [x] Refactor `BookStore` so it can navigate a supplied `Book`, not only `THE_FIELD_GUIDE`.
- [x] Refactor `BookModal` so table-of-contents and navigation use the active book source.
- [x] Add `bookStore.openTo(chapterId, pageId?)` with safe fallback behavior.
- [x] Add optional pack-level guide content to `LevelPackSchema`.
- [x] Merge built-in Field Guide chapters with pack-authored guide chapters in play mode.
- [x] Namespace and deduplicate pack-authored chapter/page ids during merge.
- [x] Keep rich unsupported book block authoring deferred; accepted schema blocks remain existing runtime behavior.
- [x] Add tests for dynamic guide navigation and pack guide schema parsing.

## PER 2 — Context-Aware Surfacing

- [ ] Define concept/relevance signals from current level and pack data.
- [ ] Prioritize relevant built-in and pack-authored guide pages when opening the guide.
- [ ] Add a lightweight related-guide affordance from the game UI or story/hints.
- [ ] Avoid unread indicators and notification pressure.

## PER 3 — Minimal Creator Authoring

- [ ] Add a simple Pack Builder guide section around “How this pack works.”
- [ ] Add starter prompts/templates: “Special rules,” “Tricky part,” “Designer tip,” and “What I want players to notice.”
- [ ] Let Jonas write text/voice notes without touching guide ids, tags, schemas, or chapter/page structure.
- [ ] Compile those notes into pack guide pages.
- [ ] Preview authored guide content in builder.
- [ ] Let the creator playtest the pack and see authored guide content in context.
- [ ] Persist authored guide content in custom pack JSON.
- [ ] Jonas acceptance check: he can add one useful guide note in under a minute without opening advanced settings.
- [ ] Keep image, component, mini-playground, unlock, and interactive tutorial authoring deferred.

## Validation Checklist

- [x] Dynamic book/store unit tests pass.
- [x] Pack guide schema tests pass.
- [x] Field Guide merge helper tests pass.
- [x] `PROTO_NODE_VERSION=24 pnpm check`.
- [x] `PROTO_NODE_VERSION=24 pnpm lint`.
- [x] `git diff --check`.
