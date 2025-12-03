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
		const levelClone = JSON.parse(JSON.stringify(mockLevel));
		game = new GameModel(levelClone);
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

	it('should clear function state on re-entry (double call)', () => {
		// Define function 'jump'
		game.functions['jump'] = [{ id: 'f1', type: 'move-forward' }];

		// Main program: Call 'jump' twice
		game.addBlock({ id: 'call1', type: 'call', functionName: 'jump' });
		game.addBlock({ id: 'call2', type: 'call', functionName: 'jump' });

		interpreter.start();

		// --- First Call ---
		interpreter.step(); // Highlight call1
		interpreter.step(); // Highlight f1 (Context: jump)
		expect(game.executionState.get('f1')).toBe('running');

		interpreter.step(); // Execute f1
		expect(game.executionState.get('f1')).toBe('success');

		// --- Second Call ---
		interpreter.step(); // Highlight call2 (Context: null)
		// At this point, we are back in main, f1 state is still 'success' from previous run
		// But we are about to enter call2.

		interpreter.step(); // Highlight f1 (Context: jump) - Re-entry!
		// HERE is the fix: f1 should be reset to 'running' (or cleared then set to running by step)
		// The step() method sets it to 'running' immediately after pushing stack.
		// But crucially, it should NOT be 'success'.
		expect(game.executionState.get('f1')).toBe('running');

		// Let's verify stepping back restores the state
		interpreter.stepBack(); // Back to Highlight call2
		// In this state, f1 was reset by the call block logic
		// console.log('State after stepBack:', Array.from(game.executionState.entries()));
		expect(game.executionState.get('f1')).toBeUndefined();

		interpreter.step(); // Highlight f1 (sets f1 to running)
		expect(game.executionState.get('f1')).toBe('running');
	});

	it('should mark call block as success after entering function', () => {
		game.functions['f'] = [{ id: 'f1', type: 'move-forward' }];
		game.addBlock({ id: 'call1', type: 'call', functionName: 'f' });

		interpreter.start();
		interpreter.step(); // Highlight call1
		// It might be 'running' or 'success' depending on when we check.
		// In 'before' phase, we set it to 'running'.
		// But wait, step() returns true immediately after setting 'success' if it's a call block?
		// No, step() sets 'running' at the start of 'before' phase.
		// Then if it's a call block, it sets 'success' and returns true.
		// So after the first step(), it should ALREADY be 'success' because step() finished the 'before' phase logic for call block.
		expect(game.executionState.get('call1')).toBe('success');

		interpreter.step(); // Enter function
		// The call block should still be marked as success
		expect(game.executionState.get('call1')).toBe('success');
	});

	it('should execute nested loops', () => {
		// Resize grid for this test
		game.level.gridSize = { width: 10, height: 10 };
		game.level.goal = { x: 9, y: 9 }; // Move goal away
		game.reset(); // Apply grid size change

		// Loop 2 times -> Loop 2 times -> Move
		// Total moves: 4
		const nestedLoop = {
			id: 'inner',
			type: 'loop' as const,
			count: 2,
			children: [{ id: 'move', type: 'move-forward' as const }]
		};
		const outerLoop = {
			id: 'outer',
			type: 'loop' as const,
			count: 2,
			children: [nestedLoop]
		};
		game.addBlock(outerLoop);

		interpreter.start();

		// Run until finished
		let steps = 0;
		while (interpreter.step() && steps < 100) {
			steps++;
		}

		// 4 moves forward
		expect(game.characterPosition).toEqual({ x: 4, y: 0 });
	});

	it('should handle recursion limit', () => {
		// Function 'rec' calls 'rec'
		game.functions['rec'] = [{ id: 'call_rec', type: 'call', functionName: 'rec' }];
		game.addBlock({ id: 'start', type: 'call', functionName: 'rec' });

		interpreter.start();

		// Run for a while
		let steps = 0;
		let result = true;
		while (result && steps < 1000) {
			result = interpreter.step();
			steps++;
		}

		// Should stop eventually due to stack limit
		expect(interpreter.stack.length).toBeLessThan(1000);
		expect(result).toBe(false);
	});

	it('should step back correctly', () => {
		game.addBlock({ id: '1', type: 'move-forward' });
		game.addBlock({ id: '2', type: 'turn-left' });

		interpreter.start();

		// 1. Highlight 1
		interpreter.step();
		// 2. Execute 1
		interpreter.step();
		expect(game.characterPosition).toEqual({ x: 1, y: 0 });

		// 3. Highlight 2
		interpreter.step();
		expect(game.activeBlockId).toBe('2');

		// Step Back -> Should be at "Execute 1" state (post-execution)
		interpreter.stepBack();
		// When we step back, we restore the state BEFORE the last step.
		// The last step was "Highlight 2".
		// The state before that was "Execute 1" finished.
		expect(game.characterPosition).toEqual({ x: 1, y: 0 });

		// Step Back -> Should be at "Highlight 1" state
		interpreter.stepBack();
		expect(game.characterPosition).toEqual({ x: 0, y: 0 }); // Undo move
		expect(game.activeBlockId).toBe('1');
	});

	describe('Game Mechanics', () => {
		it('should fail when stepping on a hazard', () => {
			// Setup hazard at (1,0)
			game.level.layout['1,0'] = 'hazard';
			game.addBlock({ id: '1', type: 'move-forward' });

			interpreter.start();
			interpreter.step(); // Highlight
			const result = interpreter.step(); // Execute

			expect(result).toBe(false);
			expect(game.lastEvent?.type).toBe('fail');
			expect(game.characterPosition).toEqual({ x: 1, y: 0 }); // Should move onto hazard then die
		});

		it('should slide on ice', () => {
			// Setup ice at (1,0) and (2,0), wall at (4,0)
			// Start at (0,0) -> Move East
			// (1,0) Ice -> Slide to (2,0) Ice -> Slide to (3,0) Empty -> Stop
			game.level.gridSize = { width: 5, height: 1 };
			game.level.layout['1,0'] = 'ice';
			game.level.layout['2,0'] = 'ice';
			// (3,0) is empty/grass

			game.addBlock({ id: '1', type: 'move-forward' });

			interpreter.start();
			interpreter.step(); // Highlight
			const result = interpreter.step(); // Execute

			expect(result).toBe(true);
			expect(game.characterPosition).toEqual({ x: 3, y: 0 });
		});

		it('should stop sliding when hitting a wall', () => {
			// Setup ice at (1,0), wall at (2,0)
			game.level.layout['1,0'] = 'ice';
			game.level.layout['2,0'] = 'wall';

			game.addBlock({ id: '1', type: 'move-forward' });

			interpreter.start();
			interpreter.step(); // Highlight
			const result = interpreter.step(); // Execute

			expect(result).toBe(true);
			// Should slide to (1,0), try (2,0), hit wall, stay at (1,0)
			expect(game.characterPosition).toEqual({ x: 1, y: 0 });
		});

		it('should fail when sliding into a hazard', () => {
			// Setup ice at (1,0), hazard at (2,0)
			game.level.layout['1,0'] = 'ice';
			game.level.layout['2,0'] = 'hazard';

			game.addBlock({ id: '1', type: 'move-forward' });

			interpreter.start();
			interpreter.step(); // Highlight
			const result = interpreter.step(); // Execute

			expect(result).toBe(false);
			expect(game.lastEvent?.type).toBe('fail');
			expect(game.characterPosition).toEqual({ x: 2, y: 0 });
		});

		it('should pick up an item', () => {
			// Setup item at (0,0)
			game.level.items = { '0,0': { type: 'number', value: 5, icon: 'star' } };
			game.addBlock({ id: '1', type: 'pick-up' });

			interpreter.start();
			interpreter.step(); // Highlight
			const result = interpreter.step(); // Execute

			expect(result).toBe(true);
			expect(game.heldItem).toEqual({ type: 'number', value: 5, icon: 'star' });
			expect(game.collectedItems.has('0,0')).toBe(true);
		});

		it('should fail to pick up if no item exists', () => {
			game.level.items = {};
			game.addBlock({ id: '1', type: 'pick-up' });

			interpreter.start();
			interpreter.step(); // Highlight
			const result = interpreter.step(); // Execute

			expect(result).toBe(false);
			expect(game.lastEvent?.type).toBe('fail');
		});

		it('should fail to pick up if item already collected', () => {
			game.level.items = { '0,0': { type: 'number', value: 5, icon: 'star' } };
			game.collectedItems.add('0,0'); // Already collected

			game.addBlock({ id: '1', type: 'pick-up' });

			interpreter.start();
			interpreter.step(); // Highlight
			const result = interpreter.step(); // Execute

			expect(result).toBe(false);
			expect(game.lastEvent?.type).toBe('fail');
		});

		it('should use held variable in loop count', () => {
			// 1. Pick up item (value 2)
			// 2. Loop (count: variable 'heldItem')

			game.level.items = { '0,0': { type: 'number', value: 2, icon: 'star' } };

			const pickUp = { id: 'pick', type: 'pick-up' as const };
			const loop = {
				id: 'loop',
				type: 'loop' as const,
				count: { type: 'variable' as const, variableId: 'heldItem' as const },
				children: [{ id: 'child', type: 'move-forward' as const }]
			};

			game.addBlock(pickUp);
			game.addBlock(loop);

			interpreter.start();

			// Pick Up
			interpreter.step(); // Highlight
			interpreter.step(); // Execute
			expect(game.heldItem?.value).toBe(2);

			// Loop Start
			interpreter.step(); // Highlight Loop

			// Check stack for loop count
			const loopFrame = interpreter.stack[interpreter.stack.length - 1];
			expect(loopFrame.loopMax).toBe(2);
		});
	});
});
