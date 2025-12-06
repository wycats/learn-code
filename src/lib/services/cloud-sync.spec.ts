import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CloudSyncService, syncStatus, type SyncUpdate } from './cloud-sync';
import { ProgressService } from '$lib/game/progress';
import { get } from 'svelte/store';

// Mock dependencies
vi.mock('$lib/game/progress', () => ({
	ProgressService: {
		load: vi.fn(),
		save: vi.fn()
	}
}));

vi.mock('$lib/game/packs', () => ({
	PACKS: [
		{
			id: 'pack-1',
			levels: [{ id: 'level-1' }, { id: 'level-2' }]
		}
	]
}));

// Mock global fetch
const globalFetch = vi.fn();
global.fetch = globalFetch;

describe('CloudSyncService', () => {
	beforeEach(() => {
		vi.resetAllMocks();
		syncStatus.set('idle');
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe('push', () => {
		it('should not push if updates are empty', async () => {
			await CloudSyncService.push([]);
			expect(globalFetch).not.toHaveBeenCalled();
		});

		it('should push updates to the server', async () => {
			const updates: SyncUpdate[] = [
				{ levelId: 'level-1', status: 'completed', stars: 3, updatedAt: new Date().toISOString() }
			];

			globalFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ synced: [] })
			});

			await CloudSyncService.push(updates);

			expect(globalFetch).toHaveBeenCalledWith(
				'/api/sync',
				expect.objectContaining({
					method: 'POST',
					body: JSON.stringify({ updates })
				})
			);
		});

		it('should handle server errors during push', async () => {
			const updates: SyncUpdate[] = [
				{ levelId: 'level-1', status: 'completed', stars: 3, updatedAt: new Date().toISOString() }
			];
			globalFetch.mockResolvedValueOnce({
				ok: false,
				status: 500
			});

			await CloudSyncService.push(updates);

			expect(globalFetch).toHaveBeenCalled();
			expect(get(syncStatus)).toBe('error');
		});
	});

	describe('pull', () => {
		it('should pull remote progress and merge it', async () => {
			const remoteProgress = [
				{ levelId: 'level-1', status: 'completed', stars: 3, updatedAt: new Date().toISOString() }
			];
			globalFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ progress: remoteProgress })
			});

			// Mock local progress
			vi.mocked(ProgressService.load).mockReturnValue({
				packs: {
					'pack-1': {
						levels: {},
						unlocked: true
					}
				}
			});

			await CloudSyncService.pull();

			expect(globalFetch).toHaveBeenCalledWith('/api/sync');
			expect(ProgressService.save).toHaveBeenCalled();

			const saveCall = vi.mocked(ProgressService.save).mock.calls[0][0];
			expect(saveCall.packs['pack-1'].levels['level-1']).toBeDefined();
			expect(saveCall.packs['pack-1'].levels['level-1'].stars).toBe(3);
		});

		it('should handle server errors during pull', async () => {
			globalFetch.mockResolvedValueOnce({
				ok: false,
				status: 500
			});

			await CloudSyncService.pull();

			expect(globalFetch).toHaveBeenCalled();
			expect(get(syncStatus)).toBe('error');
		});
	});
});
