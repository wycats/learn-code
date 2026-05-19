# Implementation Plan: Phase 44 — Feedback System

## Status

PER 1 State Dump Feedback is implemented and merged. PER 2 Feedback Triage is implemented, visually reviewed, and ready for PR. Screenshot capture remains deferred.

## Phase Goal

Create a robust feedback loop that helps Jonas, Zoey, parents, and maintainers report issues with enough context to reproduce them, then inspect those reports without needing direct database access.

## Completed PER 1 Scope

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

## Implemented PER 2 Scope

### Feedback Inbox Route

- Added `/settings/feedback` as a signed-in parent/user feedback inbox.
- Anonymous users redirect to `/login`.
- Selected child profile is not required.
- The route lists the newest 50 reports.

### Triage Display

- Shows report cards with timestamp, message preview, context parse status, pack/level/url, optional email, and optional user/profile ids.
- Expands each report to show the full message, level summary, game status, failed attempts, active block, program/function counts, browser metadata, interpreter summary, and raw JSON/context text.
- Handles empty, malformed, or structurally invalid legacy context without crashing.

### Settings Entry Point

- Adds a Feedback Inbox link to Settings for signed-in users.

## Out of Scope

- Screenshot capture and image/blob storage.
- Feedback status/resolution workflow.
- Delete/archive/mutate feedback rows.
- Pagination, filters, search, assignment, or comments.
- GitHub issue creation.
- New admin role schema or allowlist system.
- True service-worker background flush after app close.
- Broad cloud sync or analytics changes.

## Validation Plan

- `PROTO_NODE_VERSION=24 pnpm exec vitest --run src/lib/server/feedback-inbox.test.ts src/routes/settings/feedback/server.test.ts src/routes/settings/feedback/route-smoke.test.ts src/routes/api/feedback/server.test.ts`
- `PROTO_NODE_VERSION=24 pnpm check`
- `PROTO_NODE_VERSION=24 pnpm lint`
- `PROTO_NODE_VERSION=24 pnpm build`
- `git diff --check`

## Validation State

- Focused triage unit/server tests passed.
- `PROTO_NODE_VERSION=24 pnpm check` passed with existing unrelated warnings.
- `PROTO_NODE_VERSION=24 pnpm lint` passed.
- `PROTO_NODE_VERSION=24 pnpm build` passed with existing unrelated warnings and the adapter-auto notice.
- `git diff --check` passed.
- Manual visual review accepted the Settings entry point, the Feedback Inbox report layout, raw context disclosure, and responsive/dark-mode polish. Anonymous redirect and empty/invalid-state browser checks remain good follow-up targets.
