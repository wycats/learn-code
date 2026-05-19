# Technical Architecture: Phase 44 — Feedback System

## Architecture Summary

The first feedback-system slice connects an in-game report UI to a local-first client service and a server persistence endpoint. It captures structured game context without introducing screenshots, binary storage, admin dashboards, or background sync infrastructure.

## Client Flow

1. `Game.svelte` owns the `Report Issue` action because it has access to the current `GameModel` and local `StackInterpreter`.
2. `createFeedbackContext()` converts live game/interpreter state into a serializable payload.
3. `FeedbackModal.svelte` collects a message and optional email and explains the attached context.
4. `FeedbackService.submit()` sends immediately when online or queues locally on failure/offline.
5. `FeedbackService.flushQueue()` retries queued feedback on future online events.

## Context Boundary

The context deliberately includes game reproduction state but excludes sensitive account/session data:

- includes route, level, program/functions, runtime state, interpreter stack/phase, and browser online/viewport metadata;
- excludes auth tokens, cookies, local file-system handles, and screenshots.

## Persistence Flow

- `/api/feedback` validates payload shape and size.
- Accepted payloads insert into the `feedback` table.
- Feedback rows store searchable route metadata plus serialized context JSON.
- `onConflictDoNothing()` makes repeated feedback ids idempotent.

## Queue Storage

- The first slice keeps localStorage queueing because screenshot/blob storage is deferred.
- Queue size is bounded.
- 4xx invalid submissions are dropped during flush rather than retried forever.
- True background flushing after the app closes remains out of scope because service workers cannot read localStorage.

## Database Changes

- Adds feedback columns for URL, pack id, level id, serialized context, optional user id, and optional profile id.
- Adds a Drizzle migration for the new columns and references.

## Test Coverage

- Unit coverage for context serialization.
- Unit coverage for queue/send/flush behavior.
- API route coverage for valid, invalid, and oversized payloads.
- Component coverage for feedback modal consent copy and submit path.
- E2E coverage for submitting feedback from a playable level.
