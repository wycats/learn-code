# Walkthrough: Phase 44 — Feedback System

## Current Status

PER 1 State Dump Feedback is implemented, validated, reviewed, and merged. PER 2 Feedback Triage is implemented, visually reviewed, and ready for PR. Screenshots and admin workflow remain follow-up topics.

## PER 1: State Dump Feedback

### Report Issue Flow

- The game header includes a `Report Issue` action.
- The feedback modal asks for a required message and optional email.
- The modal explains that the current level, blocks, and runtime state are attached.
- Sent and queued outcomes use the existing toast system.

### Attached Context

The feedback context captures enough information to reproduce the current game state:

- route/source metadata;
- level JSON;
- current main program and functions;
- game status, position, orientation, lives, held item, vehicle, collected items;
- execution and loop progress maps;
- failure/story/hint state;
- interpreter phase and stack when available;
- browser online state and viewport.

### Local-First Queue and Persistence

- Online submissions post to `/api/feedback` immediately.
- Offline or failed submissions are queued in localStorage.
- Queued feedback flushes when the app is online again.
- Invalid 4xx feedback is dropped on flush so it does not retry forever.
- Accepted reports are persisted to the `feedback` table with route metadata and serialized context.

## PER 2: Feedback Triage

### Inbox Route

- `/settings/feedback` is the first triage surface.
- Anonymous visitors are redirected to `/login`.
- Signed-in parents/users can open the inbox without selecting a child profile.
- Settings now links to Feedback Inbox for signed-in users.

### Report Cards

Each feedback card shows:

- created time;
- message preview;
- context parse status;
- pack and level id;
- optional email;
- optional user/profile ids;
- route URL when present.

### Captured Context Detail

Expanded report detail shows:

- full message;
- level name/id;
- game status;
- failed attempts;
- active block;
- program and function counts;
- browser online/language/viewport/user-agent metadata;
- interpreter phase, stack depth, current block/context/frame size when present;
- raw JSON/context text behind `<details>`.

### Legacy/Invalid Context Handling

- Empty `{}` contexts are labeled as legacy empty context.
- Malformed JSON is labeled as malformed.
- Unexpected shapes are labeled as unexpected context shape.
- The page still renders top-level report fields when context cannot be parsed.

## Validation Results

- `PROTO_NODE_VERSION=24 pnpm exec vitest --run src/lib/server/feedback-inbox.test.ts src/routes/settings/feedback/server.test.ts src/routes/settings/feedback/route-smoke.test.ts src/routes/api/feedback/server.test.ts` — passed.
- `PROTO_NODE_VERSION=24 pnpm check` — passed with existing unrelated warnings.
- `PROTO_NODE_VERSION=24 pnpm lint` — passed.
- `PROTO_NODE_VERSION=24 pnpm build` — passed with existing unrelated warnings and the adapter-auto notice.
- `git diff --check` — passed.

## Visual Review Results

- Settings shows the Feedback Inbox entry for the signed-in local parent account.
- The inbox report layout was simplified from a raw database-like view into grouped cards with a title, location, quick summary, and expandable details.
- Captured context remains readable without exposing raw JSON by default; raw context stays behind a disclosure.
- Untrusted feedback URLs are rendered as plain text instead of clickable links.
- Responsive and dark-mode styling were polished for the report list.

## Manual Visual Review Checklist

- [x] Open Settings while signed in and confirm Feedback Inbox appears.
- [x] Open `/settings/feedback` and confirm the report list is clear.
- [x] Open a valid report and confirm the summary is useful.
- [x] Confirm raw JSON stays behind a disclosure.
- [ ] Confirm invalid/legacy contexts are understandable and non-crashy in browser.
- [x] Check mobile width and dark mode.
