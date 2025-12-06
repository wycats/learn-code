import type { LevelPack, LevelDefinition } from '$lib/game/schema';
import type { UserProgress, LevelResult } from '$lib/game/progress';

export class SyncService {
	/**
	 * Merges two UserProgress objects using a "Best Score Wins" strategy.
	 * This is safe because progress is additive/monotonic (you can't "un-complete" a level).
	 */
	static mergeProgress(local: UserProgress, remote: UserProgress): UserProgress {
		const merged: UserProgress = { packs: { ...local.packs } };

		for (const [packId, remotePack] of Object.entries(remote.packs)) {
			const localPack = merged.packs[packId];

			if (!localPack) {
				// New pack from remote
				merged.packs[packId] = remotePack;
				continue;
			}

			// Merge levels
			for (const [levelId, remoteResult] of Object.entries(remotePack.levels)) {
				const localResult = localPack.levels[levelId];

				if (!localResult) {
					// New level result from remote
					localPack.levels[levelId] = remoteResult;
					continue;
				}

				// Compare and keep the best result
				if (this.isBetterResult(remoteResult, localResult)) {
					localPack.levels[levelId] = remoteResult;
				}
			}

			// Merge unlocked status (if either is unlocked, it's unlocked)
			if (remotePack.unlocked) {
				localPack.unlocked = true;
			}
		}

		return merged;
	}

	/**
	 * Determines if result A is "better" than result B.
	 * Criteria:
	 * 1. Completion (Completed > Not Completed)
	 * 2. Stars (Higher is better)
	 * 3. Block Count (Lower is better, if stars are equal)
	 * 4. Timestamp (Newer is better, if everything else is equal)
	 */
	private static isBetterResult(a: LevelResult, b: LevelResult): boolean {
		if (a.completed && !b.completed) return true;
		if (!a.completed && b.completed) return false;

		if (a.stars > b.stars) return true;
		if (a.stars < b.stars) return false;

		// Stars are equal, check block count (lower is better)
		const aBlocks = a.blockCount ?? Infinity;
		const bBlocks = b.blockCount ?? Infinity;
		if (aBlocks < bBlocks) return true;
		if (aBlocks > bBlocks) return false;

		// Everything equal, prefer newer
		return a.timestamp > b.timestamp;
	}

	/**
	 * Compares two vector clocks.
	 * Returns:
	 * - 'equal': Clocks are identical
	 * - 'local-newer': Local dominates Remote (Local >= Remote)
	 * - 'remote-newer': Remote dominates Local (Remote >= Local)
	 * - 'concurrent': Neither dominates the other (Conflict)
	 */
	static compareVectorClocks(
		local: Record<string, number> = {},
		remote: Record<string, number> = {}
	): 'equal' | 'local-newer' | 'remote-newer' | 'concurrent' {
		let localHasGreater = false;
		let remoteHasGreater = false;

		for (const actor in local) {
			const lVal = local[actor];
			const rVal = remote[actor] || 0;

			if (lVal > rVal) localHasGreater = true;
			else if (rVal > lVal) remoteHasGreater = true;

			if (localHasGreater && remoteHasGreater) return 'concurrent';
		}

		for (const actor in remote) {
			if (local[actor] !== undefined) continue; // Already checked

			const rVal = remote[actor];
			if (rVal > 0) remoteHasGreater = true;

			if (localHasGreater && remoteHasGreater) return 'concurrent';
		}

		if (!localHasGreater && !remoteHasGreater) return 'equal';
		if (localHasGreater) return 'local-newer';
		return 'remote-newer';
	}

	/**
	 * Merges two LevelPacks (e.g., custom packs created by the user).
	 * Strategy: Vector Clock Causality.
	 *
	 * If a level exists in both:
	 * 1. Compare Vector Clocks.
	 * 2. If one dominates, keep the newer one.
	 * 3. If concurrent, keep Remote and copy Local to a "Conflict Copy".
	 */
	static mergePacks(local: LevelPack, remote: LevelPack): LevelPack {
		// If IDs don't match, we shouldn't be merging them
		if (local.id !== remote.id) {
			throw new Error('Cannot merge packs with different IDs');
		}

		const merged: LevelPack = {
			...local,
			// Metadata: Last Write Wins based on updated timestamp
			name: (remote.updated || 0) > (local.updated || 0) ? remote.name : local.name,
			description:
				(remote.updated || 0) > (local.updated || 0) ? remote.description : local.description,
			updated: Math.max(local.updated || 0, remote.updated || 0),
			// Start with local levels, we will update/append as needed
			levels: [...local.levels]
		};

		for (const remoteLevel of remote.levels) {
			const localLevelIndex = merged.levels.findIndex((l) => l.id === remoteLevel.id);

			if (localLevelIndex === -1) {
				// Level only exists in remote, add it
				merged.levels.push(remoteLevel);
			} else {
				const localLevel = merged.levels[localLevelIndex];

				// Optimization: If versionIds match, they are the same (assuming no collisions)
				if (localLevel.versionId === remoteLevel.versionId) {
					continue;
				}

				const comparison = this.compareVectorClocks(
					localLevel.vectorClock,
					remoteLevel.vectorClock
				);

				switch (comparison) {
					case 'equal':
						// Should be caught by versionId check, but just in case
						break;
					case 'remote-newer':
						// Fast-forward: Remote is newer
						merged.levels[localLevelIndex] = remoteLevel;
						break;
					case 'local-newer':
						// Local is newer, keep it (do nothing)
						break;
					case 'concurrent': {
						// Conflict!
						// We keep the remote version in place (to ensure convergence if multiple peers merge)
						// And we move the local version to a copy
						const conflictCopy: LevelDefinition = {
							...localLevel,
							id: crypto.randomUUID(), // New ID for the copy
							versionId: crypto.randomUUID(), // New version for the copy
							// We reset the vector clock for the copy because it's effectively a new level
							// starting from this state. Or should we keep it?
							// If we keep it, it might look "older" than future edits.
							// Let's start fresh for the copy to avoid confusion.
							vectorClock: { ...localLevel.vectorClock },
							name: `${localLevel.name} (Conflict Copy)`
						};
						merged.levels[localLevelIndex] = remoteLevel;
						merged.levels.push(conflictCopy);
						break;
					}
				}
			}
		}

		return merged;
	}
}
