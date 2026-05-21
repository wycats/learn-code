# Changelog Plan: Phase 45 — Context-Aware Field Guide

## Candidate User-Facing Summary

The Field Guide is now aware of the pack and level being played, and custom pack creators can add simple “How this pack works” notes that travel with their packs.

## Candidate Highlights

- Prepare the Field Guide to use dynamic guide content instead of only the built-in book.
- Add support for pack-authored guide content.
- Make the guide open or prioritize content relevant to the current play context.
- Lay the foundation for Jonas-style “How this pack works” notes in custom packs.
- Let creators add simple guide notes that appear when players open the Field Guide for their packs.
- Sanitize authored/imported Markdown links in guide text.

## Non-User-Facing Notes

- Full rich guide authoring UI remains a later slice.
- Rich guide blocks, mini-playground authoring, and unlock semantics remain deferred.
- Shared/imported guide text may require future safety and moderation decisions.
- Original Master Teacher story/tutorial control remains deferred.

## Validation Notes To Include Internally

- Dynamic guide navigation and pack guide schema support should have focused tests.
- Existing packs without guide content should continue to parse and play unchanged.
- Pack guide authoring, relevance, and Markdown sanitization should have focused tests.
