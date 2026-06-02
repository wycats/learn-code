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
				'turn-left': 5,
				loop: 'unlimited',
				call: 'unlimited'
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
		// @ts-expect-error - blockCount is readonly in real model
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
		// @ts-expect-error - blockCount is readonly in real model
		game.blockCount = 1;

		const { getByTitle } = render(Tray, { game });

		const clearBtn = getByTitle('Clear Main Program');
		await clearBtn.click();

		expect(game.clearProgram).toHaveBeenCalled();
	});

	it('explains that the tray is disabled after a failed run', async () => {
		game.status = 'lost';

		const { getByText } = render(Tray, { game });

		expect(getByText('Run stopped. Try Again, or Reset to edit.')).toBeInTheDocument();
	});

	it('explains that the tray is disabled after a successful run', async () => {
		game.status = 'won';

		const { getByText } = render(Tray, { game });

		expect(getByText('Level Complete! Replay or continue.')).toBeInTheDocument();
	});

	it('renders the Drafting Table only when drafting props are provided', async () => {
		const { container } = render(Tray, { game });

		expect(container.textContent).not.toContain('Drafting Table');

		const draftBlocks: Block[] = [];
		const renderedWithDrafts = render(Tray, { game, draftingTable: draftBlocks });

		expect(renderedWithDrafts.getByText('Drafting Table')).toBeInTheDocument();
		expect(renderedWithDrafts.container.textContent).toContain('Program');
	});

	it('does not count draft blocks toward the displayed block limit', async () => {
		const draftBlocks: Block[] = [{ id: 'draft-step', type: 'move-forward' }];

		const { container } = render(Tray, { game, draftingTable: draftBlocks });

		expect(container.querySelector('.count')?.textContent?.trim()).toBe('0 / 10');
		expect(container.querySelector('[data-block-id="drafting-table-list"]')).toBeInTheDocument();
	});

	it('shows loop configuration for a selected draft loop', async () => {
		const draftBlocks: Block[] = [{ id: 'draft-loop', type: 'loop', count: 3, children: [] }];
		const { container, getByLabelText } = render(Tray, { game, draftingTable: draftBlocks });

		await (
			container.querySelector(
				'[data-block-id="drafting-table-list"] [data-type="loop"]'
			) as HTMLElement
		)?.click();

		expect(getByLabelText('Times')).toBeInTheDocument();
		expect(container.querySelector('.config-panel')).toBeInTheDocument();
	});

	it('shows call configuration for a selected draft call', async () => {
		game.functions = { helper: [] };
		const draftBlocks: Block[] = [{ id: 'draft-call', type: 'call' }];
		const { container, getByText } = render(Tray, { game, draftingTable: draftBlocks });

		await (
			container.querySelector(
				'[data-block-id="drafting-table-list"] [data-type="call"]'
			) as HTMLElement
		)?.click();

		expect(getByText('Calling:')).toBeInTheDocument();
		expect(container.querySelector('.single-function-display .value')?.textContent).toBe('helper');
	});
});
