import { describe, it, expect, beforeEach, vi } from 'vitest';
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

		it('should insert block after another', () => {
			game.addBlock({ id: '1', type: 'move-forward' });
			game.insertBlockAfter('1', { id: '2', type: 'turn-left' });
			expect(game.program).toHaveLength(2);
			expect(game.program[1].type).toBe('turn-left');
		});

		it('should insert block into container', () => {
			game.addBlock({ id: '1', type: 'loop', children: [] });
			game.insertBlockIntoContainer('1', { id: '2', type: 'move-forward' });
			expect(game.program[0].children).toHaveLength(1);
			expect(game.program[0].children![0].type).toBe('move-forward');
		});

		it('should reorder blocks', () => {
			game.addBlock({ id: '1', type: 'move-forward' });
			game.addBlock({ id: '2', type: 'turn-left' });
			game.reorderBlocks(0, 1); // Move first to second position (actually insert at 1)
			// reorderBlocks(from, to): splice(from, 1), splice(to, 0, block)
			// [1, 2] -> remove 1 -> [2] -> insert at 1 -> [2, 1]
			expect(game.program[0].id).toBe('2');
			expect(game.program[1].id).toBe('1');
		});

		it('should delete multiple blocks', () => {
			game.addBlock({ id: '1', type: 'move-forward' });
			game.addBlock({ id: '2', type: 'turn-left' });
			game.addBlock({ id: '3', type: 'turn-right' });
			game.deleteBlocks(['1', '3']);
			expect(game.program).toHaveLength(1);
			expect(game.program[0].id).toBe('2');
		});

		it('should handle nested block operations', () => {
			// Setup: Loop -> [Move]
			game.addBlock({ id: '1', type: 'loop', children: [{ id: '2', type: 'move-forward' }] });

			// Update nested
			game.updateBlock('2', { type: 'turn-left' });
			expect(game.program[0].children![0].type).toBe('turn-left');

			// Delete nested
			game.deleteBlock('2');
			expect(game.program[0].children).toHaveLength(0);
		});
	});

	describe('Function Management', () => {
		beforeEach(() => {
			game.status = 'planning';
			game.functions = { func1: [] };
		});

		it('should edit function when context is set', () => {
			game.editingContext = 'func1';
			game.addBlock({ id: '1', type: 'move-forward' });

			expect(game.program).toHaveLength(0); // Main program empty
			expect(game.functions['func1']).toHaveLength(1);
			expect(game.functions['func1'][0].type).toBe('move-forward');
		});

		it('should switch back to main program', () => {
			game.editingContext = 'func1';
			game.addBlock({ id: '1', type: 'move-forward' });

			game.editingContext = null;
			game.addBlock({ id: '2', type: 'turn-left' });

			expect(game.program).toHaveLength(1);
			expect(game.program[0].type).toBe('turn-left');
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

		it('should track function edits in history', () => {
			game.editingContext = 'func1';
			game.functions = { func1: [] };

			game.addBlock({ id: '1', type: 'move-forward' });
			expect(game.functions['func1']).toHaveLength(1);

			game.undo();
			expect(game.functions['func1']).toHaveLength(0);

			game.redo();
			expect(game.functions['func1']).toHaveLength(1);
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

	describe('Story & Triggers', () => {
		it('should advance story on block placement if condition met', () => {
			const levelWithStory: LevelDefinition = {
				...MOCK_LEVEL,
				intro: [
					{
						id: 's1',
						text: 'Place a move block',
						speaker: 'Narrator',
						advanceCondition: { type: 'block-placed', blockType: 'move-forward' }
					},
					{ id: 's2', text: 'Done', speaker: 'Narrator' }
				]
			};
			const g = new GameModel(levelWithStory);
			g.status = 'story'; // Must be in story mode

			expect(g.storyIndex).toBe(0);

			g.addBlock({ id: '1', type: 'move-forward' });
			expect(g.storyIndex).toBe(1);
		});

		it('should not advance story if condition not met', () => {
			const levelWithStory: LevelDefinition = {
				...MOCK_LEVEL,
				intro: [
					{
						id: 's1',
						text: 'Place a move block',
						speaker: 'Narrator',
						advanceCondition: { type: 'block-placed', blockType: 'move-forward' }
					},
					{ id: 's2', text: 'Done', speaker: 'Narrator' }
				]
			};
			const g = new GameModel(levelWithStory);
			g.status = 'story';

			g.addBlock({ id: '1', type: 'turn-left' });
			expect(g.storyIndex).toBe(0);
		});
	});

	describe('Preview Highlight', () => {
		it('should set and clear persistent highlight', () => {
			game.setPersistentHighlight(['1', '2']);
			expect(game.previewHighlight).toEqual({
				targets: ['1', '2'],
				type: 'selection',
				fading: false
			});

			game.clearPersistentHighlight();
			expect(game.previewHighlight).toBeNull();
		});

		it('should trigger transient preview highlight', () => {
			vi.useFakeTimers();
			game.triggerPreviewHighlight(['1']);

			expect(game.previewHighlight).toEqual({
				targets: ['1'],
				type: 'pulse',
				fading: false
			});

			vi.advanceTimersByTime(100);
			expect(game.previewHighlight?.fading).toBe(true);

			vi.advanceTimersByTime(2000);
			expect(game.previewHighlight).toBeNull();

			vi.useRealTimers();
		});
	});
});
