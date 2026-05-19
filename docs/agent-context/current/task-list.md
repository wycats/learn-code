# Task List: Phase 44 — Feedback System

## Execute Slice

- [x] Keep first slice to state dump + queue + endpoint.
- [x] Defer screenshot capture.
- [x] Leave local `.vscode/settings.json` and `locald.toml` untouched.

## Feedback UI

- [x] Add in-game `Report Issue` entry point.
- [x] Add feedback modal.
- [x] Require message.
- [x] Allow optional email.
- [x] Explain attached level, blocks, and runtime state.
- [x] Notify users when feedback is sent or queued.

## Context Capture

- [x] Capture route metadata.
- [x] Capture level JSON.
- [x] Capture current program/functions.
- [x] Capture game runtime state.
- [x] Capture interpreter stack/phase when available.
- [x] Capture browser online/viewport metadata.

## Service and API

- [x] Update feedback service to submit full payloads.
- [x] Preserve localStorage queueing.
- [x] Flush queue when online.
- [x] Add `/api/feedback` endpoint.
- [x] Validate payloads and enforce a size limit.
- [x] Persist context metadata and serialized context.
- [x] Add database migration for context fields.

## Validation

- [x] `PROTO_NODE_VERSION=24 pnpm exec vitest --run src/lib/game/feedback-context.test.ts src/lib/services/feedback.test.ts src/routes/api/feedback/server.test.ts src/lib/components/game/FeedbackModal.svelte.test.ts`
- [x] `PROTO_NODE_VERSION=24 pnpm exec playwright test e2e/feedback.spec.ts --project=chromium`
- [x] `PROTO_NODE_VERSION=24 pnpm check`
- [x] `PROTO_NODE_VERSION=24 pnpm lint`
- [x] `PROTO_NODE_VERSION=24 pnpm build`
- [x] `git diff --check`

## Manual Visual Review Checklist

- [ ] `Report Issue` button does not crowd the game header.
- [ ] Modal copy clearly explains attached context.
- [ ] Required message behavior is clear.
- [ ] Optional email field is understandable.
- [ ] Online submit shows success toast.
- [ ] Failed/offline submit shows queued toast.
- [ ] Modal works in light/dark mode and mobile viewport.
- [x] Manual local visual review accepted the feedback UI as reasonable for this slice.
