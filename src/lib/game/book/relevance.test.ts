import { describe, expect, it } from 'vitest';
import { THE_FIELD_GUIDE } from './content';
import { mergeFieldGuide } from './merge';
import { findRelatedFieldGuideTarget } from './relevance';
import type { Book } from './schema';
import type { LevelDefinition, LevelPack } from '$lib/game/types';

const BASE_LEVEL: LevelDefinition = {
	id: 'level-1',
	name: 'Test Level',
	gridSize: { width: 3, height: 3 },
	start: { x: 0, y: 0 },
	startOrientation: 'E',
	goal: { x: 2, y: 0 },
	layout: {},
	availableBlocks: {}
};

const BASE_PACK: LevelPack = {
	id: 'pack-1',
	name: 'Test Pack',
	difficulty: 'beginner',
	tags: [],
	version: '1.0.0',
	levels: []
};

const PACK_GUIDE: Book = {
	chapters: [
		{
			id: 'designer-notes',
			title: 'Designer Notes',
			pages: [
				{
					id: 'special-rules',
					title: 'Special Rules',
					content: [{ type: 'text', content: 'Use the lava tiles carefully.', voice: 'jonas' }]
				}
			]
		}
	]
};

function createLevel(overrides: Partial<LevelDefinition> = {}): LevelDefinition {
	return {
		...BASE_LEVEL,
		...overrides,
		availableBlocks: overrides.availableBlocks ?? BASE_LEVEL.availableBlocks
	};
}

function createPack(overrides: Partial<LevelPack> = {}): LevelPack {
	return {
		...BASE_PACK,
		...overrides
	};
}

describe('findRelatedFieldGuideTarget', () => {
	it('returns the movement guide target when move-forward is available', () => {
		const target = findRelatedFieldGuideTarget({
			book: THE_FIELD_GUIDE,
			level: createLevel({ availableBlocks: { 'move-forward': 'unlimited' } })
		});

		expect(target).toEqual({ chapterId: 'basics', pageId: 'movement' });
	});

	it('returns the turning guide target when turn-left is available', () => {
		const target = findRelatedFieldGuideTarget({
			book: THE_FIELD_GUIDE,
			level: createLevel({ availableBlocks: { 'turn-left': 'unlimited' } })
		});

		expect(target).toEqual({ chapterId: 'basics', pageId: 'turning' });
	});

	it('returns the turning guide target when turn-right is available', () => {
		const target = findRelatedFieldGuideTarget({
			book: THE_FIELD_GUIDE,
			level: createLevel({ availableBlocks: { 'turn-right': 'unlimited' } })
		});

		expect(target).toEqual({ chapterId: 'basics', pageId: 'turning' });
	});

	it('returns the loop guide target when loop is available', () => {
		const target = findRelatedFieldGuideTarget({
			book: THE_FIELD_GUIDE,
			level: createLevel({ availableBlocks: { loop: 'unlimited' } })
		});

		expect(target).toEqual({ chapterId: 'automation', pageId: 'loops' });
	});

	it('prioritizes loop guidance when loop appears with basic movement blocks', () => {
		const target = findRelatedFieldGuideTarget({
			book: THE_FIELD_GUIDE,
			level: createLevel({
				availableBlocks: { 'move-forward': 'unlimited', 'turn-left': 'unlimited', loop: 1 }
			})
		});

		expect(target).toEqual({ chapterId: 'automation', pageId: 'loops' });
	});

	it('uses a loops pack tag as a low-friction relevance signal', () => {
		const target = findRelatedFieldGuideTarget({
			book: THE_FIELD_GUIDE,
			level: createLevel(),
			pack: createPack({ tags: ['Loops'] })
		});

		expect(target).toEqual({ chapterId: 'automation', pageId: 'loops' });
	});

	it('prioritizes the first pack-authored guide page for custom pack tile context', () => {
		const target = findRelatedFieldGuideTarget({
			book: mergeFieldGuide(PACK_GUIDE),
			level: createLevel({ availableBlocks: { 'move-forward': 'unlimited' } }),
			pack: createPack({
				guide: PACK_GUIDE,
				customTiles: {
					lava: {
						id: 'lava',
						name: 'Lava',
						type: 'hazard',
						onEnter: 'damage',
						visuals: { color: '#f97316' }
					}
				}
			})
		});

		expect(target).toEqual({ chapterId: 'pack:designer-notes', pageId: 'pack:special-rules' });
	});

	it('prioritizes the first pack-authored guide page for custom level item context', () => {
		const target = findRelatedFieldGuideTarget({
			book: mergeFieldGuide(PACK_GUIDE),
			level: createLevel({
				availableBlocks: { loop: 'unlimited' },
				customItems: {
					gem: {
						id: 'gem',
						name: 'Gem',
						behavior: 'collectible',
						visuals: { icon: '💎', color: '#38bdf8' }
					}
				}
			})
		});

		expect(target).toEqual({ chapterId: 'pack:designer-notes', pageId: 'pack:special-rules' });
	});

	it('falls back to built-in targets when custom context has no pack-authored guide page', () => {
		const target = findRelatedFieldGuideTarget({
			book: THE_FIELD_GUIDE,
			level: createLevel({
				availableBlocks: { 'move-forward': 'unlimited' },
				customTiles: {
					mud: {
						id: 'mud',
						name: 'Mud',
						type: 'floor',
						visuals: { color: '#92400e' }
					}
				}
			})
		});

		expect(target).toEqual({ chapterId: 'basics', pageId: 'movement' });
	});

	it('returns null for unknown block-only context', () => {
		const target = findRelatedFieldGuideTarget({
			book: THE_FIELD_GUIDE,
			level: createLevel({ availableBlocks: { call: 'unlimited' } })
		});

		expect(target).toBeNull();
	});

	it('does not prioritize pack-authored guide pages without custom context', () => {
		const target = findRelatedFieldGuideTarget({
			book: mergeFieldGuide(PACK_GUIDE),
			level: createLevel({ availableBlocks: { 'move-forward': 'unlimited' } }),
			pack: createPack({ guide: PACK_GUIDE })
		});

		expect(target).toEqual({ chapterId: 'basics', pageId: 'movement' });
	});

	it('filters built-in targets that do not exist in the active guide', () => {
		const guideWithoutMovement: Book = {
			chapters: [
				{
					...THE_FIELD_GUIDE.chapters[0],
					pages: THE_FIELD_GUIDE.chapters[0].pages.filter((page) => page.id !== 'movement')
				},
				...THE_FIELD_GUIDE.chapters.slice(1)
			]
		};

		const target = findRelatedFieldGuideTarget({
			book: guideWithoutMovement,
			level: createLevel({ availableBlocks: { 'move-forward': 'unlimited' } })
		});

		expect(target).toBeNull();
	});
});
