import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import CodeView from './CodeView.svelte';
import { GameModel } from '$lib/game/model.svelte';
import type { LevelDefinition } from '$lib/game/types';
import { interactionManager } from '$lib/interactions';

const MOCK_LEVEL: LevelDefinition = {
	id: 'code-view-test-level',
	name: 'Code View Test Level',
	gridSize: { width: 5, height: 5 },
	layout: {},
	availableBlocks: { 'move-forward': 'unlimited', loop: 'unlimited' },
	start: { x: 0, y: 0 },
	startOrientation: 'E',
	goal: { x: 4, y: 0 }
};

describe('CodeView', () => {
	beforeEach(() => {
		interactionManager.clearSelection();
	});

	it('renders generated code in a dialog for the whole program', () => {
		const game = new GameModel(MOCK_LEVEL);
		game.status = 'planning';
		game.program = [{ id: 'move-1', type: 'move-forward' }];

		const { container } = render(CodeView, { game });

		expect(container.querySelector('dialog[data-testid="code-view"]')).toBeInTheDocument();
		expect(container.textContent).not.toContain('function main()');
		expect(container.textContent).toContain('moveForward();');
	});

	it('updates when committed block changes update the model', async () => {
		const game = new GameModel(MOCK_LEVEL);
		game.status = 'planning';
		const rendered = render(CodeView, { game });

		expect(rendered.container.textContent).toContain(
			'// Add blocks to start building your program.'
		);

		game.addBlock({ id: 'move-1', type: 'move-forward' });
		await rendered.rerender({ game });

		expect(rendered.container.textContent).toContain('moveForward();');
	});

	it('renders function definitions along with top-level code', () => {
		const game = new GameModel(MOCK_LEVEL);
		game.status = 'planning';
		game.functions = {
			'Helper Path': [{ id: 'turn-1', type: 'turn-left' }]
		};
		game.program = [{ id: 'call-1', type: 'call', functionName: 'Helper Path' }];

		const { container } = render(CodeView, { game });

		expect(container.textContent).toContain('defineFunction("Helper Path"');
		expect(container.textContent).toContain('callFunction("Helper Path");');
	});

	it('renders a compact board preview beside the code', () => {
		const game = new GameModel(MOCK_LEVEL);
		game.status = 'planning';

		const { container } = render(CodeView, { game });

		expect(container.querySelector('aside[aria-label="Board preview"]')).toBeInTheDocument();
		expect(container.textContent).toContain('5x5');
	});

	it('marks the active block code line', () => {
		const game = new GameModel(MOCK_LEVEL);
		game.status = 'planning';
		game.program = [
			{ id: 'move-1', type: 'move-forward' },
			{ id: 'turn-1', type: 'turn-left' }
		];
		game.activeBlockId = 'turn-1';

		const { container } = render(CodeView, { game });

		expect(container.querySelector('[data-block-ids="turn-1"]')).toHaveClass('active-code-line');
		expect(container.querySelector('[data-block-ids="move-1"]')).not.toHaveClass(
			'active-code-line'
		);
	});

	it('marks selected block code lines', () => {
		const game = new GameModel(MOCK_LEVEL);
		game.status = 'planning';
		game.program = [
			{ id: 'move-1', type: 'move-forward' },
			{ id: 'turn-1', type: 'turn-left' }
		];
		interactionManager.select('move-1');

		const { container } = render(CodeView, { game });

		expect(container.querySelector('[data-block-ids="move-1"]')).toHaveClass('selected-code-line');
		expect(container.querySelector('[data-block-ids="turn-1"]')).not.toHaveClass(
			'selected-code-line'
		);
	});

	it('renders playback controls and delegates actions', () => {
		const game = new GameModel(MOCK_LEVEL);
		game.status = 'planning';
		game.program = [{ id: 'move-1', type: 'move-forward' }];
		const onRunControl = vi.fn();
		const onStepBack = vi.fn();
		const onStepForward = vi.fn();
		const onReset = vi.fn();

		const { container } = render(CodeView, {
			game,
			controls: {
				runControl: { label: 'Play', action: 'play', disabled: false },
				onRunControl,
				onStepBack,
				onStepForward,
				onReset,
				canStepBack: false,
				canStepForward: true,
				canReset: true
			}
		});

		const playButton = container.querySelector('button[aria-label="Play"]') as HTMLButtonElement;
		const backButton = container.querySelector(
			'button[aria-label="Step Back"]'
		) as HTMLButtonElement;
		const stepButton = container.querySelector(
			'button[aria-label="Step Forward"]'
		) as HTMLButtonElement;
		const resetButton = container.querySelector('button[aria-label="Reset"]') as HTMLButtonElement;

		expect(playButton).toBeInTheDocument();
		expect(backButton.disabled).toBe(true);
		expect(stepButton.disabled).toBe(false);
		expect(resetButton.disabled).toBe(false);

		playButton.click();
		stepButton.click();
		resetButton.click();

		expect(onRunControl).toHaveBeenCalledOnce();
		expect(onStepForward).toHaveBeenCalledOnce();
		expect(onReset).toHaveBeenCalledOnce();
		expect(onStepBack).not.toHaveBeenCalled();
	});
});
