# Offline Sync & Conflict Resolution Strategy

## Problem Statement

We support an "Offline-First" experience where users can play and create levels without an account (Anonymous Mode). When they eventually log in (or authorize a device via QR Handshake), we need to reconcile their local anonymous data with the cloud profile data. Additionally, a user might play on multiple devices offline and then sync them later, leading to potential conflicts.

## Goals

1.  **No Data Loss**: Never overwrite user work without confirmation.
2.  **Educational Value**: Use the conflict resolution process to teach "Architect" users (8-12yo) basic version control concepts (branches, merging) in a simplified way.
3.  **Simplicity for Parents**: For the "Parent" persona, the default path should be "Keep Both" or "Use Newest".

## Scenarios

### 1. The "Merge" (Anonymous -> Profile)

- **Context**: User plays anonymously on Tablet A, creating "Level 1". Then they log in to a Profile that already has "Level 2".
- **Desired Outcome**: The Profile now has both "Level 1" and "Level 2".
- **Conflict**: What if the Profile _also_ has a "Level 1" with the same ID but different content?

### 2. The "Sync" (Device A <-> Cloud <-> Device B)

- **Context**: User modifies "Level 1" on Device A (offline). User modifies "Level 1" on Device B (offline). Both come online.
- **Desired Outcome**: Detect the conflict and ask the user to resolve it.

## Proposed Solution: "Git-Lite" for Kids

Instead of opaque "Last Write Wins", we will treat each device as having its own local repository (branch). When devices connect (via Cloud, Local Network, or QR), they perform a **Merge**.

This is a **Distributed / Local-First** model. There is no single "Master" device. The "Cloud" is simply a highly-available peer that helps bridge devices that aren't online simultaneously.

### Conceptual Model

- **Profile**: The shared identity (e.g., "Zoey").
- **Device State**: The version of Zoey's profile on _this_ iPad.
- **Sync**: The process of merging changes from a "Remote" (Cloud, or another Device) into the "Local" state.

### Data Structure

We need to track **Provenance** for each entity (Level, Progress).

```typescript
interface EntityMetadata {
	id: string;
	updatedAt: number; // Wall clock time
	version: number; // Monotonic counter
	deviceId: string; // Where the last edit happened
	baseVersion: number; // The version this edit was based on (for detecting divergence)
}
```

### Conflict Detection Logic

When syncing an entity (e.g., a Level) from a Remote source:

1.  **Fast-Forward**: If `local.baseVersion == remote.version`, simply update remote to `local`.
2.  **Stale**: If `local.version < remote.version`, local is behind. Update local to `remote`.
3.  **Diverged**: If `local.baseVersion < remote.version` AND `local.version > local.baseVersion`, both have changed since the last sync. **CONFLICT**.

_Note: In a purely P2P context, "Remote" is just the other device we are talking to._

### User Interface: The "Merge Room"

When a conflict is detected, we present a "Merge Room" UI.

- **Visuals**: Two versions of the level side-by-side (or top-bottom).
- **Metadata**: "Changed on this iPad just now" vs "Changed on Mom's Phone yesterday".
- **Actions**:
  - "Keep Mine" (Overwrite Remote)
  - "Keep Theirs" (Discard Local)
  - "Keep Both" (Rename Local to "Level 1 (Copy)")

## Implementation Plan

### Phase 1: "Keep Both" (MVP)

For the initial implementation (Phase 31/32), we will adopt a safe default:

- **Progress**: Union of completed levels. If score differs, keep the High Score.
- **Created Levels**: If ID conflict, automatically rename the local one (e.g., "My Level (Imported)").
- **Settings**: Last Write Wins (based on timestamp).

### Phase 2: Interactive Resolution (Future)

- Implement the "Merge Room" UI.
- Track `baseVersion` to correctly identify divergence vs. staleness.

## Open Questions

- **Storage**: How do we store the `baseVersion` efficiently in `localStorage`?
- **Granularity**: Do we sync individual levels or the whole "Save File"? (Likely individual levels).
