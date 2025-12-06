import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import Grid from './Grid.svelte';
import { GameModel } from '$lib/game/model.svelte';
import type { LevelDefinition } from '$lib/game/types';

const LEVEL_WITH_ITEMS: LevelDefinition = {
	id: 'test-level-items',
	name: 'Test Level Items',
	gridSize: { width: 5, height: 5 },
	layout: {},
	start: { x: 0, y: 0 },
	startOrientation: 'E',
	goal: { x: 4, y: 4 },
	items: { '2,2': { type: 'number', value: 5, icon: '5' } },
	availableBlocks: {}
};

const LEVEL_WITHOUT_ITEMS: LevelDefinition = {
	id: 'test-level-no-items',
	name: 'Test Level No Items',
	gridSize: { width: 5, height: 5 },
	layout: {},
	start: { x: 0, y: 0 },
	startOrientation: 'E',
	goal: { x: 4, y: 4 },
	items: {}, // Empty items
	availableBlocks: {}
};

describe('Grid ThoughtBubble', () => {
	it('should render ThoughtBubble when level has items', async () => {
		const game = new GameModel(LEVEL_WITH_ITEMS);
		render(Grid, { game });

		// ThoughtBubble has class "thought-bubble"
		// We can use a CSS selector locator
		const bubble = page.getByTestId('thought-bubble');
		await expect.element(bubble).toBeInTheDocument();
	});

	it('should NOT render ThoughtBubble when level has no items', async () => {
		const game = new GameModel(LEVEL_WITHOUT_ITEMS);
		render(Grid, { game });

		const bubble = page.getByTestId('thought-bubble');
		await expect.element(bubble).not.toBeInTheDocument();
	});
});
