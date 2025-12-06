import { describe, it, expect } from 'vitest';
import { SyncService } from './sync';
import type { UserProgress } from '$lib/game/progress';
import type { LevelPack, LevelDefinition } from '$lib/game/schema';

describe('SyncService', () => {
	describe('mergeProgress', () => {
		it('should merge new packs from remote', () => {
			const local: UserProgress = { packs: {} };
			const remote: UserProgress = {
				packs: {
					pack1: {
						unlocked: true,
						levels: {
							level1: { completed: true, stars: 3, timestamp: 100 }
						}
					}
				}
			};

			const merged = SyncService.mergeProgress(local, remote);
			expect(merged.packs.pack1).toBeDefined();
			expect(merged.packs.pack1.levels.level1.stars).toBe(3);
		});

		it('should merge new level results in existing pack', () => {
			const local: UserProgress = {
				packs: {
					pack1: {
						unlocked: true,
						levels: {
							level1: { completed: true, stars: 3, timestamp: 100 }
						}
					}
				}
			};
			const remote: UserProgress = {
				packs: {
					pack1: {
						unlocked: true,
						levels: {
							level1: { completed: true, stars: 3, timestamp: 100 },
							level2: { completed: true, stars: 2, timestamp: 100 }
						}
					}
				}
			};

			const merged = SyncService.mergeProgress(local, remote);
			expect(merged.packs.pack1.levels.level2).toBeDefined();
			expect(merged.packs.pack1.levels.level2.stars).toBe(2);
		});

		it('should keep better score (stars)', () => {
			const local: UserProgress = {
				packs: {
					pack1: {
						unlocked: true,
						levels: {
							level1: { completed: true, stars: 2, timestamp: 100 }
						}
					}
				}
			};
			const remote: UserProgress = {
				packs: {
					pack1: {
						unlocked: true,
						levels: {
							level1: { completed: true, stars: 3, timestamp: 200 }
						}
					}
				}
			};

			const merged = SyncService.mergeProgress(local, remote);
			expect(merged.packs.pack1.levels.level1.stars).toBe(3);
		});

		it('should keep better score (block count) if stars equal', () => {
			// Remote is better (fewer blocks)
			const local: UserProgress = {
				packs: {
					pack1: {
						unlocked: true,
						levels: {
							level1: { completed: true, stars: 3, blockCount: 10, timestamp: 100 }
						}
					}
				}
			};
			const remote: UserProgress = {
				packs: {
					pack1: {
						unlocked: true,
						levels: {
							level1: { completed: true, stars: 3, blockCount: 5, timestamp: 200 }
						}
					}
				}
			};

			const merged = SyncService.mergeProgress(local, remote);
			expect(merged.packs.pack1.levels.level1.blockCount).toBe(5);

			// Local is better (fewer blocks) - should NOT update
			const local2: UserProgress = {
				packs: {
					pack1: {
						unlocked: true,
						levels: {
							level1: { completed: true, stars: 3, blockCount: 5, timestamp: 200 }
						}
					}
				}
			};
			const remote2: UserProgress = {
				packs: {
					pack1: {
						unlocked: true,
						levels: {
							level1: { completed: true, stars: 3, blockCount: 10, timestamp: 300 }
						}
					}
				}
			};
			const merged2 = SyncService.mergeProgress(local2, remote2);
			expect(merged2.packs.pack1.levels.level1.blockCount).toBe(5);
		});

		it('should use timestamp if stars and blocks are equal', () => {
			const local: UserProgress = {
				packs: {
					pack1: {
						unlocked: true,
						levels: {
							level1: { completed: true, stars: 3, blockCount: 5, timestamp: 100 }
						}
					}
				}
			};
			const remote: UserProgress = {
				packs: {
					pack1: {
						unlocked: true,
						levels: {
							level1: { completed: true, stars: 3, blockCount: 5, timestamp: 200 }
						}
					}
				}
			};

			const merged = SyncService.mergeProgress(local, remote);
			expect(merged.packs.pack1.levels.level1.timestamp).toBe(200);
		});
	});

	describe('mergePacks', () => {
		const baseLevel: LevelDefinition = {
			id: 'level1',
			versionId: 'v1',
			vectorClock: {},
			name: 'Level 1',
			gridSize: { width: 5, height: 5 },
			start: { x: 0, y: 0 },
			startOrientation: 'E',
			goal: { x: 4, y: 4 },
			layout: {},
			availableBlocks: {}
		};

		const basePack: LevelPack = {
			id: 'pack1',
			name: 'My Pack',
			difficulty: 'beginner',
			tags: [],
			version: '1.0.0',
			levels: [baseLevel]
		};

		it('should throw error if pack IDs do not match', () => {
			const local = { ...basePack, id: 'pack1' };
			const remote = { ...basePack, id: 'pack2' };
			expect(() => SyncService.mergePacks(local, remote)).toThrow();
		});

		it('should merge new levels from remote', () => {
			const local = { ...basePack };
			const remote = {
				...basePack,
				levels: [baseLevel, { ...baseLevel, id: 'level2', name: 'Level 2' }]
			};

			const merged = SyncService.mergePacks(local, remote);
			expect(merged.levels).toHaveLength(2);
			expect(merged.levels.find((l) => l.id === 'level2')).toBeDefined();
		});

		it('should replace local with remote if remote is a descendant (Fast Forward)', () => {
			const local = {
				...basePack,
				levels: [{ ...baseLevel, versionId: 'v1', vectorClock: { A: 1 } }]
			};
			const remote = {
				...basePack,
				levels: [{ ...baseLevel, versionId: 'v2', vectorClock: { A: 2 }, name: 'Level 1 (New)' }]
			};

			const merged = SyncService.mergePacks(local, remote);

			expect(merged.levels).toHaveLength(1);
			expect(merged.levels[0].name).toBe('Level 1 (New)');
			expect(merged.levels[0].versionId).toBe('v2');
		});

		it('should keep local if local is a descendant of remote', () => {
			const local = {
				...basePack,
				levels: [
					{
						...baseLevel,
						versionId: 'v2',
						vectorClock: { A: 2 },
						name: 'Level 1 (Newer Local)'
					}
				]
			};
			const remote = {
				...basePack,
				levels: [
					{ ...baseLevel, versionId: 'v1', vectorClock: { A: 1 }, name: 'Level 1 (Old Remote)' }
				]
			};

			const merged = SyncService.mergePacks(local, remote);

			expect(merged.levels).toHaveLength(1);
			expect(merged.levels[0].name).toBe('Level 1 (Newer Local)');
		});

		it('should conflict (keep both) if divergent history', () => {
			const local = {
				...basePack,
				levels: [
					{
						...baseLevel,
						versionId: 'v2a',
						vectorClock: { A: 1, B: 1 },
						name: 'Level 1 (Local Branch)'
					}
				]
			};
			const remote = {
				...basePack,
				levels: [
					{
						...baseLevel,
						versionId: 'v2b',
						vectorClock: { A: 1, C: 1 },
						name: 'Level 1 (Remote Branch)'
					}
				]
			};

			const merged = SyncService.mergePacks(local, remote);

			expect(merged.levels).toHaveLength(2);
			const remoteVer = merged.levels.find((l) => l.name === 'Level 1 (Remote Branch)');
			const localVer = merged.levels.find(
				(l) => l.name === 'Level 1 (Local Branch) (Conflict Copy)'
			);
			expect(remoteVer).toBeDefined();
			expect(localVer).toBeDefined();
		});
	});
});
