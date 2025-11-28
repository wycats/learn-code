import type { LevelDefinition } from '$lib/game/types';

export const Level1: LevelDefinition = {
	id: 'level-1',
	name: 'First Steps',
	gridSize: { width: 5, height: 5 },
	start: { x: 1, y: 2 },
	startOrientation: 'E',
	goal: { x: 3, y: 2 },
	layout: {},
	availableBlocks: {
		'move-forward': 'unlimited',
		'turn-left': 'unlimited',
		'turn-right': 'unlimited'
	},
	solutionPar: 2
};

export const Levels = [Level1];
