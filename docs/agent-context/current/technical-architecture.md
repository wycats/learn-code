# Technical Architecture: Phase 44 — Feedback System

## Architecture Summary

Phase 44 now has a submission path and a first triage path. The system captures structured feedback context from gameplay, persists it server-side, and exposes recent reports to signed-in parents/users from Settings.

## Submission Flow

1. `Game.svelte` owns the `Report Issue` action because it has access to the current `GameModel` and local `StackInterpreter`.
2. `createFeedbackContext()` converts live game/interpreter state into a serializable payload.
3. `FeedbackModal.svelte` collects a message and optional email and explains the attached context.
4. `FeedbackService.submit()` sends immediately when online or queues locally on failure/offline.
5. `FeedbackService.flushQueue()` retries queued feedback on future online events.
6. `/api/feedback` validates, limits, and persists accepted feedback.

## Triage Flow

1. `/settings/feedback` requires `locals.user` and redirects anonymous visitors to `/login`.
2. The server load queries the newest 50 reports from the `feedback` table.
3. `toFeedbackInboxReport()` converts rows into render-safe report summaries.
4. `summarizeFeedbackContext()` parses and validates serialized context using `FeedbackContextSchema`.
5. The Svelte page renders list/detail cards and keeps raw context behind a disclosure.

## Context Boundary

The context deliberately includes game reproduction state but excludes sensitive account/session data:

- includes route, level, program/functions, runtime state, interpreter stack/phase, and browser online/viewport metadata;
- excludes auth tokens, cookies, local file-system handles, and screenshots.

## Safety and Compatibility

- Context is rendered through Svelte text interpolation, not `{@html}`.
- Empty legacy contexts and malformed context strings are rendered as safe fallback states.
- Feedback rows remain useful even when serialized context cannot be parsed.
- No triage mutations are available in this slice.

## Persistence Flow

- Feedback rows store searchable route metadata plus serialized context JSON.
- `onConflictDoNothing()` makes repeated feedback ids idempotent.
- The first slice keeps localStorage queueing because screenshot/blob storage is deferred.

## Test Coverage

- Unit coverage for context serialization.
- Unit coverage for queue/send/flush behavior.
- API route coverage for valid, invalid, and oversized payloads.
- Component coverage for feedback modal consent copy and submit path.
- E2E coverage for submitting feedback from a playable level.
- Unit/server coverage for inbox parsing and `/settings/feedback` loading.
