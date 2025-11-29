import { describe, it, expect, beforeEach } from 'vitest';
import { HintManager } from './hints.svelte';
import { GameModel } from './model.svelte';
import type { LevelDefinition } from './types';

const mockLevel: LevelDefinition = {
	id: 'test-level',
	name: 'Test Level',
	gridSize: { width: 5, height: 5 },
	start: { x: 0, y: 0 },
	startOrientation: 'E',
	goal: { x: 4, y: 4 },
	layout: {},
	availableBlocks: {},
	hints: [
		{
			id: 'hint-time',
			text: 'Time Hint',
			trigger: { type: 'time', value: 0.1 } // 100ms
		},
		{
			id: 'hint-attempts',
			text: 'Attempts Hint',
			trigger: { type: 'attempts', value: 2 }
		},
		{
			id: 'hint-analysis',
			text: 'Analysis Hint',
			trigger: { type: 'analysis', pattern: 'redundant-turn' }
		}
	]
};

describe('HintManager', () => {
	let game: GameModel;
	let manager: HintManager;

	beforeEach(() => {
		game = new GameModel(mockLevel);
		manager = game.hintManager;
	});

	it('triggers time-based hints', async () => {
		// Wait for time trigger
		await new Promise((resolve) => setTimeout(resolve, 150));
		manager.checkHints();
		expect(game.activeHintId).toBe('hint-time');
	});

	it('triggers attempt-based hints', () => {
		game.failedAttempts = 2;
		manager.checkHints();
		expect(game.activeHintId).toBe('hint-attempts');
	});

	it('triggers analysis-based hints', () => {
		// Create redundant turn pattern
		game.program = [
			{ id: '1', type: 'turn-left' },
			{ id: '2', type: 'turn-right' }
		];
		manager.checkHints();
		expect(game.activeHintId).toBe('hint-analysis');
	});

	it('respects shown hints (does not show again)', () => {
		game.failedAttempts = 2;
		manager.checkHints();
		expect(game.activeHintId).toBe('hint-attempts');

		// Dismiss hint
		game.dismissHint();
		expect(game.activeHintId).toBe(null);

		// Check again - should not trigger
		manager.checkHints();
		expect(game.activeHintId).toBe(null);
	});
});
