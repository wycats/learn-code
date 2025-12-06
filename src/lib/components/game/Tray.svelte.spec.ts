import { describe, it, expect, beforeEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import Tray from './Tray.svelte';
import { GameModel } from '$lib/game/model.svelte';
import type { LevelDefinition } from '$lib/game/types';

const MOCK_LEVEL: LevelDefinition = {
	id: 'test-level',
	name: 'Test Level',
	gridSize: { width: 5, height: 5 },
	layout: {},
	availableBlocks: { 'move-forward': 5, loop: 5, 'pick-up': 1 }, // pick-up triggers hasVariables
	solutionPar: 5,
	start: { x: 0, y: 0 },
	startOrientation: 'E',
	goal: { x: 4, y: 4 },
	items: {}
};

describe('Tray Interaction', () => {
	let game: GameModel;

	beforeEach(() => {
		game = new GameModel(MOCK_LEVEL);
		// Ensure game is in planning mode so Tray is enabled
		game.status = 'planning';
		// Add a loop block to the program so we can click it
		game.addBlock({ id: 'loop-1', type: 'loop', count: 2 });
	});

	it('should allow assigning variable to loop via click-click', async () => {
		render(Tray, { game });

		// 1. Find and click the "Held Item" token
		const variableToken = page.getByText('Held Item');
		await expect.element(variableToken).toBeInTheDocument();
		await variableToken.click();

		// 2. Find the loop badge (it says "2x" initially)
		const loopBadge = page.getByText('2x');
		await expect.element(loopBadge).toBeInTheDocument();

		// 3. Click the loop badge
		await loopBadge.click();

		// 4. Verify the block was updated in the model
		const block = game.activeProgram.find((b) => b.id === 'loop-1');
		expect(block?.count).toEqual({ type: 'variable', variableId: 'heldItem' });

		// 5. Verify the UI updated
		// The "2x" text should be gone as it's replaced by the variable icon
		await expect.element(page.getByText('2x')).not.toBeInTheDocument();
	});
});
