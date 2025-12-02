import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Tray from './Tray.svelte';
import { interactionManager } from '$lib/interactions/manager.svelte';
import { editorState } from '$lib/interactions/editor.svelte';
import type { GameModel } from '$lib/game/model.svelte';
import type { Block } from '$lib/game/types';

// Mock dependencies
vi.mock('$lib/interactions/dnd', () => ({
	draggableSource: vi.fn(() => ({ destroy: vi.fn() })),
	dropTarget: vi.fn(() => ({ destroy: vi.fn() }))
}));

vi.mock('$lib/actions/dnd', () => ({
	draggableVariable: vi.fn(() => ({ destroy: vi.fn() })),
	dropTargetForVariable: vi.fn(() => ({ destroy: vi.fn() }))
}));

vi.mock('@atlaskit/pragmatic-drag-and-drop/element/adapter', () => ({
	monitorForElements: vi.fn(() => vi.fn())
}));

vi.mock('$lib/game/sound', () => ({
	soundManager: {
		play: vi.fn()
	}
}));

// Mock GameModel
const createMockGame = () =>
	({
		level: {
			availableBlocks: {
				'move-forward': 'unlimited',
				'turn-left': 5
			},
			maxBlocks: 10
		},
		program: [] as Block[],
		activeProgram: [] as Block[],
		functions: {},
		blockCount: 0,
		status: 'planning',
		editingContext: null,
		addBlock: vi.fn(function (this: GameModel, block: Block) {
			this.activeProgram = [...this.activeProgram, block];
			this.program = this.activeProgram; // Sync for mock
			// @ts-expect-error - blockCount is readonly in real model but writable in mock
			this.blockCount++;
		}),
		deleteBlocks: vi.fn(function (this: GameModel) {
			this.activeProgram = [];
			this.program = [];
			// @ts-expect-error - blockCount is readonly in real model but writable in mock
			this.blockCount = 0;
		}),
		clearProgram: vi.fn(function (this: GameModel) {
			this.activeProgram = [];
			this.program = [];
			// @ts-expect-error - blockCount is readonly in real model but writable in mock
			this.blockCount = 0;
		}),
		updateBlock: vi.fn(),
		insertBlockIntoContainer: vi.fn(),
		loopProgress: new Map(),
		executionState: new Map()
	}) as unknown as GameModel;

describe('Tray Component', () => {
	let game: GameModel;

	beforeEach(() => {
		game = createMockGame();
		// Ensure program is initialized
		game.program = [];
		game.activeProgram = [];

		interactionManager.clearSelection();
		editorState.setMode('idle');
	});

	it('renders palette items', async () => {
		const { getByText } = render(Tray, { game });

		expect(getByText('Step')).toBeInTheDocument(); // move-forward
		expect(getByText('Left')).toBeInTheDocument(); // turn-left

		// Check limits
		expect(getByText('5')).toBeInTheDocument(); // 5 left
	});

	it('renders program list', async () => {
		const blocks = [
			{ id: 'b1', type: 'move-forward' },
			{ id: 'b2', type: 'turn-left' }
		] as Block[];
		game.activeProgram = blocks;
		game.program = blocks;
		game.blockCount = 2;

		const { container } = render(Tray, { game });

		// We might have multiple "Step" texts (palette + program)
		// Check for .label elements containing "Step"
		const labels = Array.from(container.querySelectorAll('.label'));
		const stepLabels = labels.filter((el) => el.textContent?.includes('Step'));
		expect(stepLabels.length).toBeGreaterThan(1);
	});

	it('adds block on palette click', async () => {
		const { container } = render(Tray, { game });

		// Find palette item for 'move-forward' (Step)
		const palette = container.querySelector('.block-list');
		const stepBtn = palette?.querySelector('[data-type="move-forward"]');

		expect(stepBtn).toBeDefined();
		if (stepBtn) {
			// We need to cast to HTMLElement to click
			await (stepBtn as HTMLElement).click();
			expect(game.addBlock).toHaveBeenCalled();

			// Check if the mock updated the state
			// If the mock's `this` context failed, we might need to check arguments
			const callArgs = vi.mocked(game.addBlock).mock.calls[0];
			expect(callArgs[0]).toBeDefined();
			expect(callArgs[0].type).toBe('move-forward');
		}
	});

	it('clears program', async () => {
		const blocks = [{ id: 'b1', type: 'move-forward' }] as Block[];
		game.activeProgram = blocks;
		game.program = blocks;
		game.blockCount = 1;

		const { getByTitle } = render(Tray, { game });

		const clearBtn = getByTitle('Clear Main Program');
		await clearBtn.click();

		expect(game.clearProgram).toHaveBeenCalled();
	});
});
