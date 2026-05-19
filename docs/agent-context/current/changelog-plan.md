# Changelog Plan: Phase 44 — Feedback System

## Candidate User-Facing Summary

Players can report an issue from inside a level, and signed-in parents/maintainers can review recent reports from Settings. Reports include the current level, blocks, and runtime state so problems are easier to reproduce.

## Candidate Highlights

- Added an in-game Report Issue flow.
- Attached current game state and route context to feedback reports.
- Added a real `/api/feedback` endpoint and persistence for feedback context.
- Added a Feedback Inbox under Settings for signed-in users.
- Added safe parsing and display of feedback context, including legacy/invalid fallback states.

## Non-User-Facing Notes

- Screenshot capture remains deferred.
- Feedback status/resolution workflow remains deferred.
- Creator-facing lightweight feedback remains separate future work.
- The feedback queue still uses localStorage because this phase is state/text only.

## Validation Notes To Include Internally

- Feedback context, queue behavior, API validation, modal behavior, and inbox parsing/loading have focused test coverage.
- Targeted Playwright coverage verifies a report from a playable level includes route/program/state context.
