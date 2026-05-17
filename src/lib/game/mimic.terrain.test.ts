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
	id: 'test-terrain',
	name: 'Test Terrain',
	gridSize: { width: 5, height: 5 },
	layout: {},
	start: { x: 0, y: 0 },
	startOrientation: 'E',
	goal: { x: 4, y: 0 },
	availableBlocks: {
		'move-forward': 'unlimited',
		'pick-up': 'unlimited'
	},
	initialProgram: []
};

describe('Hybrid Terrain Mechanics', () => {
	let game: GameModel;
	let interpreter: StackInterpreter;

	beforeEach(() => {
		const levelClone = JSON.parse(JSON.stringify(mockLevel));
		game = new GameModel(levelClone);
		game.status = 'planning';
		interpreter = new StackInterpreter(game);
	});

	describe('Passable By (Magic Door)', () => {
		it('should block movement through a Magic Door without the key', () => {
			// Setup Magic Door at (1,0)
			// Custom tile: Wall + PassableBy Key
			game.level.customTiles = {
				'magic-door': {
					id: 'magic-door',
					name: 'Magic Door',
					type: 'wall',
					passableBy: 'key',
					visuals: { color: 'purple' }
				}
			};
			game.level.layout['1,0'] = 'magic-door';

			game.addBlock({ id: '1', type: 'move-forward' });

			interpreter.start();
			interpreter.step(); // Highlight
			const result = interpreter.step(); // Execute

			expect(result).toBe(false); // Blocked
			expect(game.lastEvent?.type).toBe('blocked');
			expect(game.characterPosition).toEqual({ x: 0, y: 0 });
		});

		it('should allow movement through a Magic Door WITH the key', () => {
			// Setup Magic Door at (1,0)
			game.level.customTiles = {
				'magic-door': {
					id: 'magic-door',
					name: 'Magic Door',
					type: 'wall',
					passableBy: 'key',
					visuals: { color: 'purple' }
				}
			};
			game.level.layout['1,0'] = 'magic-door';

			// Give player the key
			game.heldItem = { type: 'key', value: true, icon: 'Key' };

			game.addBlock({ id: '1', type: 'move-forward' });

			interpreter.start();
			interpreter.step(); // Highlight
			const result = interpreter.step(); // Execute

			expect(result).toBe(true); // Allowed
			expect(game.characterPosition).toEqual({ x: 1, y: 0 });
		});
	});

	describe('On Enter (Custom Hazards)', () => {
		it('should kill the player when entering a custom Hazard tile', () => {
			// Setup Trap at (1,0)
			// Custom tile: Floor + OnEnter Kill
			game.level.customTiles = {
				trap: {
					id: 'trap',
					name: 'Trap',
					type: 'floor',
					onEnter: 'kill',
					visuals: { color: 'red' }
				}
			};
			game.level.layout['1,0'] = 'trap';

			game.addBlock({ id: '1', type: 'move-forward' });

			interpreter.start();
			interpreter.step(); // Highlight
			const result = interpreter.step(); // Execute

			expect(result).toBe(false); // Failed
			expect(game.lastEvent?.type).toBe('fail');
			expect(game.characterPosition).toEqual({ x: 1, y: 0 }); // Moved onto trap then died
		});

		it('should slide the player when entering a custom Ice tile', () => {
			// Setup Slippery Floor at (1,0)
			// Custom tile: Floor + OnEnter Slide
			game.level.customTiles = {
				oil: {
					id: 'oil',
					name: 'Oil',
					type: 'floor',
					onEnter: 'slide',
					visuals: { color: 'black' }
				}
			};
			game.level.layout['1,0'] = 'oil';
			// (2,0) is normal floor

			game.addBlock({ id: '1', type: 'move-forward' });

			interpreter.start();
			interpreter.step(); // Highlight
			const result = interpreter.step(); // Execute

			expect(result).toBe(true);
			expect(game.characterPosition).toEqual({ x: 2, y: 0 }); // Slid past (1,0) to (2,0)
		});
	});

	describe('Void vs Hazard', () => {
		it('should report "void" reason when falling into void', () => {
			game.level.layout['1,0'] = 'void';
			game.addBlock({ id: '1', type: 'move-forward' });

			interpreter.start();
			interpreter.step(); // Highlight
			interpreter.step(); // Execute

			expect(game.lastEvent?.type).toBe('fail');
			expect(game.lastEvent?.reason).toBe('void');
		});

		it('should report "hazard" reason when hitting spikes', () => {
			game.level.layout['1,0'] = 'spikes';
			game.addBlock({ id: '1', type: 'move-forward' });

			interpreter.start();
			interpreter.step(); // Highlight
			interpreter.step(); // Execute

			expect(game.lastEvent?.type).toBe('fail');
			expect(game.lastEvent?.reason).toBe('hazard');
		});
	});
});
