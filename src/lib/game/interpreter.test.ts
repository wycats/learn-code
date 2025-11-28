import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameModel } from './model.svelte';
import { StackInterpreter } from './mimic';
import type { LevelDefinition } from './types';

// Mock SoundManager
vi.mock('./sound', () => ({
	soundManager: {
		play: vi.fn(),
		playAmbient: vi.fn(),
		stopAmbient: vi.fn()
	}
}));

const mockLevel: LevelDefinition = {
	id: 'test',
	name: 'Test Level',
	gridSize: { width: 3, height: 3 },
	layout: {},
	start: { x: 0, y: 0 },
	startOrientation: 'E',
	goal: { x: 2, y: 0 },
	availableBlocks: {
		'move-forward': 'unlimited',
		'turn-left': 'unlimited',
		'turn-right': 'unlimited'
	},
	initialProgram: []
};

describe('StackInterpreter', () => {
	let game: GameModel;
	let interpreter: StackInterpreter;

	beforeEach(() => {
		game = new GameModel(mockLevel);
		game.status = 'planning'; // Force planning mode so we can add blocks
		interpreter = new StackInterpreter(game);
	});

	it('should execute a simple move', () => {
		game.addBlock({ id: '1', type: 'move-forward' });
		interpreter.start();

		// Step 1: Highlight
		interpreter.step();
		expect(game.activeBlockId).toBe('1');
		expect(game.characterPosition).toEqual({ x: 0, y: 0 });

		// Step 2: Execute
		interpreter.step();
		expect(game.characterPosition).toEqual({ x: 1, y: 0 });
		expect(game.executionState.get('1')).toBe('success');
	});

	it('should handle hitting a wall (error state)', () => {
		// Face North (towards wall at 0,-1)
		game.characterOrientation = 'N';
		game.addBlock({ id: '1', type: 'move-forward' });

		interpreter.start();

		// Highlight
		interpreter.step();

		// Execute - Should fail
		const result = interpreter.step();

		expect(result).toBe(false); // Should stop execution
		expect(game.executionState.get('1')).toBe('failure');
		expect(game.lastEvent?.type).toBe('blocked');
	});

	it('should clear error state on reset and restart', () => {
		// 1. Setup failure scenario
		game.characterOrientation = 'N';
		game.addBlock({ id: '1', type: 'move-forward' });

		interpreter.start();
		interpreter.step(); // Highlight
		interpreter.step(); // Execute & Fail

		expect(game.lastEvent?.type).toBe('blocked');

		// 2. Reset Game
		game.reset();

		expect(game.lastEvent).toBeNull();
		expect(game.activeBlockId).toBeNull();
		expect(game.executionState.size).toBe(0);

		// 3. Change program to valid move
		game.clearProgram();
		game.characterOrientation = 'E'; // Reset orientation manually or rely on reset?
		// reset() restores startOrientation which is 'E' in mockLevel.
		expect(game.characterOrientation).toBe('E');

		game.addBlock({ id: '2', type: 'move-forward' });

		// 4. Start new execution
		const newInterpreter = new StackInterpreter(game);
		newInterpreter.start();

		// Highlight
		newInterpreter.step();
		expect(game.activeBlockId).toBe('2');

		// Execute
		const result = newInterpreter.step();

		expect(result).toBe(true); // Should continue
		expect(game.characterPosition).toEqual({ x: 1, y: 0 });
		expect(game.executionState.get('2')).toBe('success');
		expect(game.lastEvent).toBeNull();
	});

	it('should execute a loop', () => {
		// Loop 2 times: Move Forward
		const loopBlock = {
			id: 'loop1',
			type: 'loop' as const,
			count: 2,
			children: [{ id: 'child1', type: 'move-forward' as const }]
		};
		game.addBlock(loopBlock);

		interpreter.start();

		// 1. Highlight Loop
		interpreter.step();
		expect(game.activeBlockId).toBe('loop1');

		// 2. Highlight Child (Iteration 1)
		interpreter.step();
		expect(game.activeBlockId).toBe('child1');

		// 3. Execute Child (Iteration 1)
		interpreter.step();
		expect(game.characterPosition).toEqual({ x: 1, y: 0 });

		// 4. Highlight Child (Iteration 2)
		interpreter.step();
		expect(game.activeBlockId).toBe('child1');

		// 5. Execute Child (Iteration 2)
		interpreter.step();
		expect(game.characterPosition).toEqual({ x: 2, y: 0 });

		// 6. Finish (Loop done)
		const result = interpreter.step();
		expect(result).toBe(false);
	});

	it('should execute a function call', () => {
		// Define function 'jump'
		game.functions['jump'] = [
			{ id: 'f1', type: 'move-forward' },
			{ id: 'f2', type: 'move-forward' }
		];

		// Main program: Call 'jump'
		game.addBlock({ id: 'call1', type: 'call', functionName: 'jump' });

		interpreter.start();

		// 1. Highlight Call Block
		interpreter.step();
		expect(game.activeBlockId).toBe('call1');
		expect(game.editingContext).toBeNull();

		// 2. Highlight Function Block 1 (Context Switch!)
		interpreter.step();
		expect(game.activeBlockId).toBe('f1');
		expect(game.editingContext).toBe('jump');

		// 3. Execute Function Block 1
		interpreter.step();
		expect(game.characterPosition).toEqual({ x: 1, y: 0 });

		// 4. Highlight Function Block 2
		interpreter.step();
		expect(game.activeBlockId).toBe('f2');

		// 5. Execute Function Block 2
		interpreter.step();
		expect(game.characterPosition).toEqual({ x: 2, y: 0 });

		// 6. Return to Main (Finish)
		const result = interpreter.step();
		expect(result).toBe(false);
		expect(game.editingContext).toBeNull(); // Should revert to main
	});

	it('should handle infinite loops (undefined count)', () => {
		const loopBlock = {
			id: 'loop_inf',
			type: 'loop' as const,
			// count is undefined
			children: [{ id: 'child_inf', type: 'move-forward' as const }]
		};
		game.addBlock(loopBlock);

		interpreter.start();

		// 1. Highlight Loop
		interpreter.step();

		// Check stack frame for loopMax
		const loopFrame = interpreter.stack[interpreter.stack.length - 1];
		expect(loopFrame.loopMax).toBe(Infinity);

		// 2. Highlight Child
		interpreter.step();
		expect(game.activeBlockId).toBe('child_inf');
	});
});
