import { describe, expect, it } from 'vitest';
import { GameModel } from './model.svelte';
import { LEVEL_1 } from './levels';
import { simulateGhostPath } from './ghost-path';
import { LOCKED_DOOR_TILE_ID, createLockedDoorTileDefinition } from './builder-presets';
import type { Block, LevelDefinition } from './types';

const baseLevel: LevelDefinition = {
	id: 'ghost-test',
	name: 'Ghost Test',
	gridSize: { width: 5, height: 5 },
	layout: {},
	start: { x: 0, y: 0 },
	startOrientation: 'E',
	goal: { x: 4, y: 0 },
	availableBlocks: {},
	initialProgram: []
};

function block(id: string, type: Block['type'], extra: Partial<Block> = {}): Block {
	return { id, type, ...extra };
}

describe('simulateGhostPath', () => {
	it('predicts level 1 four moves reaching the goal', () => {
		const preview = simulateGhostPath({
			level: LEVEL_1,
			program: [
				block('move-1', 'move-forward'),
				block('move-2', 'move-forward'),
				block('move-3', 'move-forward'),
				block('move-4', 'move-forward')
			]
		});

		expect(preview.outcome).toBe('won');
		expect(preview.finalPosition).toEqual(LEVEL_1.goal);
		expect(preview.finalOrientation).toBe('E');
		expect(preview.path.map((entry) => entry.position)).toEqual([
			{ x: 0, y: 2 },
			{ x: 1, y: 2 },
			{ x: 2, y: 2 },
			{ x: 3, y: 2 },
			{ x: 4, y: 2 }
		]);
	});

	it('predicts a blocked path without mutating GameModel state', () => {
		const game = new GameModel({
			...baseLevel,
			layout: { '1,0': 'wall' },
			goal: { x: 2, y: 0 }
		});
		game.status = 'planning';
		game.program = [block('move-1', 'move-forward')];
		const before = {
			status: game.status,
			position: { ...game.characterPosition },
			orientation: game.characterOrientation,
			lastEvent: game.lastEvent,
			executionStateSize: game.executionState.size,
			loopProgressSize: game.loopProgress.size,
			failedAttempts: game.failedAttempts,
			collectedItemsSize: game.collectedItems.size
		};

		const preview = simulateGhostPath({
			level: game.level,
			program: game.program,
			functions: game.functions
		});

		expect(preview.outcome).toBe('blocked');
		expect(preview.finalPosition).toEqual({ x: 0, y: 0 });
		expect(preview.path.at(-1)).toMatchObject({
			event: 'blocked',
			attemptedPosition: { x: 1, y: 0 }
		});
		expect({
			status: game.status,
			position: game.characterPosition,
			orientation: game.characterOrientation,
			lastEvent: game.lastEvent,
			executionStateSize: game.executionState.size,
			loopProgressSize: game.loopProgress.size,
			failedAttempts: game.failedAttempts,
			collectedItemsSize: game.collectedItems.size
		}).toEqual(before);
	});

	it('handles loops and function calls without live interpreter state', () => {
		const preview = simulateGhostPath({
			level: {
				...baseLevel,
				goal: { x: 3, y: 0 }
			},
			program: [
				block('loop-1', 'loop', {
					count: 2,
					children: [block('move-loop', 'move-forward')]
				}),
				block('call-1', 'call', { functionName: 'finish' })
			],
			functions: {
				finish: [block('move-function', 'move-forward')]
			}
		});

		expect(preview.outcome).toBe('won');
		expect(preview.finalPosition).toEqual({ x: 3, y: 0 });
		expect(preview.path.map((entry) => entry.blockId).filter(Boolean)).toEqual([
			'move-loop',
			'move-loop',
			'move-function'
		]);
	});

	it('mirrors interpreter loop behavior when count resolves to zero', () => {
		const preview = simulateGhostPath({
			level: {
				...baseLevel,
				goal: { x: 1, y: 0 }
			},
			program: [
				block('loop-zero', 'loop', {
					count: 0,
					children: [block('move-once', 'move-forward')]
				})
			]
		});

		expect(preview.outcome).toBe('won');
		expect(preview.path.map((entry) => entry.blockId).filter(Boolean)).toEqual(['move-once']);
	});

	it('mirrors interpreter loop behavior when a variable count resolves to zero', () => {
		const preview = simulateGhostPath({
			level: {
				...baseLevel,
				goal: { x: 1, y: 0 }
			},
			program: [
				block('loop-variable-zero', 'loop', {
					count: { type: 'variable', variableId: 'heldItem' },
					children: [block('move-once', 'move-forward')]
				})
			]
		});

		expect(preview.outcome).toBe('won');
		expect(preview.path.map((entry) => entry.blockId).filter(Boolean)).toEqual(['move-once']);
	});

	it('predicts Repeat Move from a picked-up Number 3 held item value', () => {
		const preview = simulateGhostPath({
			level: {
				...baseLevel,
				gridSize: { width: 4, height: 1 },
				goal: { x: 3, y: 0 },
				items: { '0,0': { type: 'number', value: 3, icon: 'Hash' } }
			},
			program: [
				block('pick', 'pick-up'),
				block('repeat-held-number', 'loop', {
					count: { type: 'variable', variableId: 'heldItem' },
					children: [block('move-repeat', 'move-forward')]
				})
			]
		});

		expect(preview.outcome).toBe('won');
		expect(preview.finalPosition).toEqual({ x: 3, y: 0 });
		expect(preview.path.map((entry) => entry.blockId).filter(Boolean)).toEqual([
			'pick',
			'move-repeat',
			'move-repeat',
			'move-repeat'
		]);
		expect(preview.path.map((entry) => entry.event)).toEqual([
			'start',
			'pick-up',
			'move',
			'move',
			'won'
		]);
	});

	it('predicts boarding a boat before crossing water', () => {
		const preview = simulateGhostPath({
			level: {
				...baseLevel,
				gridSize: { width: 3, height: 1 },
				goal: { x: 2, y: 0 },
				layout: { '1,0': 'water' },
				items: { '0,0': { type: 'boat', value: true, icon: 'Ship' } }
			},
			program: [
				block('board', 'board'),
				block('move-water', 'move-forward'),
				block('move-goal', 'move-forward')
			]
		});

		expect(preview.outcome).toBe('won');
		expect(preview.finalPosition).toEqual({ x: 2, y: 0 });
		expect(preview.path.map((entry) => entry.event)).toEqual(['start', 'board', 'move', 'won']);
	});

	it('caps runaway loops', () => {
		const preview = simulateGhostPath({
			level: {
				...baseLevel,
				gridSize: { width: 20, height: 1 },
				goal: { x: 19, y: 0 }
			},
			program: [
				block('loop-infinite', 'loop', {
					children: [block('turn-loop', 'turn-left')]
				})
			],
			stepCap: 6
		});

		expect(preview.outcome).toBe('capped');
		expect(preview.finalPosition).toEqual({ x: 0, y: 0 });
		expect(preview.path.length).toBeGreaterThan(1);
		expect(preview.path.slice(1).every((entry) => entry.event === 'turn')).toBe(true);
	});

	it('predicts a key-door puzzle using Pick Up before the locked door', () => {
		const preview = simulateGhostPath({
			level: {
				...baseLevel,
				gridSize: { width: 4, height: 1 },
				goal: { x: 3, y: 0 },
				layout: { '2,0': LOCKED_DOOR_TILE_ID },
				customTiles: {
					[LOCKED_DOOR_TILE_ID]: createLockedDoorTileDefinition()
				},
				items: { '0,0': { type: 'key', value: true, icon: 'Key' } }
			},
			program: [
				block('pick', 'pick-up'),
				block('move-1', 'move-forward'),
				block('move-2', 'move-forward'),
				block('move-3', 'move-forward')
			]
		});

		expect(preview.outcome).toBe('won');
		expect(preview.finalPosition).toEqual({ x: 3, y: 0 });
		expect(preview.path.map((entry) => entry.event)).toEqual([
			'start',
			'pick-up',
			'move',
			'move',
			'won'
		]);
	});

	it('predicts a blocked path when the locked door is reached without a key', () => {
		const preview = simulateGhostPath({
			level: {
				...baseLevel,
				gridSize: { width: 4, height: 1 },
				goal: { x: 3, y: 0 },
				layout: { '2,0': LOCKED_DOOR_TILE_ID },
				customTiles: {
					[LOCKED_DOOR_TILE_ID]: createLockedDoorTileDefinition()
				}
			},
			program: [block('move-1', 'move-forward'), block('move-2', 'move-forward')]
		});

		expect(preview.outcome).toBe('blocked');
		expect(preview.finalPosition).toEqual({ x: 1, y: 0 });
		expect(preview.path.at(-1)).toMatchObject({
			event: 'blocked',
			attemptedPosition: { x: 2, y: 0 }
		});
	});
});
