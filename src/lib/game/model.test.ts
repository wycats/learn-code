import { describe, it, expect, beforeEach } from 'vitest';
import { GameModel } from './model.svelte';
import type { LevelDefinition } from './types';

const MOCK_LEVEL: LevelDefinition = {
	id: 'test-level',
	name: 'Test Level',
	gridSize: { width: 5, height: 5 },
	layout: {},
	availableBlocks: { 'move-forward': 5 },
	solutionPar: 5,
	start: { x: 0, y: 0 },
	startOrientation: 'E',
	goal: { x: 4, y: 4 },
	items: {}
};

describe('GameModel', () => {
	let game: GameModel;

	beforeEach(() => {
		game = new GameModel(MOCK_LEVEL);
	});

	describe('Initialization', () => {
		it('should initialize with correct defaults', () => {
			expect(game.status).toBe('goal'); // Starts in goal/story mode usually
			expect(game.program).toEqual([]);
			expect(game.characterPosition).toEqual(MOCK_LEVEL.start);
			expect(game.characterOrientation).toBe('E');
		});

		it('should load initial program if provided', () => {
			const levelWithCode = {
				...MOCK_LEVEL,
				initialProgram: [{ id: '1', type: 'move-forward' }]
			} as LevelDefinition;
			const g = new GameModel(levelWithCode);
			expect(g.program).toHaveLength(1);
			expect(g.program[0].type).toBe('move-forward');
		});
	});

	describe('Program Management', () => {
		beforeEach(() => {
			game.status = 'planning'; // Enable editing
		});

		it('should add blocks', () => {
			game.addBlock({ id: '1', type: 'move-forward' });
			expect(game.program).toHaveLength(1);
			expect(game.program[0].type).toBe('move-forward');
		});

		it('should delete blocks', () => {
			game.addBlock({ id: '1', type: 'move-forward' });
			game.deleteBlock('1');
			expect(game.program).toHaveLength(0);
		});

		it('should update blocks', () => {
			game.addBlock({ id: '1', type: 'loop', count: 2 });
			game.updateBlock('1', { count: 5 });
			expect(game.program[0].count).toBe(5);
		});

		it('should clear program', () => {
			game.addBlock({ id: '1', type: 'move-forward' });
			game.clearProgram();
			expect(game.program).toHaveLength(0);
		});
	});

	describe('History (Undo/Redo)', () => {
		beforeEach(() => {
			game.status = 'planning';
		});

		it('should undo actions', () => {
			game.addBlock({ id: '1', type: 'move-forward' });
			expect(game.program).toHaveLength(1);

			game.undo();
			expect(game.program).toHaveLength(0);
		});

		it('should redo actions', () => {
			game.addBlock({ id: '1', type: 'move-forward' });
			game.undo();
			expect(game.program).toHaveLength(0);

			game.redo();
			expect(game.program).toHaveLength(1);
		});

		it('should clear redo stack on new action', () => {
			game.addBlock({ id: '1', type: 'move-forward' });
			game.undo();
			game.addBlock({ id: '2', type: 'turn-left' });

			expect(game.canRedo).toBe(false);
			game.redo(); // Should do nothing
			expect(game.program).toHaveLength(1);
			expect(game.program[0].type).toBe('turn-left');
		});
	});

	describe('Execution State', () => {
		it('should reset execution state', () => {
			game.executionState.set('1', 'success');
			game.loopProgress.set('1', 2);

			game.resetExecutionState();

			expect(game.executionState.size).toBe(0);
			expect(game.loopProgress.size).toBe(0);
		});
	});
});
