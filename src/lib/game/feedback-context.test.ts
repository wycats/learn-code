import { describe, expect, it } from 'vitest';
import { GameModel } from './model.svelte';
import { StackInterpreter } from './mimic';
import { LEVEL_1 } from './levels';
import { createFeedbackContext } from './feedback-context.svelte';

describe('createFeedbackContext', () => {
	it('serializes the current game, route, browser, and interpreter state', () => {
		const game = new GameModel(LEVEL_1);
		game.status = 'planning';
		game.addBlock({ id: 'move-1', type: 'move-forward' });
		const interpreter = new StackInterpreter(game);
		interpreter.start();
		interpreter.step();

		const context = createFeedbackContext({
			game,
			route: { source: 'pack', packId: 'basics', levelId: 'level-1' },
			interpreter,
			url: 'https://example.test/play/basics/level-1',
			navigatorInfo: {
				onLine: true,
				userAgent: 'Vitest',
				language: 'en-US'
			},
			viewport: { width: 1024, height: 768 }
		});

		expect(context.route).toMatchObject({
			source: 'pack',
			packId: 'basics',
			levelId: 'level-1',
			url: 'https://example.test/play/basics/level-1'
		});
		expect(context.level.id).toBe('level-1');
		expect(context.program).toEqual([{ id: 'move-1', type: 'move-forward' }]);
		expect(context.game.status).toBe('running');
		expect(context.game.activeBlockId).toBe('move-1');
		expect(context.game.executionState).toEqual([['move-1', 'running']]);
		expect(context.interpreter?.phase).toBe('after');
		expect(context.interpreter?.stackDepth).toBe(1);
		expect(context.interpreter?.stack[0].blockIds).toEqual(['move-1']);
		expect(context.browser).toEqual({
			online: true,
			userAgent: 'Vitest',
			language: 'en-US',
			viewport: { width: 1024, height: 768 }
		});
	});
});
