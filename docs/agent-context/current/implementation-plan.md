# Implementation Plan: Phase 44 — Feedback System

## Status

PER 1 State Dump Feedback is implemented as the first Phase 44 slice. It adds a visible in-game report flow, captures current level/program/runtime context, submits to a real API endpoint, and preserves local-first queueing for offline or failed sends. Screenshot capture remains deferred.

## Phase Goal

Create a robust feedback loop that helps Jonas, Zoey, parents, and maintainers report issues with enough context to reproduce them.

## Implemented Scope

### In-Game Report Flow

- Added a `Report Issue` action to the game header.
- Added a feedback modal with a required message, optional email, and explicit copy that the current level, blocks, and runtime state are attached.
- Uses existing toast notifications for sent and queued states.

### State Dump Context

- Added a serializable feedback context helper for `GameModel` state.
- Captures route metadata, level JSON, current program/functions, game status, character state, held item/vehicle, collected items, execution maps, hint/story state, browser context, and interpreter stack/phase when available.
- Passes pack/level context from canonical play routes and shared-level context from the QR/shared play route.

### Local-First Feedback Service

- Updated `FeedbackService` to accept full payloads instead of only message/email.
- Preserves localStorage queueing for offline or failed sends.
- Flushes queued items when online.
- Drops invalid 4xx queued submissions instead of retrying forever.
- Keeps queue size bounded.

### Server Endpoint and Persistence

- Added `/api/feedback` with payload validation and request-size limit.
- Stores message, optional email, URL, pack/level ids, serialized context, and optional user/profile ids.
- Added a migration and schema fields for feedback context.
- Uses idempotent insert behavior for repeated feedback IDs.

## Out of Scope

- Screenshot capture and image/blob storage.
- Admin dashboard or triage workflow.
- GitHub issue creation.
- Comment threads or feedback resolution states.
- True service-worker background flush after app close.
- Broad cloud sync or analytics changes.

## Validation Plan

- `PROTO_NODE_VERSION=24 pnpm exec vitest --run src/lib/game/feedback-context.test.ts src/lib/services/feedback.test.ts src/routes/api/feedback/server.test.ts`
- `PROTO_NODE_VERSION=24 pnpm exec playwright test e2e/feedback.spec.ts --project=chromium`
- `PROTO_NODE_VERSION=24 pnpm check`
- `PROTO_NODE_VERSION=24 pnpm lint`
- `PROTO_NODE_VERSION=24 pnpm build`
- `git diff --check`

## Validation State

- Focused feedback unit/component/API tests passed.
- Targeted feedback Playwright coverage passed after warming the production preview build.
- `PROTO_NODE_VERSION=24 pnpm check` passed with existing unrelated warnings.
- `PROTO_NODE_VERSION=24 pnpm lint` passed.
- `PROTO_NODE_VERSION=24 pnpm build` passed with existing unrelated warnings and the adapter-auto notice.
- `git diff --check` passed.
- Local visual review accepted the feedback UI as reasonable for this slice.
