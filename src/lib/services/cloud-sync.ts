import { PACKS } from '$lib/game/packs';
import { ProgressService } from '$lib/game/progress';
import { writable } from 'svelte/store';

export interface SyncUpdate {
	levelId: string;
	status: 'locked' | 'unlocked' | 'completed';
	stars: number;
	updatedAt: string;
}

export type SyncState = 'idle' | 'syncing' | 'error' | 'offline';
export const syncStatus = writable<SyncState>('idle');

export class CloudSyncService {
	static async pull() {
		syncStatus.set('syncing');
		try {
			const res = await fetch('/api/sync');
			if (!res.ok) {
				syncStatus.set('error');
				return;
			}
			const data = await res.json();

			if (data.progress) {
				this.mergeFromServer(data.progress);
			}
			syncStatus.set('idle');
		} catch (e) {
			console.error('Sync pull failed', e);
			syncStatus.set('error');
		}
	}

	static async push(updates: SyncUpdate[]) {
		if (updates.length === 0) return;

		syncStatus.set('syncing');
		try {
			const res = await fetch('/api/sync', {
				method: 'POST',
				body: JSON.stringify({ updates }),
				headers: { 'Content-Type': 'application/json' }
			});
			if (!res.ok) {
				syncStatus.set('error');
				return;
			}
			const data = await res.json();

			if (data.synced) {
				this.mergeFromServer(data.synced);
			}
			syncStatus.set('idle');
		} catch (e) {
			console.error('Sync push failed', e);
			syncStatus.set('error');
			// TODO: Queue for offline
		}
	}

	private static mergeFromServer(serverItems: SyncUpdate[]) {
		const local = ProgressService.load();
		let changed = false;

		// Build a map of levelId -> packId for fast lookup
		const levelToPack = new Map<string, string>();
		for (const pack of PACKS) {
			for (const level of pack.levels) {
				levelToPack.set(level.id, pack.id);
			}
		}

		for (const item of serverItems) {
			// item: { levelId, stars, status, updatedAt }
			const packId = levelToPack.get(item.levelId);
			if (!packId) continue; // Unknown level

			if (!local.packs[packId]) {
				local.packs[packId] = { levels: {}, unlocked: false };
			}

			const packProgress = local.packs[packId];
			const existing = packProgress.levels[item.levelId];

			// Server status mapping
			const serverCompleted = item.status === 'completed';

			// If server says completed, and we don't have it or it's better
			if (serverCompleted) {
				if (!existing || !existing.completed || item.stars > existing.stars) {
					packProgress.levels[item.levelId] = {
						completed: true,
						stars: item.stars,
						timestamp: new Date(item.updatedAt).getTime(),
						blockCount: existing?.blockCount // Preserve local block count if we have it
					};
					changed = true;
				}
			}
		}

		if (changed) {
			ProgressService.save(local);
			// Force reload?
			// Ideally we'd have a reactive store.
			// For now, we can dispatch a window event or similar.
			if (typeof window !== 'undefined') {
				window.dispatchEvent(new CustomEvent('kibi-progress-updated'));
			}
		}
	}
}
