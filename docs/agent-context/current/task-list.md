# Task List: Phase 44 — Feedback System

## PER 1 — State Dump Feedback

- [x] Keep first slice to state dump + queue + endpoint.
- [x] Defer screenshot capture.
- [x] Add in-game `Report Issue` entry point.
- [x] Add feedback modal with required message and optional email.
- [x] Explain attached level, blocks, and runtime state.
- [x] Capture route metadata, level JSON, program/functions, game runtime state, interpreter stack/phase, and browser metadata.
- [x] Update feedback service to submit full payloads.
- [x] Preserve localStorage queueing and online flush.
- [x] Add `/api/feedback` endpoint and persistence fields.
- [x] Validate with focused tests, Playwright, check, lint, build, and diff check.
- [x] Manual local visual review accepted the feedback UI as reasonable.

## PER 2 — Feedback Triage

- [x] Add signed-in feedback inbox at `/settings/feedback`.
- [x] Redirect anonymous visitors to `/login`.
- [x] Avoid new roles/admin schema for this slice.
- [x] Add Settings entry point for signed-in users.
- [x] Query newest 50 feedback reports.
- [x] Summarize valid feedback context.
- [x] Safely handle empty, malformed, or invalid legacy context.
- [x] Show message, route metadata, level summary, game status, failed attempts, active block, program/function counts, browser metadata, interpreter summary, and raw JSON/context text.

## PER 2 Validation

- [x] `PROTO_NODE_VERSION=24 pnpm exec vitest --run src/lib/server/feedback-inbox.test.ts src/routes/settings/feedback/server.test.ts src/routes/settings/feedback/route-smoke.test.ts src/routes/api/feedback/server.test.ts`
- [x] `PROTO_NODE_VERSION=24 pnpm check`
- [x] `PROTO_NODE_VERSION=24 pnpm lint`
- [x] `git diff --check`
- [x] `PROTO_NODE_VERSION=24 pnpm build`

## PER 2 Manual Visual Review Checklist

- [x] Settings shows Feedback Inbox only when signed in.
- [ ] Anonymous `/settings/feedback` redirects to login.
- [ ] Empty inbox is clear and calm.
- [ ] Long report messages wrap safely.
- [x] Valid context shows useful level/game/browser/interpreter summary.
- [ ] Invalid or legacy context shows a fallback without crashing.
- [x] Raw context remains behind `<details>` and is readable.
- [x] Mobile and dark mode remain usable.

## Follow-Up Topics

- [ ] Screenshot capture and storage.
- [ ] Feedback status/resolution workflow.
- [ ] Feedback filters/search/pagination.
- [ ] Admin role or allowlist model if feedback becomes sensitive beyond parent-only access.
- [ ] Creator-facing lightweight feedback separate from maintainer issue reports.
