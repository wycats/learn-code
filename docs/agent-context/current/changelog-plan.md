# Changelog Plan: Phase 44 — Feedback System

## Candidate User-Facing Summary

Players can now report an issue from inside a level. Reports include the current level, blocks, and runtime state so maintainers can reproduce problems more easily, and reports queue locally if sending fails.

## Candidate Highlights

- Added an in-game Report Issue flow.
- Attached current game state and route context to feedback reports.
- Added a real `/api/feedback` endpoint and persistence for feedback context.
- Preserved local-first queueing for offline or failed submissions.

## Non-User-Facing Notes

- Screenshot capture remains deferred.
- Admin dashboard and triage workflows remain deferred.
- The feedback queue still uses localStorage because this first slice is state/text only.

## Validation Notes To Include Internally

- Feedback context, queue behavior, API validation, and modal behavior have focused test coverage.
- Targeted Playwright coverage verifies a report from a playable level includes route/program/state context.
