# Changelog Plan: Phase 45 — Context-Aware Field Guide

## Candidate User-Facing Summary

The Field Guide becomes aware of the pack and level being played, and custom packs gain a path toward carrying their own guide material.

## Candidate Highlights

- Prepare the Field Guide to use dynamic guide content instead of only the built-in book.
- Add support for pack-authored guide content.
- Make the guide open or prioritize content relevant to the current play context.
- Lay the foundation for Jonas-style creator-authored guide pages in custom packs.

## Non-User-Facing Notes

- Full guide authoring UI remains a later slice.
- Rich guide blocks, mini-playground authoring, and unlock semantics remain deferred.
- Shared/imported guide text may require future safety and moderation decisions.

## Validation Notes To Include Internally

- Dynamic guide navigation and pack guide schema support should have focused tests.
- Existing packs without guide content should continue to parse and play unchanged.
