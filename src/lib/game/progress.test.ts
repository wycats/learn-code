import { describe, expect, it } from 'vitest';
import { ProgressService, type UserProgress } from './progress';
import type { LevelPack } from './schema';

const CUSTOM_PACK: LevelPack = {
	id: 'custom-pack',
	name: 'Custom Pack',
	difficulty: 'beginner',
	tags: [],
	version: '1.0.0',
	levels: [
		{
			id: 'level-1',
			name: 'Level 1',
			gridSize: { width: 5, height: 5 },
			start: { x: 0, y: 0 },
			startOrientation: 'E',
			goal: { x: 4, y: 0 },
			layout: {},
			availableBlocks: {}
		},
		{
			id: 'level-2',
			name: 'Level 2',
			gridSize: { width: 5, height: 5 },
			start: { x: 0, y: 0 },
			startOrientation: 'E',
			goal: { x: 4, y: 0 },
			layout: {},
			availableBlocks: {}
		},
		{
			id: 'level-3',
			name: 'Level 3',
			gridSize: { width: 5, height: 5 },
			start: { x: 0, y: 0 },
			startOrientation: 'E',
			goal: { x: 4, y: 0 },
			layout: {},
			availableBlocks: {}
		}
	]
};

describe('ProgressService', () => {
	it('uses the provided custom pack to unlock later levels', () => {
		const progress: UserProgress = {
			packs: {
				'custom-pack': {
					unlocked: true,
					levels: {
						'level-1': { completed: true, stars: 3, timestamp: 100 }
					}
				}
			}
		};

		expect(ProgressService.isLevelUnlocked(progress, 'custom-pack', 1, CUSTOM_PACK)).toBe(true);
		expect(ProgressService.isLevelUnlocked(progress, 'custom-pack', 2, CUSTOM_PACK)).toBe(false);
	});
});
