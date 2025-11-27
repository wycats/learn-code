import type { LevelDefinition } from './types';

export const LEVEL_1: LevelDefinition = {
	id: 'level-1',
	name: 'Cross the River',
	gridSize: { width: 5, height: 5 },
	start: { x: 0, y: 2 },
	startOrientation: 'E',
	goal: { x: 4, y: 2 },
	layout: {
		'1,0': 'water',
		'1,1': 'water',
		'1,2': 'grass',
		'1,3': 'water',
		'1,4': 'water',
		'3,0': 'wall',
		'3,1': 'wall',
		'3,3': 'wall',
		'3,4': 'wall'
	},
	availableBlocks: ['move-forward', 'turn-left', 'turn-right'],
	solutionPar: 5
};
