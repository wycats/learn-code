import type { LevelDefinition } from '$lib/game/types';

export const Level1: LevelDefinition = {
	id: 'level-1',
	name: 'First Steps',
	gridSize: { width: 5, height: 5 },
	start: { x: 1, y: 2 }, // 0-indexed
	goal: { x: 3, y: 2 },
	walls: [],
	availableBlocks: ['move-right', 'move-up'],
	solutionPar: 2
};

export const Levels = [Level1];
