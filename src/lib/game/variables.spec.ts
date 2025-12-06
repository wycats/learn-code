import { describe, it, expect } from 'vitest';
import { LEVEL_KEYS_1 } from './levels';
import { GameModel } from './model.svelte';
import { StackInterpreter } from './mimic';
import type { Block } from './schema';

describe('Variables & Memory', () => {
	it('should execute the variable loop program correctly', () => {
		const game = new GameModel(LEVEL_KEYS_1);
		const interpreter = new StackInterpreter(game);

		// Construct the program
		// 1. Move Forward
		// 2. Pick Up
		// 3. Loop (count: variable) -> Move Forward

		const program: Block[] = [
			{
				id: 'move-1',
				type: 'move-forward'
			},
			{
				id: 'pick-1',
				type: 'pick-up'
			},
			{
				id: 'loop-1',
				type: 'loop',
				count: { type: 'variable', variableId: 'heldItem' },
				children: [
					{
						id: 'move-loop',
						type: 'move-forward'
					}
				]
			}
		];

		game.program = program;

		// Start Interpreter
		interpreter.start();

		// Initial State
		expect(game.characterPosition).toEqual({ x: 0, y: 2 });
		expect(game.heldItem).toBeNull();

		// --- Step 1: Move Forward ---
		// Phase: before (highlight)
		interpreter.step();
		expect(game.activeBlockId).toBe('move-1');
		// Phase: after (execute)
		interpreter.step();
		expect(game.characterPosition).toEqual({ x: 1, y: 2 });

		// --- Step 2: Pick Up ---
		// Phase: before
		interpreter.step();
		expect(game.activeBlockId).toBe('pick-1');
		// Phase: after
		interpreter.step();
		expect(game.heldItem).toEqual({ type: 'number', value: 3, icon: '3' });
		expect(game.collectedItems.has('1,2')).toBe(true);

		// --- Step 3: Loop Start ---
		// Phase: before (highlight loop)
		interpreter.step();
		expect(game.activeBlockId).toBe('loop-1');
		// Loop logic happens in 'before' phase, pushing children to stack

		// --- Loop Iteration 1: Move Forward ---
		// Phase: before
		interpreter.step();
		expect(game.activeBlockId).toBe('move-loop');
		// Phase: after
		interpreter.step();
		expect(game.characterPosition).toEqual({ x: 2, y: 2 });

		// --- Loop Iteration 2: Move Forward ---
		// Phase: before
		interpreter.step();
		expect(game.activeBlockId).toBe('move-loop');
		// Phase: after
		interpreter.step();
		expect(game.characterPosition).toEqual({ x: 3, y: 2 });

		// --- Loop Iteration 3: Move Forward ---
		// Phase: before
		interpreter.step();
		expect(game.activeBlockId).toBe('move-loop');
		// Phase: after
		interpreter.step();
		expect(game.characterPosition).toEqual({ x: 4, y: 2 });

		// --- Loop End / Program End ---
		// The loop should finish now (count was 3)
		// Next step should check win condition
		interpreter.step();

		expect(game.status).toBe('won');
	});
});
